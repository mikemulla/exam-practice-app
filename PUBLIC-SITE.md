# Public site maintenance

Run `npm run build` followed by `npm run check:public` before deployment. The build creates complete HTML for the 20 public URLs, a private application shell, a custom 404 page and the sitemap. Deploy `dist` using the checked-in Vercel configuration. Vite preview checks rendering but does not reproduce Vercel redirects, response headers or 404 routing.

Public route metadata lives in `src/lib/pageMetadata.js`. When adding a public page, update the route, metadata and explicit Vercel rewrite/redirect together. Keep private routes mapped to `app-shell.html` with noindex headers. Do not restore a catch-all rewrite: it would turn missing URLs into successful application responses. Do not enable global cleanUrls: the Google verification HTML file must remain available at its exact address.

Review content lives in `src/data/publicReviews.js` and `src/data/reviewEnrichment.js`; questions live in `src/data/sampleQuestions.js`. Check linked sources and clinical statements before publishing changes. Dates describe editorial updates, not independent clinical review. The site explicitly discloses AI assistance and does not claim a medical reviewer. References do not imply endorsement.

The AdSense script remains in `index.html`. Auto Ads settings are managed separately in AdSense. These changes do not change those settings or guarantee approval.

The contact form also needs the companion backend update. Its response now waits for the email provider to accept the message, with a 15-second provider timeout. Provider acceptance is not proof of inbox delivery. Run `npm run test:contact` in the backend to check the mocked success and failure paths without sending email.

After deployment, check a public article, a private sign-in URL (noindex), a missing URL (HTTP 404), the Google verification file and a real authorized contact-form submission before requesting another AdSense review.
