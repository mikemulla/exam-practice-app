import { Outlet } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";
import ScrollToContent from "./ScrollToContent";
export default function PublicLayout() {
  return <div className="public-site" style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
    <ScrollToContent />
    <a className="skip-link" href="#public-content">Skip to content</a>
    <PublicNavbar />
    <div id="public-content" tabIndex={-1}><Outlet /></div>
    <PublicFooter />
  </div>;
}
