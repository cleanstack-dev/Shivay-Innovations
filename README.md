# Shivay Innovations Website

A responsive, single-page static website built from the supplied Shivay Innovations portfolio and the latest client-edited project files. The original layout, styles, images, sections and existing interactions are retained.

## Preview locally

1. Extract this ZIP.
2. Open `index.html` in a modern browser, or run a static server from this folder:

   ```bash
   python -m http.server 8000
   ```

3. Visit `http://localhost:8000`.

This is a static HTML/CSS/JavaScript website plus one serverless function with no npm dependencies. To test the form locally use `vercel dev` with the environment variables set.

## Contact form email delivery (Vercel + Resend)

The form posts to `/api/contact` (`api/contact.js`, a Vercel serverless function). It emails the enquiry to **jshalini174@gmail.com** through Resend using your own domain, so it arrives in about a second and lands in the inbox, not spam. The visitor also gets an automatic "we received your enquiry" email. Replying to the enquiry email replies straight to the customer.

### One-time setup (about 10 minutes)

1. Create a free account at https://resend.com (3,000 emails/month free).
2. In Resend > **Domains** > Add Domain, enter your domain. Resend shows DNS records (SPF, DKIM, and optionally DMARC). Add them where you bought the domain (the DNS settings page) and click Verify. **This step is what stops spam-folder delivery.**
3. In Resend > **API Keys**, create a key and copy it.
4. In Vercel > your project > Settings > **Environment Variables**, add:
   - `RESEND_API_KEY` = the key from step 3
   - `CONTACT_FROM` = `Shivay Innovations <enquiry@yourdomain.com>` (use your real domain)
   - Optional: `CONTACT_TO` (default is jshalini174@gmail.com), `AUTO_REPLY=off` to disable the visitor confirmation email
5. Redeploy (Deployments > ... > Redeploy), then send a test enquiry from the live site.
6. First time only: if the test email lands in Spam in Gmail, open it and click **Not spam**.

The old FormSubmit service is no longer used.

## Structure

- `index.html` — website content and contact form
- `style..css` — existing website styling (filename retained as supplied)
- `script.js` — navigation, animations and form submission
- `api/contact.js` — serverless function that sends the enquiry email
- `vercel.json` — caching and security headers
- `assets/` — company logo and service/portfolio images

## Before publishing

- Confirm that `Shalinijadaun321@gmail.com` is the correct enquiry inbox.
- Confirm service availability, package prices, taxes and payment milestones before publishing.
- Add the official domain and social profile links when available.
- Portfolio industry cards are presented as illustrative design directions, not completed-client case studies.
