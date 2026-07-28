import { Link, useNavigate } from "react-router-dom";
import PublicFooter from "../components/PublicFooter";

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
      <path
        d="M5 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const FEATURES = [
  {
    icon: "🎯",
    title: "Focused Practice",
    text: "Practise by subject or topic so your revision stays organised and targeted.",
  },
  {
    icon: "🔀",
    title: "Randomized Tests",
    text: "Mix questions across topics and choose how many questions you want to answer.",
  },
  {
    icon: "📈",
    title: "Progress Tracking",
    text: "Use your dashboard to monitor performance, completed tests, and improvement over time.",
  },
  {
    icon: "🏆",
    title: "Achievements",
    text: "Earn badges and celebrate progress as you build better study habits.",
  },
  {
    icon: "📩",
    title: "Content Requests",
    text: "Request subjects or topics that are not yet available on the platform.",
  },
  {
    icon: "🌙",
    title: "Mobile Friendly",
    text: "Study comfortably on desktop or mobile with a clean interface and dark mode support.",
  },
];

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
    maxWidth: "1080px",
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
  hero: {
    background: "var(--bg-secondary)",
    border: "0.5px solid var(--border-color)",
    borderRadius: "20px",
    padding: "2.5rem",
    marginBottom: "2rem",
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
    fontSize: "clamp(30px, 5.5vw, 46px)",
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
    fontWeight: 600,
    maxWidth: "720px",
  },
  subtitle: {
    margin: "1rem 0 0",
    color: "var(--text-secondary)",
    fontSize: "15px",
    lineHeight: 1.75,
    maxWidth: "620px",
  },
  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "1.75rem",
  },
  primaryLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "11px 18px",
    borderRadius: "10px",
    background: "var(--button-primary)",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "13.5px",
    letterSpacing: "-0.01em",
    transition: "transform 0.15s",
  },
  secondaryLink: {
    padding: "11px 18px",
    borderRadius: "10px",
    background: "var(--surface-alt)",
    color: "var(--button-primary)",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "13.5px",
    letterSpacing: "-0.01em",
    transition: "transform 0.15s",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
    gap: "16px",
  },
  card: {
    background: "var(--bg-secondary)",
    border: "0.5px solid var(--border-color)",
    borderRadius: "14px",
    padding: "1.5rem",
    transition: "all 0.2s ease",
  },
  cardHover: {
    borderColor: "rgba(24, 95, 165, 0.25)",
    boxShadow: "0 8px 32px rgba(24,95,165,0.10), 0 2px 8px rgba(0,0,0,0.06)",
    transform: "translateY(-2px)",
  },
  iconBubble: {
    width: "44px",
    height: "44px",
    borderRadius: "11px",
    background: "var(--surface-alt)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1.1rem",
    fontSize: "20px",
  },
  cardTitle: {
    margin: "0 0 8px",
    color: "var(--text-primary)",
    fontSize: "16px",
    fontWeight: 600,
    letterSpacing: "-0.01em",
  },
  cardText: {
    margin: 0,
    color: "var(--text-secondary)",
    fontSize: "13.5px",
    lineHeight: 1.7,
  },
  statement: {
    maxWidth: "1080px",
    margin: "2rem auto 0",
    background: "var(--button-primary)",
    borderRadius: "20px",
    padding: "2.25rem",
    color: "#fff",
  },
  sectionTitle: {
    margin: "0 0 10px",
    fontSize: "20px",
    fontWeight: 600,
  },
  sectionText: {
    margin: 0,
    opacity: 0.92,
    lineHeight: 1.8,
    fontSize: "14.5px",
    maxWidth: "760px",
  },
};

function FeatureCard({ item, index }) {
  return (
    <div
      className="about-card-enter"
      style={{ ...S.card, animationDelay: `${index * 50}ms` }}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, S.cardHover)}
      onMouseLeave={(e) =>
        Object.assign(e.currentTarget.style, {
          borderColor: "var(--border-color)",
          boxShadow: "none",
          transform: "translateY(0)",
        })
      }
    >
      <div style={S.iconBubble}>{item.icon}</div>
      <h2 style={S.cardTitle}>{item.title}</h2>
      <p style={S.cardText}>{item.text}</p>
    </div>
  );
}

function AboutPage() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes driftA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(28px, -22px) scale(1.05); }
        }
        @keyframes driftB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-20px, 20px) scale(1.04); }
        }
        .about-hero { animation: fadeUp 0.4s ease both; }
        .about-card-enter { animation: fadeUp 0.35s ease both; }
        .about-primary-link:hover { transform: translateY(-2px); }
        .blob-a {
          position: absolute; top: -150px; right: -140px;
          width: 460px; height: 460px;
          background:
            radial-gradient(circle at 27% 24%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 24%),
            radial-gradient(circle at 62% 70%, #7dd8ff 0%, #33b5f0 32%, #1a7fd4 58%, #0f5aa6 80%, #0a3f7a 100%);
          border-radius: 58% 42% 63% 37% / 46% 54% 46% 54%;
          filter: blur(1px);
          box-shadow: 0 60px 110px -25px rgba(15, 90, 166, 0.4);
          animation: driftA 16s ease-in-out infinite;
        }
        .blob-b {
          position: absolute; top: 40px; right: 30px;
          width: 100px; height: 100px;
          background:
            radial-gradient(circle at 30% 26%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 26%),
            radial-gradient(circle at 62% 68%, #66cdf4 0%, #1f8fdc 45%, #0e5a9e 100%);
          border-radius: 50%;
          filter: blur(0.5px);
          box-shadow: 0 24px 46px -12px rgba(15, 90, 166, 0.45);
          animation: driftB 13s ease-in-out infinite;
        }
      `}</style>

      <main style={S.page}>
        <div style={S.blobField}>
          <div className="blob-a" />
          <div className="blob-b" />
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

          <section className="about-hero" style={S.hero}>
            <span style={S.eyebrow}>About Bambo Exam Practice</span>
            <h1 style={S.title}>A smarter way to practise for exams.</h1>
            <p style={S.subtitle}>
              Bambo Exam Practice helps students prepare through structured
              topic-based tests, randomized practice, detailed explanations, and
              progress tracking.
            </p>

            <div style={S.actions}>
              <Link
                className="about-primary-link"
                to="/user-signup"
                style={S.primaryLink}
              >
                <span>Create account</span>
                <ChevronRight />
              </Link>
              <Link to="/contact" style={S.secondaryLink}>
                Contact us
              </Link>
            </div>
          </section>

          <section style={S.grid}>
            {FEATURES.map((item, i) => (
              <FeatureCard key={item.title} item={item} index={i} />
            ))}
          </section>

          <section style={S.statement}>
            <h2 style={S.sectionTitle}>Our mission</h2>
            <p style={S.sectionText}>
              Our mission is to make exam preparation more accessible,
              measurable, and engaging. Whether students are preparing for
              school assessments, CBTs, professional exams, or continuous
              learning, Bambo Exam Practice provides a focused environment for
              building confidence.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}

export default AboutPage;
