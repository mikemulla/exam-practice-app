import { Link } from "react-router-dom";
import S from "./errorStyles";
export default function NotFoundPage() {
  return <main style={S.page}><div style={S.card}>
    <p style={S.eyebrow}>Page not found</p><h1 style={S.code}>404</h1>
    <p style={S.body}>This page does not exist or the address has changed. Find a study topic in the public library, or start from the homepage.</p>
    <div style={S.actions}><Link style={S.primaryButton} to="/quick-reviews">Browse Quick Reviews</Link><Link style={S.secondaryButton} to="/">Home</Link><Link style={S.secondaryButton} to="/contact">Report a broken link</Link></div>
  </div></main>;
}
