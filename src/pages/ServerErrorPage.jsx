import { useEffect } from "react";
import S from "./errorStyles";
// Also used outside the router by the outer error boundary.
export default function ServerErrorPage() {
  useEffect(() => {
    document.title = "Something went wrong | Bambo";
    const meta = document.querySelector('meta[name="robots"]') || document.createElement("meta");
    meta.name = "robots"; meta.content = "noindex,follow";
    if (!meta.parentNode) document.head.appendChild(meta);
    document.querySelector('link[rel="canonical"]')?.remove();
  }, []);
  return <main style={S.page}><div style={S.card}>
    <h1>Something went wrong</h1>
    <p style={S.body}>We could not display this page. Reload to try again, or return to the public study library.</p>
    <div style={S.actions}>
      <button style={S.primaryButton} onClick={() => window.location.reload()}>Reload page</button>
      <a style={S.secondaryButton} href="/quick-reviews">Read Quick Reviews</a>
      <a style={S.secondaryButton} href="/">Home</a>
    </div>
  </div></main>;
}
