import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToContent() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      let id = hash.slice(1);
      try { id = decodeURIComponent(id); } catch { /* Malformed fragment: use it literally. */ }
      const target = id ? document.getElementById(id) : null;
      if (target) target.scrollIntoView();
      else window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return null;
}
