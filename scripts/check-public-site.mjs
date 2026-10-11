import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { publicPaths, getPageMetadata } from "../src/lib/pageMetadata.js";
import { publicReviews, sampleQuestions } from "../src/data/publicReviews.js";

const config = JSON.parse(await readFile("vercel.json", "utf8"));
const pageHtml = new Map();
for (const path of publicPaths) {
  const file = path === "/" ? "index.html" : `${path.slice(1)}.html`;
  const html = await readFile(`dist/${file}`, "utf8");
  pageHtml.set(path, html);
  assert(html.includes('name="google-adsense-account" content="ca-pub-4637994459722699"'), `${path}: ownership verification missing`);
  assert(!html.includes('adsbygoogle.js'), `${path}: ad serving must remain disabled during review preparation`);
  assert.match(html, /<h1[\s>]/, `${path}: missing heading`);
  assert(html.includes(`href="${getPageMetadata(path).canonical}"`), `${path}: canonical missing`);
  assert(html.includes('content="index,follow"'), `${path}: not indexable`);
  assert.equal((html.match(/<footer/g) || []).length, 1, `${path}: duplicated or absent footer`);
  for (const link of ["/about", "/contact", "/privacy", "/terms", "/quick-reviews", "/sample-questions"]) {
    assert(html.includes(`href="${link}"`), `${path}: missing navigation to ${link}`);
  }
  if (path !== "/") assert(config.rewrites.some(r => r.source === path && r.destination === `/${file}`), `${path}: missing hosting route`);
}
for (const [path, html] of pageHtml) {
  for (const match of html.matchAll(/href="(\/[^"?]*)"/g)) {
    const [target, fragment] = match[1].split("#");
    if (target.startsWith("/assets/") || ["/favicon.svg", "/user-login", "/user-signup"].includes(target)) continue;
    assert(pageHtml.has(target), `${path}: broken internal link ${target}`);
    if (fragment) assert(pageHtml.get(target).includes(`id="${fragment}"`), `${path}: missing linked section ${match[1]}`);
  }
}
for (const question of sampleQuestions) {
  assert(question.options.includes(question.answer), `Question ${question.id}: invalid answer`);
  assert.equal(question.optionExplanations.length, question.options.length);
  assert(publicReviews.some(review => review.slug === question.reviewSlug));
  assert(pageHtml.get("/sample-questions").includes(question.explanation.replaceAll("&", "&amp;")), `Question ${question.id}: explanation requires JavaScript`);
}
for (const filename of ["app-shell.html", "404.html"]) {
  const html = await readFile(`dist/${filename}`, "utf8");
  assert(!html.includes('adsbygoogle.js'), `${filename}: unexpected ad loader`);
  assert(html.includes("noindex,follow"), `${filename}: missing noindex`);
  assert(!html.includes('rel="canonical"'), `${filename}: should not inherit a public canonical`);
}
assert(!config.rewrites.some(route => route.source === "/(.*)"), "Wildcard rewrite would mask missing URLs");
assert(!config.cleanUrls, "Preserve the exact Google HTML verification URL");
const verification = "google80a2cebe0904e732.html";
assert.equal(await readFile(`dist/${verification}`, "utf8"), await readFile(`public/${verification}`, "utf8"));
assert.equal(await readFile("dist/ads.txt", "utf8"), await readFile("public/ads.txt", "utf8"));
const app = await readFile("src/App.jsx", "utf8");
for (const review of publicReviews) {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(review.updatedAt), `${review.slug}: explicit editorial date required`);
  assert(pageHtml.get(`/quick-reviews/${review.slug}`).includes(`dateTime="${review.updatedAt}"`), `${review.slug}: editorial date missing from markup`);
}
for (const match of app.matchAll(/path="([^"]+)"/g)) {
  const path = match[1];
  if (publicPaths.includes(path) || ["/privacy-policy", "/quick-reviews/:slug", "*"].includes(path)) continue;
  assert(config.rewrites.some(r => r.source === path && r.destination === "/app-shell.html"), `${path}: private route missing`);
  assert(config.headers.some(h => h.source === path && h.headers.some(v => v.key === "X-Robots-Tag" && v.value.includes("noindex"))), `${path}: private indexing header missing`);
}
const sitemap = await readFile("dist/sitemap.xml", "utf8");
assert.equal((sitemap.match(/<loc>/g) || []).length, publicPaths.length);
console.log(`PASS: ${publicPaths.length} rendered public pages, internal links and fragments, ${sampleQuestions.length} answers, private routes, 404 metadata, verification file and sitemap.`);
