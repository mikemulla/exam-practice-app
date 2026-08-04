import { Link } from "react-router-dom";
export default function PublicFooter() {
  return (
    <>
      <style>{`.public-footer{border-top:1px solid var(--border-color);background:var(--bg-secondary)}.footer-inner{max-width:1180px;margin:auto;padding:36px 20px;display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:34px}.footer-inner h2,.footer-inner h3{color:var(--text-primary);margin:0 0 12px}.footer-inner p,.footer-inner a{color:var(--text-secondary);font-size:13px;line-height:1.7;text-decoration:none}.footer-links{display:flex;flex-direction:column;gap:8px}.footer-bottom{max-width:1180px;margin:auto;padding:18px 20px;border-top:1px solid var(--border-color);color:var(--text-secondary);font-size:12px}@media(max-width:700px){.footer-inner{grid-template-columns:1fr}}`}</style>
      <footer className="public-footer">
        <div className="footer-inner">
          <div>
            <h2>Bambo</h2>
            <p>
              Focused exam preparation with structured reviews, sample
              questions, detailed explanations, and personalized practice.
            </p>
          </div>
          <div>
            <h3>Learn</h3>
            <div className="footer-links">
              <Link to="/quick-reviews">Quick Reviews</Link>
              <Link to="/sample-questions">Sample Questions</Link>
              <Link to="/user-signup">Create account</Link>
            </div>
          </div>
          <div>
            <h3>Company</h3>
            <div className="footer-links">
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} Bambo. All rights reserved.
        </div>
      </footer>
    </>
  );
}
