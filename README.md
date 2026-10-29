# FORM / Auto detailing

Independent portfolio demo for a fictional detailing studio in Yerevan. This folder is a standalone project. It does not depend on or modify barber or nail-studio.

## Run

From this directory:

```sh
python3 -m http.server 4174 --directory site
```

Open http://localhost:4174/ (Armenian), /ru.html or /en.html. No build, install, account, or API key is required. HTML/CSS and vanilla JavaScript match the existing portfolio stack.

## Netlify — separate project and separate repository

- Base directory: leave empty
- Build command: leave empty
- Publish directory: `site`
- Functions directory: `netlify/functions`

`netlify.toml` provides these paths. Connect only the separate detailing repository. Do not select the barber or nail-studio repositories.

## Demo request

Five steps: service/package/advice, vehicle, comment/photos, contact details, review. Service and package links preselect an editable option. All form values and photos survive backward/forward navigation in the current tab. Reloading or changing language clears the form; language links preserve the current visible section.

The demo never calls a server or stores personal information in localStorage, cookies, or analytics. Photos are JPEG/PNG/WebP, at most 5, at most 10 MiB each, decoded before accepting, previewed through object URLs and removable. Removed, reset and unloaded photo URLs are revoked. Completion explicitly says that no data was sent and no appointment was booked.

Catalogue, illustrative starting prices, durations and every language are in `site/data.js`. All quoted prices depend on condition, size and scope; no final quote or fake availability is calculated. Ceramic coating is not described as equivalent to PPF stone-chip protection.

## Real delivery — intentionally NOT enabled

`site/integrations.js` is the offline adapter seam. Its submit method reports `{mode:'demo',sent:false}`. `netlify/functions/estimate.js` is a server-only scaffold and always returns HTTP 503 with `sent:false`; entering credentials alone cannot enable delivery.

To make it real:

1. Confirm the actual business, contact details, pricing, product care instructions and privacy/consent terms.
2. Implement server validation and abuse controls/rate limiting for the Netlify endpoint. Repeat file count, actual file signature, decoded type and size checks on the server; never trust browser checks.
3. Add private photo storage and a deletion/retention policy. Multipart uploads may exceed function limits: use signed direct uploads with a server-verified private object reference if necessary.
4. Implement Telegram notification on the server, using TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID from Netlify environment settings.
5. Implement an authenticated CRM or Google Sheets webhook using CRM_WEBHOOK_URL and CRM_WEBHOOK_SECRET. Restrict outbound destinations; never expose credentials to the frontend.
6. Replace the demo adapter with a real client and handle partial delivery, failures, retries and duplicate submissions. Show a sent confirmation only after verified delivery. An enquiry remains a request for assessment, not a confirmed booking.

`.env.example` contains names only, no secrets. Do not commit `.env` files. No real integration, calendar, CRM, payment or bot is shipped.

## Analytics seam

Listen for `window` event `form:analytics`. Only a fixed event allowlist is emitted: `cta_click`, `goal_select`, `gallery_filter`, `form_step`, `demo_request_complete`. Properties are allowlisted: step, catalogue option, category and source. No names, phone numbers, vehicle text, comments, filenames or photographs. There is no analytics provider or network transmission. `demo_request_complete` must never be mapped to a real lead conversion.

## Images and demo integrity

Stock photos downloaded from Unsplash image delivery; they do not show FORM work. There are no fabricated before/after pairs, reviews, credentials or experience statistics.

- Hero / Porsche Panamera: https://images.unsplash.com/photo-1503376780353-7e6692767b70
- Chevrolet Camaro: https://images.unsplash.com/photo-1492144534655-ae79c964c9d7
- Jaguar F-Type: https://images.unsplash.com/photo-1507136566006-cfc505b114fc
- Ferrari 458: https://images.unsplash.com/photo-1503736334956-4c8f8e92946d

The local images are resized/encoded by the source CDN. Non-hero images load lazily. The UI uses exactly graphite, white and orange, plus transparent graphite borders; no gradients.
