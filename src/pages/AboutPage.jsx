import { Link, useNavigate } from "react-router-dom";
import BlobBackground from "../components/BlobBackground";
import usePageMetadata from "../hooks/usePageMetadata";

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
    title: "Built for LASUCOM",
    text: "Designed around the way LASUCOM students revise, practise, and prepare for school assessments.",
  },
  {
    icon: "🔀",
    title: "Curriculum Aligned",
    text: "Questions and reviews are organised with the school curriculum in mind.",
  },
  {
    icon: "📈",
    title: "Transparent Sources",
    text: "Public reviews include references and worked explanations so students can trace the concepts and compare them with their teaching.",
  },
  {
    icon: "🏆",
    title: "Practice With Feedback",
    text: "Answer questions, review explanations, and use quick reviews to strengthen weak areas.",
  },
  {
    icon: "📩",
    title: "Student Requests",
    text: "Use the contact form to request subjects, topics, corrections, or improvements.",
  },
  {
    icon: "🌙",
    title: "Exam Support",
    text: "Bambo is intended for educational revision and exam preparation, not clinical decision-making.",
  },
];

const TRUST_POINTS = [
  {
    title: "Who operates Bambo",
    text: "Bambo is personally operated by a LASUCOM medical student as an independent study-support project for fellow students.",
  },
  {
    title: "Who it is for",
    text: "The platform is built mainly for Lagos State University College of Medicine students who want structured practice, quick reviews, and clearer revision feedback.",
  },
  {
    title: "How content is produced",
    text: "Bambo uses AI assistance to develop revision explanations and fictional worked examples. References are provided for further reading; no independent clinical reviewer is claimed. Compare the notes with your course materials and current local guidance.",
  },
  {
    title: "How to contact Bambo",
    text: "Students can use the contact form to send feedback, report issues, request topics, or suggest corrections.",
  },
];

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
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
    gap: "16px",
    marginTop: "2rem",
  },
  infoCard: {
    background: "var(--bg-secondary)",
    border: "0.5px solid var(--border-color)",
    borderRadius: "14px",
    padding: "1.5rem",
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
  usePageMetadata(
    "About Bambo Exam Practice | Bambo",
    "Learn how Bambo Exam Practice supports LASUCOM students with curriculum-aligned questions, quick reviews, and checked study content.",
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <main style={S.page}>
        <BlobBackground amount="balanced" orientation="wide" />

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
            <h1 style={S.title}>Exam preparation built for LASUCOM students.</h1>
            <p style={S.subtitle}>
              Bambo Exam Practice is a study-support platform for LASUCOM
              students. It provides topic-based questions, quick reviews,
              explanations, and progress tracking to make exam preparation more
              organised and measurable.
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
              Bambo exists to make LASUCOM exam preparation more accessible,
              focused, and easier to track. The goal is to help students revise
              actively, identify weak areas, and build confidence before exams.
            </p>
          </section>

          <section id="editorial" style={S.statement}><h2 style={S.sectionTitle}>Sources, scope and corrections</h2><p style={S.sectionText}>Bambo is an independent student-led resource, not an official LASUCOM publication or an examination board. Articles explain selected concepts rather than covering an entire syllabus. References identify external reading; they do not imply endorsement of Bambo.</p><p style={S.sectionText}>The public notes are AI-assisted and are not independently medically reviewed. Use them alongside supervised teaching and current local guidance. Update dates identify revisions to the notes, not certification of clinical accuracy.</p><p style={S.sectionText}>To report a correction, send the article title, the statement you question and a supporting source through the <Link to="/contact">contact form</Link> or email <a href="mailto:AdebamboMichael29@gmail.com">AdebamboMichael29@gmail.com</a>. Bambo can then investigate and revise the affected explanation.</p></section>
          <section style={S.infoGrid}>
            {TRUST_POINTS.map((item) => (
              <article style={S.infoCard} key={item.title}>
                <h2 style={S.cardTitle}>{item.title}</h2>
                <p style={S.cardText}>{item.text}</p>
              </article>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}

export default AboutPage;
