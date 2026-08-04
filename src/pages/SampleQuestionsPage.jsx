import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sampleQuestions } from "../data/publicReviews";
import BlobBackground from "../components/BlobBackground";

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

function QuestionIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle
        cx="10"
        cy="10"
        r="7.5"
        stroke="var(--button-primary)"
        strokeWidth="1.3"
      />
      <path
        d="M7.9 8.2a2.1 2.1 0 1 1 2.8 2c-.6.35-.9.7-.9 1.3v.3"
        stroke="var(--button-primary)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="9.9" cy="14" r="0.9" fill="var(--button-primary)" />
    </svg>
  );
}

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
    maxWidth: "780px",
    margin: "0 auto",
    padding: "2.5rem 1.25rem 4rem",
  },
  header: { marginBottom: "2rem", textAlign: "center" },
  backBtnRow: { textAlign: "left", marginBottom: "1.25rem" },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
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
  heading: {
    fontSize: "clamp(28px, 5vw, 42px)",
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: "0 0 0.75rem",
    letterSpacing: "-0.02em",
  },
  subheading: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: "1.65",
    maxWidth: "440px",
    margin: "0 auto",
  },
  statsRow: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "1.25rem",
    fontSize: "13px",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "var(--text-secondary)",
  },
  statValue: { fontWeight: "600", color: "var(--button-primary)" },
  list: { display: "flex", flexDirection: "column", gap: "18px" },
  card: {
    background: "var(--bg-secondary)",
    border: "0.5px solid var(--border-color)",
    borderRadius: "14px",
    padding: "1.5rem",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "1rem",
  },
  iconBubble: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    background: "var(--surface-alt)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  qMeta: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--button-primary)",
    letterSpacing: "0.02em",
  },
  qTitle: {
    fontSize: "16.5px",
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: "0 0 1.25rem",
    lineHeight: "1.5",
  },
  options: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "1.25rem",
  },
  option: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "13px 15px",
    border: "0.5px solid var(--border-color)",
    borderRadius: "10px",
    color: "var(--text-primary)",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "border-color 0.15s, background 0.15s",
  },
  optionSelected: {
    borderColor: "var(--button-primary)",
    background: "var(--surface-alt)",
  },
  optionCorrect: { borderColor: "#2f9e62", background: "rgba(47,158,98,0.09)" },
  optionWrong: { borderColor: "#d94a4a", background: "rgba(217,74,74,0.08)" },
  optionDot: {
    flexShrink: 0,
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    border: "2px solid var(--border-color)",
  },
  optionDotChecked: { borderColor: "var(--button-primary)" },
  optionIcon: { marginLeft: "auto", fontWeight: "700" },
  divider: {
    height: "0.5px",
    background: "var(--border-color)",
    marginBottom: "1.25rem",
  },
  button: {
    width: "100%",
    padding: "11px 16px",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    letterSpacing: "-0.01em",
    background: "var(--button-primary)",
    color: "#fff",
  },
  feedback: {
    marginTop: "1.1rem",
    padding: "14px 16px",
    borderRadius: "10px",
    background: "var(--surface-alt)",
    borderLeft: "3px solid var(--button-primary)",
  },
  feedbackCorrect: { borderLeftColor: "#2f9e62" },
  feedbackWrong: { borderLeftColor: "#d94a4a" },
  feedbackTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--text-primary)",
    letterSpacing: "0.01em",
  },
  feedbackBody: {
    margin: "6px 0 0",
    color: "var(--text-secondary)",
    fontSize: "13.5px",
    lineHeight: "1.7",
  },
  cta: {
    marginTop: "6px",
    padding: "2rem",
    borderRadius: "16px",
    background: "var(--button-primary)",
    color: "#fff",
    textAlign: "center",
  },
  ctaTitle: { margin: "0 0 8px", fontSize: "20px", fontWeight: "600" },
  ctaBody: {
    margin: "0 0 1.25rem",
    opacity: 0.92,
    fontSize: "13.5px",
    lineHeight: "1.7",
  },
  ctaButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "11px 18px",
    borderRadius: "8px",
    background: "#fff",
    color: "var(--button-primary)",
    border: "none",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    letterSpacing: "-0.01em",
  },
};

function QuestionCard({ q, n }) {
  const [selected, setSelected] = useState("");
  const [done, setDone] = useState(false);
  const isCorrect = done && selected === q.answer;
  const isWrong = done && selected && selected !== q.answer;

  return (
    <article
      className="question-card-enter"
      style={{ ...S.card, animationDelay: `${n * 40}ms` }}
    >
      <div style={S.cardTop}>
        <div style={S.iconBubble}>
          <QuestionIcon />
        </div>
        <span style={S.qMeta}>
          Question {n} · {q.subject}
        </span>
      </div>
      <h2 style={S.qTitle}>{q.question}</h2>

      <div style={S.options}>
        {q.options.map((o) => {
          const checked = selected === o;
          const correct = done && o === q.answer;
          const wrong = done && checked && o !== q.answer;
          return (
            <label
              key={o}
              style={{
                ...S.option,
                ...(checked && !done ? S.optionSelected : {}),
                ...(correct ? S.optionCorrect : {}),
                ...(wrong ? S.optionWrong : {}),
              }}
            >
              <input
                type="radio"
                name={`q-${q.id}`}
                checked={checked}
                onChange={() => {
                  setSelected(o);
                  setDone(false);
                }}
                style={{ position: "absolute", opacity: 0 }}
              />
              <span
                style={{
                  ...S.optionDot,
                  ...(checked ? S.optionDotChecked : {}),
                  background: checked
                    ? "radial-gradient(var(--button-primary) 0 40%, transparent 44%)"
                    : "transparent",
                }}
              />
              <span>{o}</span>
              {correct && (
                <span style={{ ...S.optionIcon, color: "#2f9e62" }}>✓</span>
              )}
              {wrong && (
                <span style={{ ...S.optionIcon, color: "#d94a4a" }}>✕</span>
              )}
            </label>
          );
        })}
      </div>

      <div style={S.divider} />
      <button
        disabled={!selected}
        onClick={() => setDone(true)}
        style={{
          ...S.button,
          opacity: selected ? 1 : 0.55,
          cursor: selected ? "pointer" : "not-allowed",
        }}
      >
        Check answer
      </button>

      {done && (
        <div
          style={{
            ...S.feedback,
            ...(isCorrect ? S.feedbackCorrect : {}),
            ...(isWrong ? S.feedbackWrong : {}),
          }}
        >
          <div style={S.feedbackTitle}>
            {isCorrect ? "Correct" : "Not quite"}
          </div>
          <p style={S.feedbackBody}>{q.explanation}</p>
        </div>
      )}
    </article>
  );
}

export default function SampleQuestionsPage() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={S.page}>
        <BlobBackground amount="full" orientation="wide" />

        <div style={S.inner}>
          <div className="sample-header" style={S.header}>
            <div style={S.backBtnRow}>
              <button
                onClick={() => navigate("/")}
                style={S.backBtn}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--surface-alt)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--bg-secondary)")
                }
              >
                ← Back
              </button>
            </div>

            <span style={S.eyebrow}>Practice questions</span>
            <h1 style={S.heading}>Try Bambo sample questions</h1>
            <p style={S.subheading}>
              Answer original questions and review the explanations without
              creating an account.
            </p>
            <div style={S.statsRow}>
              <div style={S.statItem}>
                <span style={S.statValue}>{sampleQuestions.length}</span>
                <span>question{sampleQuestions.length === 1 ? "" : "s"}</span>
              </div>
            </div>
          </div>

          <div style={S.list}>
            {sampleQuestions.map((q, i) => (
              <QuestionCard key={q.id} q={q} n={i + 1} />
            ))}

            <div style={S.cta}>
              <h2 style={S.ctaTitle}>Continue your practice</h2>
              <p style={S.ctaBody}>
                Sign up for full topic tests, randomized practice, and progress
                tracking.
              </p>
              <button
                style={S.ctaButton}
                onClick={() => navigate("/user-signup")}
              >
                <span>Create free account</span>
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}