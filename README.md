# Shivay Innovations Website

A responsive, single-page static website built from the supplied Shivay Innovations portfolio and the latest client-edited project files. The original layout, styles, images, sections and existing interactions are retained.

## Preview locally

1. Extract this ZIP.
2. Open `index.html` in a modern browser, or run a static server from this folder:

   ```bash
   python -m http.server 8000
   ```

3. Visit `http://localhost:8000`.

This is a static HTML/CSS/JavaScript website. It does not need `npm install` or a `package.json` file.

## Contact form email delivery

The contact form sends submissions to **Shalinijadaun321@gmail.com** using FormSubmit's hosted form endpoint. No custom Node.js backend, package installation, database, or environment variables are required.

### One-time activation required

1. Deploy the website to your Vercel URL.
2. Open the live website and submit one test enquiry using an email address you can access.
3. Check `Shalinijadaun321@gmail.com` for FormSubmit's activation/confirmation email.
4. Click the confirmation link in that email. The form will not deliver customer enquiries until this email address is confirmed.
5. Submit another test enquiry and confirm that the details arrive in the Gmail inbox. Check Spam if you do not see it.

The form uses FormSubmit's AJAX endpoint so visitors remain on the website and see an inline success or error message. If JavaScript is unavailable, the form's normal POST action provides a fallback submission path.

FormSubmit is an external service that processes the form data and delivers it by email. Review its documentation and privacy terms before using it for customer information:

- https://formsubmit.co/documentation
- https://formsubmit.co/privacy.pdf

## Structure

- `index.html` — website content and contact form
- `style..css` — existing website styling (filename retained as supplied)
- `script.js` — navigation, animations and email form submission
- `assets/` — company logo and service/portfolio images

## Before publishing

- Confirm that `Shalinijadaun321@gmail.com` is the correct enquiry inbox.
- Confirm service availability, package prices, taxes and payment milestones before publishing.
- Add the official domain and social profile links when available.
- Portfolio industry cards are presented as illustrative design directions, not completed-client case studies.
