import React from "react";

export default function AboutPage() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>About Us</h1>

        <p>
          Bambo Exam Practice is an educational platform designed to help
          students prepare for examinations through topic-based and
          subject-based practice tests.
        </p>

        <h2>Our Mission</h2>
        <p>
          To provide accessible, engaging, and effective exam preparation tools
          that help students improve performance and confidence.
        </p>

        <h2>Features</h2>
        <ul>
          <li>Practice Questions</li>
          <li>Performance Tracking</li>
          <li>Achievements & Badges</li>
          <li>Randomized Practice Tests</li>
          <li>Topic Requests</li>
        </ul>
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
