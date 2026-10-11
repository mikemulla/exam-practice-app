import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getPageMetadata } from "../lib/pageMetadata";

export default function RouteMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const page = getPageMetadata(pathname);
    document.title = page.title;
    for (const [name, content] of Object.entries({ description: page.description, robots: page.indexable ? "index,follow" : "noindex,follow" })) {
      const meta = document.querySelector(`meta[name="${name}"]`) || document.createElement("meta");
      meta.name = name;
      meta.content = content;
      if (!meta.parentNode) document.head.appendChild(meta);
    }
    const existing = document.querySelector('link[rel="canonical"]');
    if (page.canonical) {
      const canonical = existing || document.createElement("link");
      canonical.rel = "canonical";
      canonical.href = page.canonical;
      if (!canonical.parentNode) document.head.appendChild(canonical);
    } else existing?.remove();
  }, [pathname]);
  return null;
}
