import { useNavigate } from "react-router-dom";
import PublicFooter from "../components/PublicFooter";

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
  blobField: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    overflow: "hidden",
    pointerEvents: "none",
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

function TermsPage() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @keyframes fadeUp {
           from  { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes driftA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-22px, 18px) scale(1.04); }
        }
        .terms-enter { animation: fadeUp 0.4s ease both; }
        .blob-a {
          position  : absolute; top: -130px; right: -150px;
          width     : 380px; height: 380px;
          background: 
            radial-gradient(circle at 27% 24%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 24%),
            radial-gradient(circle at 62% 70%, #7dd8ff 0%, #33b5f0 32%, #1a7fd4 58%, #0f5aa6 80%, #0a3f7a 100%);
          border-radius: 55% 45% 60% 40% / 45% 55% 45% 55%;
          filter: blur(1px);
          box-shadow: 0 50px 90px -25px rgba(15, 90, 166, 0.35);
          animation: driftA 18s ease-in-out infinite;
        }
      `}</style>

      <main style={S.page}>
        <div style={S.blobField}>
          <div className="blob-a" />
        </div>

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

          <article className="terms-enter" style={S.card}>
            <span style={S.eyebrow}>Legal</span>
            <h1 style={S.title}>Terms of Service</h1>
            <p style={S.updated}>Last updated: June 2026</p>

            <Section title="Acceptance of Terms">
              By accessing or using Bambo Exam Practice, you agree to these
              Terms of Service. If you do not agree, please do not use the
              platform.
            </Section>

            <Section title="Educational Purpose">
              The platform provides educational practice questions,
              explanations, progress tracking, and study support. It is intended
              for revision and learning support only.
            </Section>

            <Section title="User Accounts">
              Users are responsible for keeping their login details secure and
              for all activity under their accounts. Do not share accounts or
              attempt to access another user's account.
            </Section>

            <Section title="Acceptable Use">
              Users must not disrupt the platform, upload harmful content,
              attempt unauthorised access, misuse the contact or request
              features, or copy platform content for unauthorised
              redistribution.
            </Section>

            <Section title="Accuracy of Content">
              We aim to provide useful and accurate educational content, but we
              do not guarantee that all questions, answers, explanations, or
              materials are free from error. Users should verify important
              academic or professional information.
            </Section>

            <Section title="Changes to the Platform">
              We may update, modify, suspend, or remove features, content, or
              pages at any time to improve the service.
            </Section>

            <Section title="Contact">
              For questions about these terms, please use the Contact Us page.
            </Section>
          </article>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}

export default TermsPage;
