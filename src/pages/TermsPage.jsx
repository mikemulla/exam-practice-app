import PublicFooter from "../components/PublicFooter";

function TermsPage() {
  return (
    <>
      <main style={S.page}>
        <article style={S.card}>
          <p style={S.eyebrow}>Legal</p>
          <h1 style={S.title}>Terms of Service</h1>
          <p style={S.updated}>Last updated: June 2026</p>

          <Section title="Acceptance of Terms">
            By accessing or using Bambo Exam Practice, you agree to these Terms
            of Service. If you do not agree, please do not use the platform.
          </Section>

          <Section title="Educational Purpose">
            The platform provides educational practice questions, explanations,
            progress tracking, and study support. It is intended for revision
            and learning support only.
          </Section>

          <Section title="User Accounts">
            Users are responsible for keeping their login details secure and for
            all activity under their accounts. Do not share accounts or attempt
            to access another user's account.
          </Section>

          <Section title="Acceptable Use">
            Users must not disrupt the platform, upload harmful content, attempt
            unauthorised access, misuse the contact or request features, or copy
            platform content for unauthorised redistribution.
          </Section>

          <Section title="Accuracy of Content">
            We aim to provide useful and accurate educational content, but we do
            not guarantee that all questions, answers, explanations, or materials
            are free from error. Users should verify important academic or
            professional information.
          </Section>

          <Section title="Changes to the Platform">
            We may update, modify, suspend, or remove features, content, or
            pages at any time to improve the service.
          </Section>

          <Section title="Contact">
            For questions about these terms, please use the Contact Us page.
          </Section>
        </article>
      </main>

      <PublicFooter />
    </>
  );
}

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
    padding: "48px 18px",
  },
  card: {
    maxWidth: "900px",
    margin: "0 auto",
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "24px",
    padding: "34px",
    boxShadow: "0 18px 50px rgba(15,23,42,0.08)",
  },
  eyebrow: {
    margin: "0 0 8px",
    color: "var(--button-primary)",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    color: "var(--text-primary)",
    fontSize: "clamp(30px, 5vw, 46px)",
  },
  updated: {
    color: "var(--text-secondary)",
    margin: "8px 0 26px",
  },
  section: {
    borderTop: "1px solid var(--border-color)",
    paddingTop: "20px",
    marginTop: "20px",
  },
  sectionTitle: {
    margin: "0 0 8px",
    color: "var(--text-primary)",
    fontSize: "20px",
  },
  text: {
    margin: 0,
    color: "var(--text-secondary)",
    lineHeight: 1.8,
    fontSize: "15px",
  },
};

export default TermsPage;
