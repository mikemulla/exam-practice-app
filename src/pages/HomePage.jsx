import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { hasStudentSession } from "../lib/session";
import usePageMetadata from "../hooks/usePageMetadata";
import { publicReviews } from "../data/publicReviews";
import "../styles/home.css";

const FEATURED_SLUGS = [
  "normal-labour-stages",
  "ectopic-pregnancy-red-flags",
  "childhood-pneumonia",
];

const STEPS = [
  {
    title: "Read a quick review",
    text: "Short summaries of each topic, built from your lecture material, so you know what matters before you practise.",
    icon: (
      <>
        <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" />
        <path d="M8 7h6" />
        <path d="M8 11h8" />
      </>
    ),
  },
  {
    title: "Practise by topic",
    text: "Timed, exam-style tests for every topic, or a random mix from a whole subject when you want a challenge.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
  },
  {
    title: "Fix your mistakes",
    text: "Every option is explained, and a tutor helps you see where your reasoning slipped so it sticks next time.",
    icon: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />,
  },
];

function HomePage() {
  usePageMetadata(
    "Bambo Exam Practice | Free Medical Study Questions",
    "Practise medical exam questions, read free quick reviews, and track study progress with Bambo Exam Practice.",
  );

  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoggedIn(hasStudentSession()), 0);
    return () => clearTimeout(t);
  }, []);

  const featured = FEATURED_SLUGS.map((slug) =>
    publicReviews.find((review) => review.slug === slug),
  ).filter(Boolean);

  return (
    <div className="hm">
      <section className="hm-hero" aria-labelledby="hm-title">
        <span className="hm-blob hm-blob-hero" aria-hidden="true" />
        <span className="hm-blob hm-blob-left" aria-hidden="true" />
        <span className="hm-blob hm-blob-low" aria-hidden="true" />

        <div className="hm-hero-inner">
          <div className="hm-hero-copy">
            <p className="hm-pill">For medical students · free to start</p>
            <h1 id="hm-title" className="hm-h1">
              Understand medicine through <span>worked examples</span>
            </h1>
            <p className="hm-lead">
              Practise exam-style questions by topic, see why every option is
              right or wrong, and talk through your mistakes until they stick.
            </p>
            <div className="hm-actions">
              {/* Logged in: straight to the dashboard. Not logged in: the login page (it links to sign-up). */}
              <Link className="hm-btn hm-btn-primary" to={loggedIn ? "/user-dashboard" : "/user-login"}>
                Check it out →
              </Link>
              <Link className="hm-btn hm-btn-secondary" to="/sample-questions">
                Try 10 sample questions
              </Link>
            </div>
            <p className="hm-note">
              {loggedIn ? "You're logged in on this device." : "Free to start. No account needed for the samples."}
            </p>
          </div>

          <div className="hm-demo-wrap">
            <figure className="hm-demo" aria-label="Example of a question with feedback" style={{ margin: 0 }}>
              <div className="hm-demo-top">
                <strong>O&amp;G · Clinical</strong>
                <span>Question 6 of 30</span>
              </div>
              <p className="hm-demo-q">
                On magnesium sulphate, she has a respiratory rate of 9/min and
                absent reflexes. Next step?
              </p>
              <div className="hm-opt hm-opt-wrong">
                <strong>✕ Reduce the rate and recheck</strong>
                <span>Too slow: these are signs of toxicity.</span>
              </div>
              <div className="hm-opt hm-opt-right">
                <strong>✓ Stop it and give calcium gluconate</strong>
                <span>The antidote; support breathing.</span>
              </div>
              <div className="hm-chat">
                What made you choose to slow it rather than stop it?
              </div>
            </figure>
          </div>
        </div>
      </section>

      <div className="hm-main">
        <section className="hm-section" aria-labelledby="hm-how">
          <h2 id="hm-how" className="hm-h2">
            Study the way exams test you
          </h2>
          <div className="hm-grid">
            {STEPS.map((step) => (
              <div className="hm-card" key={step.title}>
                <span className="hm-icon">
                  <svg
                    aria-hidden="true"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {step.icon}
                  </svg>
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="hm-section" aria-labelledby="hm-reviews">
          <div className="hm-head-row">
            <h2 id="hm-reviews" className="hm-h2">
              Popular quick reviews
            </h2>
            <Link className="hm-link" to="/quick-reviews">
              See all {publicReviews.length}
            </Link>
          </div>
          <div className="hm-grid">
            {featured.map((review) => (
              <Link
                key={review.slug}
                className="hm-card hm-review"
                to={`/quick-reviews/${review.slug}`}
              >
                <span className="hm-eyebrow">{review.subject}</span>
                <strong>{review.title}</strong>
                <p>{review.excerpt}</p>
                <span className="hm-meta">
                  {review.readingTime} · Worked example and references
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="hm-routine" aria-labelledby="hm-routine">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 id="hm-routine" className="hm-h2">
              A practical revision routine
            </h2>
            <p>
              Bambo connects medical concepts to the decisions you make in exam
              questions. Start with a short review, follow its worked example,
              then explain the answer in your own words before checking the
              sample questions.
            </p>
            <p>
              Built for student revision, with a particular focus on the
              LASUCOM community. Public resources are open to everyone.{" "}
              <Link to="/about">
                Learn about Bambo and the limits of these materials
              </Link>
              .
            </p>
          </div>
          <ol>
            <li>
              <strong>Choose one question.</strong> Identify what it asks
              before looking at the options: diagnosis, mechanism,
              investigation or next priority.
            </li>
            <li>
              <strong>Explain the clues.</strong> Write down which observation
              supports your answer and which would change your mind. Use a
              review when the mechanism is unclear.
            </li>
            <li>
              <strong>Compare the alternatives.</strong> Work through why the
              other options do not fit this particular stem.
            </li>
            <li>
              <strong>Return to the topic.</strong> Attempt a similar problem
              later without your notes. Track the reasoning you missed, not
              just the score.
            </li>
          </ol>
        </section>

        <section className="hm-cta" aria-labelledby="hm-cta">
          <span className="hm-blob" aria-hidden="true" />
          <div>
            <h2 id="hm-cta">Track what you've mastered</h2>
            <p>
              Create a free account to save your scores, see your weak topics
              and climb your class leaderboard.
            </p>
          </div>
          <Link className="hm-btn" to={loggedIn ? "/user-dashboard" : "/user-signup"}>
            {loggedIn ? "Open my dashboard" : "Create free account"}
          </Link>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
