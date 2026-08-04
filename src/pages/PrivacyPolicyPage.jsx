import { useNavigate } from "react-router-dom";
import PublicFooter from "../components/PublicFooter";
import BlobBackground from "../components/BlobBackground";

function Section({ title, children }) {
  return (
    <section style={S.section}>
      <h2 style={S.sectionTitle}>{title}</h2>
      <p style={S.text}>{children}</p>
    </section>
  );
}

const S = {
  page: {
    minHeight: "100vh",
    background: "var(--bg-primary)",
    position: "relative",
    overflow: "hidden",
  },

  inner: {
    position: "relative",
    zIndex: 1,
    maxWidth: "900px",
    margin: "0 auto",
    padding: "2.5rem 1.25rem 4rem",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "1.5rem",
    padding: "7px 14px",
    border: "0.5px solid var(--border-color)",
    borderRadius: "8px",
    background: "var(--bg-secondary)",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  card: {
    background: "var(--bg-secondary)",
    border: "0.5px solid var(--border-color)",
    borderRadius: "18px",
    padding: "2rem",
  },
  eyebrow: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--button-primary)",
    background: "var(--surface-alt)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    padding: "6px 12px",
    borderRadius: "999px",
    marginBottom: "1rem",
  },
  title: {
    margin: 0,
    color: "var(--text-primary)",
    fontSize: "clamp(28px, 5vw, 40px)",
    letterSpacing: "-0.02em",
    fontWeight: 600,
  },
  updated: {
    color: "var(--text-secondary)",
    fontSize: "13px",
    margin: "10px 0 0",
  },
  section: {
    borderTop: "0.5px solid var(--border-color)",
    paddingTop: "1.5rem",
    marginTop: "1.5rem",
  },
  sectionTitle: {
    margin: "0 0 8px",
    color: "var(--text-primary)",
    fontSize: "17px",
    fontWeight: 600,
    letterSpacing: "-0.01em",
  },
  text: {
    margin: 0,
    color: "var(--text-secondary)",
    lineHeight: 1.8,
    fontSize: "14.5px",
  },
};

function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @keyframes fadeUp {
           from  { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <main style={S.page}>
        <BlobBackground amount="compact" orientation="long" />

        <div style={S.inner}>
          <button
            onClick={() => navigate("/")}
            style={S.backBtn}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--surface-alt)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")
            }
          >
            ← Back
          </button>

          <article className="privacy-enter" style={S.card}>
            <span style={S.eyebrow}>Legal</span>
            <h1 style={S.title}>Privacy Policy</h1>
            <p style={S.updated}>Last updated: June 2026</p>

            <Section title="Information We Collect">
              We may collect information you provide when creating an account or
              using the platform, including your name, email address, course,
              level, subject requests, contact messages, test activity, scores,
              badges, and progress data.
            </Section>

            <Section title="How We Use Information">
              We use this information to provide access to practice questions,
              track learning progress, improve the platform, send important
              notifications, respond to support messages, and manage subject or
              topic requests.
            </Section>

            <Section title="Cookies and Local Storage">
              The platform may use cookies, browser storage, and similar
              technologies to keep users logged in, remember preferences such as
              dark mode, support analytics, and improve user experience.
            </Section>

            <Section title="Google AdSense and Analytics">
              Third-party vendors, including Google, may use cookies to serve
              ads, measure ad performance, and provide analytics. Google may use
              advertising cookies based on visits to this and other websites.
            </Section>

            <Section title="Data Security">
              We take reasonable steps to protect user information from
              unauthorised access, loss, misuse, or disclosure. No online
              service can guarantee absolute security.
            </Section>

            <Section title="User Choices">
              Users may contact us to ask questions about their information or
              to request assistance with their account.
            </Section>

            <Section title="Contact">
              For questions about this Privacy Policy or the platform, please
              use the Contact Us page.
            </Section>
          </article>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}

export default PrivacyPolicyPage;