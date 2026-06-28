import { Link } from "react-router-dom";
import PublicFooter from "../components/PublicFooter";

function AboutPage() {
  return (
    <>
      <main style={S.page}>
        <section style={S.hero}>
          <p style={S.eyebrow}>About Bambo Exam Practice</p>
          <h1 style={S.title}>A smarter way to practise for exams.</h1>
          <p style={S.subtitle}>
            Bambo Exam Practice helps students prepare through structured
            topic-based tests, randomized practice, detailed explanations, and
            progress tracking.
          </p>

          <div style={S.actions}>
            <Link to="/user-signup" style={S.primaryLink}>
              Create Account
            </Link>
            <Link to="/contact" style={S.secondaryLink}>
              Contact Us
            </Link>
          </div>
        </section>

        <section style={S.grid}>
          {[
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
          ].map((item) => (
            <div key={item.title} style={S.card}>
              <div style={S.icon}>{item.icon}</div>
              <h2 style={S.cardTitle}>{item.title}</h2>
              <p style={S.cardText}>{item.text}</p>
            </div>
          ))}
        </section>

        <section style={S.statement}>
          <h2 style={S.sectionTitle}>Our Mission</h2>
          <p style={S.sectionText}>
            Our mission is to make exam preparation more accessible, measurable,
            and engaging. Whether students are preparing for school assessments,
            CBTs, professional exams, or continuous learning, Bambo Exam Practice
            provides a focused environment for building confidence.
          </p>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}

const S = {
  page: {
    minHeight: "100vh",
    background: "var(--bg-primary)",
    padding: "48px 18px",
  },
  hero: {
    maxWidth: "960px",
    margin: "0 auto 32px",
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "24px",
    padding: "38px",
    boxShadow: "0 18px 50px rgba(15,23,42,0.08)",
  },
  eyebrow: {
    margin: "0 0 10px",
    color: "var(--button-primary)",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    color: "var(--text-primary)",
    fontSize: "clamp(30px, 6vw, 54px)",
    lineHeight: 1.05,
    letterSpacing: "-0.04em",
  },
  subtitle: {
    margin: "18px 0 0",
    color: "var(--text-secondary)",
    fontSize: "16px",
    lineHeight: 1.8,
    maxWidth: "720px",
  },
  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "24px",
  },
  primaryLink: {
    padding: "12px 18px",
    borderRadius: "12px",
    background: "var(--button-primary)",
    color: "white",
    textDecoration: "none",
    fontWeight: 800,
  },
  secondaryLink: {
    padding: "12px 18px",
    borderRadius: "12px",
    background: "var(--surface-alt)",
    color: "var(--button-primary)",
    textDecoration: "none",
    fontWeight: 800,
  },
  grid: {
    maxWidth: "960px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  card: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "18px",
    padding: "22px",
  },
  icon: {
    fontSize: "30px",
    marginBottom: "12px",
  },
  cardTitle: {
    margin: "0 0 8px",
    color: "var(--text-primary)",
    fontSize: "17px",
  },
  cardText: {
    margin: 0,
    color: "var(--text-secondary)",
    fontSize: "14px",
    lineHeight: 1.7,
  },
  statement: {
    maxWidth: "960px",
    margin: "24px auto 0",
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "20px",
    padding: "28px",
  },
  sectionTitle: {
    margin: "0 0 10px",
    color: "var(--text-primary)",
  },
  sectionText: {
    margin: 0,
    color: "var(--text-secondary)",
    lineHeight: 1.8,
  },
};

export default AboutPage;
