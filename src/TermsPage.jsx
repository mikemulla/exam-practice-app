import React from "react";

export default function TermsPage() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Terms of Service</h1>

        <p>By using this platform, you agree to comply with these terms.</p>

        <h2>Acceptable Use</h2>
        <ul>
          <li>Do not share accounts.</li>
          <li>Do not attempt to disrupt the platform.</li>
          <li>Do not upload malicious content.</li>
        </ul>

        <h2>Educational Use</h2>
        <p>
          This platform is provided for educational and examination practice
          purposes only.
        </p>

        <h2>Account Responsibility</h2>
        <p>
          Users are responsible for maintaining the confidentiality of their
          account credentials.
        </p>

        <h2>Changes</h2>
        <p>We may update these terms at any time without prior notice.</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "40px 20px",
    background: "#08152f",
    color: "#fff",
  },
  card: {
    maxWidth: "900px",
    margin: "0 auto",
    background: "#132547",
    padding: "40px",
    borderRadius: "16px",
    lineHeight: "1.8",
  },
};
