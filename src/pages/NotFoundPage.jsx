import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import S from "./errorStyles";
import { animationCss } from "./errorAnimations";

const challenge = {
  question: "Quick challenge: What is the best way to improve exam retention?",
  options: [
    "Only reading notes repeatedly",
    "Practising questions and reviewing mistakes",
    "Avoiding timed tests",
    "Skipping weak topics",
  ],
  answer: "Practising questions and reviewing mistakes",
};

function NotFoundPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("");
  const options = useMemo(
    () => [...challenge.options].sort(() => Math.random() - 0.5),
    [],
  );
  const isCorrect = selected === challenge.answer;

  return (
    <>
      <style>{animationCss}</style>
      <div style={S.page}>
        <div style={S.card}>
          <div style={S.icon}>📚</div>
          <p style={S.eyebrow}>Page not found</p>
          <h1 style={S.code}>404</h1>
          <h2 style={S.title}>Looks like this page is not in the syllabus.</h2>
          <p style={S.body}>
            The page may have been moved, deleted, or typed incorrectly. Try the
            quick challenge below, then continue studying.
          </p>

          <div style={local.challengeCard}>
            <p style={local.challengeTitle}>{challenge.question}</p>
            <div style={local.options}>
              {options.map((option) => {
                const active = selected === option;
                const correct = selected && option === challenge.answer;
                const wrong = active && selected && !isCorrect;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelected(option)}
                    style={{
                      ...local.optionButton,
                      borderColor: correct
                        ? "#22c55e"
                        : wrong
                          ? "#ef4444"
                          : "var(--border-color)",
                      background: correct
                        ? "#dcfce7"
                        : wrong
                          ? "#fee2e2"
                          : "var(--bg-secondary)",
                      color: correct
                        ? "#166534"
                        : wrong
                          ? "#991b1b"
                          : "var(--text-primary)",
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {selected && (
              <p
                style={{
                  ...local.feedback,
                  color: isCorrect ? "#16a34a" : "#dc2626",
                }}
              >
                {isCorrect
                  ? "Correct. Practice plus review is how you improve fastest."
                  : "Not quite. The best option is practising questions and reviewing mistakes."}
              </p>
            )}
          </div>

          <div style={S.actions}>
            <button
              style={S.primaryButton}
              onClick={() => navigate("/user-dashboard")}
            >
              Go to Dashboard
            </button>
            <button style={S.secondaryButton} onClick={() => navigate("/user")}>
              Browse Subjects
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const local = {
  challengeCard: {
    background: "var(--surface-alt)",
    border: "1px solid var(--border-color)",
    borderRadius: "16px",
    padding: "16px",
  },
  challengeTitle: {
    margin: "0 0 12px",
    color: "var(--text-primary)",
    fontSize: "15px",
    fontWeight: 700,
  },
  options: { display: "grid", gap: "10px" },
  optionButton: {
    border: "1px solid var(--border-color)",
    borderRadius: "12px",
    padding: "12px 14px",
    textAlign: "left",
    fontWeight: 650,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  feedback: { margin: "12px 0 0", fontSize: "13px", fontWeight: 700 },
};

export default NotFoundPage;
