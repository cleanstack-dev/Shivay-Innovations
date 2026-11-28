/**
 * Vercel serverless function: POST /api/contact
 *
 * Sends the website enquiry to the business inbox through Resend's HTTPS API
 * using YOUR verified domain (SPF + DKIM), which is what keeps mail out of spam
 * and makes delivery take ~1 second instead of minutes.
 *
 * Required environment variables (Vercel > Project > Settings > Environment Variables):
 *   RESEND_API_KEY  API key from resend.com
 *   CONTACT_FROM    e.g.  Shivay Innovations <enquiry@yourdomain.com>   (domain must be verified in Resend)
 * Optional:
 *   CONTACT_TO      inbox that receives enquiries (default: jshalini174@gmail.com)
 *   AUTO_REPLY      set to "off" to disable the confirmation email sent to the visitor
 */

const DEFAULT_TO = 'jshalini174@gmail.com';
const RESEND_URL = 'https://api.resend.com/emails';
const SEND_TIMEOUT_MS = 8000;

const LIMITS = { name: 100, email: 150, phone: 30, service: 100, message: 5000 };
const SERVICES = [
  'Website Design & Development', 'Mobile App Development', 'CRM & ERP Solutions',
  'SEO & Digital Marketing', 'Social Media Management', 'Maintenance & Support', 'Not sure yet'
];

// Best-effort per-instance rate limit (blocks rapid-fire bots; resets on cold start).
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now(), windowMs = 10 * 60 * 1000, max = 5;
  const list = (hits.get(ip) || []).filter(t => now - t < windowMs);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 500) for (const [k, v] of hits) if (!v.some(t => now - t < windowMs)) hits.delete(k);
  return list.length > max;
}

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (v, max) => (typeof v === 'string' ? v : '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
const oneLine = s => s.replace(/[\r\n]+/g, ' ');

async function sendMail(payload, apiKey) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), SEND_TIMEOUT_MS);
  try {
    const r = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      throw new Error(`Resend ${r.status}: ${detail.slice(0, 300)}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

function parseBody(req) {
  let b = req.body;
  if (typeof b === 'string') {
    try { b = JSON.parse(b); } catch (_) { b = Object.fromEntries(new URLSearchParams(b)); }
  }
  return b && typeof b === 'object' ? b : {};
}

module.exports = async function handler(req, res) {
  const wantsJson = /application\/json/.test(req.headers.accept || '') || /application\/json/.test(req.headers['content-type'] || '');
  const reply = (status, body) => {
    if (wantsJson) return res.status(status).json(body);
    // Non-JavaScript fallback: go back to the page with a status flag.
    res.setHeader('Location', `/?enquiry=${body.success ? 'sent' : 'error'}#contact`);
    return res.status(303).end();
  };

  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const body = parseBody(req);

  // Honeypot: real visitors never fill this. Pretend success so bots move on.
  if (clean(body._honey, 200)) return reply(200, { success: true });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return reply(429, { success: false, message: 'Too many requests. Please try again later.' });

  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email);
  const phone = clean(body.phone, LIMITS.phone);
  const service = clean(body.service, LIMITS.service);
  const message = clean(body.message, LIMITS.message);

  if (!name || !email || !message) return reply(400, { success: false, message: 'Please fill in your name, email and project details.' });
  if (!/^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/.test(email)) return reply(400, { success: false, message: 'Please enter a valid email address.' });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;
  const to = process.env.CONTACT_TO || DEFAULT_TO;
  if (!apiKey || !from) {
    console.error('Contact form misconfigured: RESEND_API_KEY and CONTACT_FROM must be set in Vercel.');
    return reply(500, { success: false, message: 'Email service is not configured.' });
  }

  const svc = SERVICES.includes(service) ? service : (service || 'Not specified');
  const row = (k, v) => `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;width:150px;vertical-align:top">${k}</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${v}</td></tr>`;
  const ownerHtml = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#111827">
    <h2 style="margin:0 0 12px">New project enquiry</h2>
    <table style="border-collapse:collapse;width:100%;max-width:640px">
      ${row('Name', esc(name))}${row('Email', `<a href="mailto:${esc(email)}">${esc(email)}</a>`)}${row('Phone', esc(phone) || '—')}${row('Service', esc(svc))}
      ${row('Project details', esc(message).replace(/\n/g, '<br>'))}
    </table>
    <p style="color:#6b7280;font-size:13px;margin-top:16px">Press Reply to respond directly to ${esc(name)}.</p></div>`;
  const ownerText = `New project enquiry\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || '-'}\nService: ${svc}\n\nProject details:\n${message}\n`;

  const jobs = [sendMail({
    from, to: [to], reply_to: email,
    subject: oneLine(`New enquiry from ${name} — Shivay Innovations`).slice(0, 200),
    html: ownerHtml, text: ownerText
  }, apiKey)];

  if ((process.env.AUTO_REPLY || '').toLowerCase() !== 'off') {
    const firstName = esc(name.split(/\s+/)[0]);
    jobs.push(sendMail({
      from, to: [email], reply_to: to,
      subject: 'We received your enquiry — Shivay Innovations',
      html: `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#111827;line-height:1.6">
        <p>Hi ${firstName},</p>
        <p>Thank you for contacting Shivay Innovations. We have received your enquiry and will get back to you soon.</p>
        <p>If it is urgent, you can also reach us on +91 63965 99665.</p>
        <p>Regards,<br>Shivay Innovations</p></div>`,
      text: `Hi ${name.split(/\s+/)[0]},\n\nThank you for contacting Shivay Innovations. We have received your enquiry and will get back to you soon.\nIf it is urgent, you can also reach us on +91 63965 99665.\n\nRegards,\nShivay Innovations\n`
    }, apiKey));
  }

  const [owner, ack] = await Promise.allSettled(jobs);
  if (ack && ack.status === 'rejected') console.error('Auto-reply failed:', ack.reason && ack.reason.message);
  if (owner.status === 'rejected') {
    console.error('Enquiry email failed:', owner.reason && owner.reason.message);
    return reply(502, { success: false, message: 'The enquiry could not be sent.' });
  }
  return reply(200, { success: true });
};
