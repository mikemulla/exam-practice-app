import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { render } from "../dist-ssr/entry-server.js";
import { getPageMetadata, publicPaths, SITE_URL } from "../src/lib/pageMetadata.js";

const output = resolve("dist");
const template = await readFile(resolve(output, "index.html"), "utf8");
const escape = value => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function htmlFor(path, body) {
  const page = getPageMetadata(path);
  return template
    .replace(/<title>.*?<\/title>/s, `<title>${escape(page.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/g, "")
    .replace(/<meta name="robots"[^>]*>/g, "")
    .replace(/<link rel="canonical"[^>]*>/g, "")
    .replace("</head>", `<meta name="description" content="${escape(page.description)}" />\n<meta name="robots" content="${page.indexable ? "index,follow" : "noindex,follow"}" />\n${page.canonical ? `<link rel="canonical" href="${escape(page.canonical)}" />` : ""}\n</head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}
// Valid account and test URLs use a neutral shell, never the homepage's metadata.
await writeFile(resolve(output, "app-shell.html"), htmlFor("/user-login", ""));
for (const path of publicPaths) {
  const file = resolve(output, path === "/" ? "index.html" : `${path.slice(1)}.html`);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, htmlFor(path, render(path)));
}
await writeFile(resolve(output, "404.html"), htmlFor("/404", render("/404")));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPaths.map(path => `  <url><loc>${SITE_URL}${path}</loc></url>`).join("\n")}\n</urlset>\n`;
await writeFile(resolve(output, "sitemap.xml"), sitemap);
console.log(`Prerendered ${publicPaths.length} public pages, a private shell and a 404 page.`);
