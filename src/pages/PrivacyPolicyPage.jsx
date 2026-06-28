import PublicFooter from "../components/PublicFooter";

function PrivacyPolicyPage() {
  return (
    <>
      <main style={S.page}>
        <article style={S.card}>
          <p style={S.eyebrow}>Legal</p>
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
            Third-party vendors, including Google, may use cookies to serve ads,
            measure ad performance, and provide analytics. Google may use
            advertising cookies based on visits to this and other websites.
          </Section>

          <Section title="Data Security">
            We take reasonable steps to protect user information from
            unauthorised access, loss, misuse, or disclosure. No online service
            can guarantee absolute security.
          </Section>

          <Section title="User Choices">
            Users may contact us to ask questions about their information or to
            request assistance with their account.
          </Section>

          <Section title="Contact">
            For questions about this Privacy Policy or the platform, please use
            the Contact Us page.
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

export default PrivacyPolicyPage;
