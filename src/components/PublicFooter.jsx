import { Link } from "react-router-dom";

function PublicFooter() {
  return (
    <footer style={S.footer}>
      <div style={S.inner}>
        <div>
          <h3 style={S.brand}>Bambo Exam Practice</h3>
          <p style={S.text}>
            Helping students practise smarter, track progress, and prepare with
            confidence.
          </p>
        </div>

        <div style={S.links}>
          <Link to="/" style={S.link}>
            Home
          </Link>
          <Link to="/about" style={S.link}>
            About
          </Link>
          <Link to="/contact" style={S.link}>
            Contact
          </Link>
          <Link to="/privacy-policy" style={S.link}>
            Privacy Policy
          </Link>
          <Link to="/terms" style={S.link}>
            Terms
          </Link>
        </div>

        <p style={S.copy}>© 2026 Bambo Exam Practice. All rights reserved.</p>
      </div>
    </footer>
  );
}

const S = {
  footer: {
    background: "var(--bg-secondary)",
    borderTop: "1px solid var(--border-color)",
    padding: "32px 18px",
  },
  inner: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gap: "18px",
  },
  brand: {
    margin: "0 0 8px",
    color: "var(--text-primary)",
    fontSize: "18px",
    fontWeight: 800,
  },
  text: {
    margin: 0,
    color: "var(--text-secondary)",
    fontSize: "14px",
    lineHeight: 1.7,
    maxWidth: "560px",
  },
  links: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px 18px",
  },
  link: {
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 700,
  },
  copy: {
    margin: 0,
    color: "var(--text-secondary)",
    fontSize: "13px",
  },
};

export default PublicFooter;
