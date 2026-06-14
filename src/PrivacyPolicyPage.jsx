import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Privacy Policy</h1>

        <p>Last Updated: June 2026</p>

        <h2>Information We Collect</h2>
        <p>
          We collect information you provide when creating an account, including
          your name, email address, course, level, and practice activity on the
          platform.
        </p>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>Provide access to practice questions and tests.</li>
          <li>Track performance and progress.</li>
          <li>Improve platform functionality.</li>
          <li>Send important notifications when necessary.</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          This website may use cookies and similar technologies to improve user
          experience and analyze website performance.
        </p>

        <h2>Google AdSense</h2>
        <p>
          Third-party vendors, including Google, may use cookies to serve ads
          based on users' visits to this website and other websites.
        </p>

        <h2>Data Security</h2>
        <p>
          We take reasonable measures to protect user information from
          unauthorized access or disclosure.
        </p>

        <h2>Contact</h2>
        <p>
          If you have questions regarding this Privacy Policy, please contact us
          through the Contact page.
        </p>
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
