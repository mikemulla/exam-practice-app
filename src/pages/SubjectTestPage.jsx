import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";

/* ─── Design tokens ─── */
const T = {
  bg: "#F5F4F0",
  surface: "#FFFFFF",
  surfaceAlt: "#F9F8F5",
  border: "rgba(0,0,0,0.07)",
  borderStrong: "rgba(0,0,0,0.12)",
  ink: "#18180F",
  inkMid: "#5C5C50",
  inkFaint: "#9B9B88",
  accent: "#1A4E2E",
  accentLight: "#E8F2EC",
  accentMid: "#2D7A4A",
  danger: "#8B2020",
  dangerLight: "#FBF0F0",
  dangerBorder: "#E8C4C4",
  warn: "#7A5A00",
  warnLight: "#FDF6E3",
  radius: "10px",
  radiusSm: "6px",
  radiusLg: "16px",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowMd: "0 2px 8px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)",
  font: "'Lora', Georgia, serif",
  fontSans: "'DM Sans', system-ui, sans-serif",
  fontMono: "'DM Mono', monospace",
};

const injectFonts = () => {
  if (document.getElementById("quiz-fonts")) return;
  const link = document.createElement("link");
  link.id = "quiz-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap";
  document.head.appendChild(link);
};

const globalCSS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes progressFill {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .quiz-option:hover {
    border-color: ${T.accentMid} !important;
    background: ${T.accentLight} !important;
  }
  .quiz-btn:hover { opacity: 0.88; }
  .quiz-btn:active { transform: scale(0.98); }
  .quiz-link:hover { color: ${T.accentMid} !important; }
  .exp-toggle:hover { color: ${T.accent} !important; }
  .dot-nav:hover { transform: scale(1.3); }
`;

const injectStyles = () => {
  if (document.getElementById("quiz-styles")) return;
  const s = document.createElement("style");
  s.id = "quiz-styles";
  s.textContent = globalCSS;
  document.head.appendChild(s);
};

/* ─── Helpers ─── */
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const formatTime = (s) =>
  `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

/* ─── Tiny icons ─── */
const Icon = {
  left: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path
        d="M10 12L6 8l4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  right: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  clock: ({ warn }) => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <circle
        cx="8"
        cy="9"
        r="6"
        stroke={warn ? T.danger : T.inkMid}
        strokeWidth="1.3"
      />
      <path
        d="M8 6.5v2.5l1.5 1"
        stroke={warn ? T.danger : T.inkMid}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  ),
  check: () => (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path
        d="M1.5 6l3 3 6-6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  x: () => (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path
        d="M2.5 2.5l7 7M9.5 2.5l-7 7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  ),
  chevron: ({ open }) => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      style={{
        transition: "transform 0.25s",
        transform: open ? "rotate(90deg)" : "rotate(0deg)",
      }}
    >
      <path
        d="M4.5 3l3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  trophy: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 21h8M12 17v4M7 4H4a1 1 0 00-1 1v2a4 4 0 004 4h.5M17 4h3a1 1 0 011 1v2a4 4 0 01-4 4h-.5"
        stroke={T.accent}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7 4h10v6a5 5 0 01-10 0V4z"
        stroke={T.accent}
        strokeWidth="1.6"
      />
    </svg>
  ),
};

/* ─── Badge ─── */
function Badge({ variant, children }) {
  const variants = {
    correct: { bg: "#E4F2E9", color: T.accent, border: "#B8DDC3" },
    incorrect: { bg: T.dangerLight, color: T.danger, border: T.dangerBorder },
    info: { bg: T.accentLight, color: T.accent, border: "#B8DDC3" },
    neutral: { bg: "#F0EFEA", color: T.inkMid, border: T.border },
  };
  const c = variants[variant] || variants.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: "11px",
        fontFamily: T.fontSans,
        fontWeight: "500",
        padding: "3px 10px",
        borderRadius: "999px",
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        letterSpacing: "0.01em",
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

/* ─── Button ─── */
function Btn({ variant = "ghost", children, onClick, disabled, style = {} }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "9px 18px",
    borderRadius: T.radius,
    fontSize: "13px",
    fontFamily: T.fontSans,
    fontWeight: "500",
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    transition: "opacity 0.15s, transform 0.1s",
    opacity: disabled ? 0.4 : 1,
    letterSpacing: "0.01em",
  };
  const variants = {
    primary: { background: T.accent, color: "#fff" },
    ghost: {
      background: "transparent",
      color: T.inkMid,
      border: `1px solid ${T.borderStrong}`,
    },
    danger: {
      background: T.dangerLight,
      color: T.danger,
      border: `1px solid ${T.dangerBorder}`,
    },
  };
  return (
    <button
      className="quiz-btn"
      onClick={!disabled ? onClick : undefined}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

/* ─── Review option row ─── */
function ReviewOption({ option, isCorrect, isUserAnswer }) {
  if (!isCorrect && !isUserAnswer) return null;
  const isWrong = isUserAnswer && !isCorrect;
  const color = isWrong ? T.danger : T.accent;
  const bg = isWrong ? T.dangerLight : "#E4F2E9";
  const border = isWrong ? T.dangerBorder : "#B8DDC3";
  const label =
    isCorrect && isUserAnswer
      ? "Your answer · correct"
      : isCorrect
        ? "Correct answer"
        : "Your answer · incorrect";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 12px",
        borderRadius: T.radiusSm,
        marginBottom: "6px",
        background: bg,
        border: `1px solid ${border}`,
        color,
      }}
    >
      <span
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          flexShrink: 0,
          background: color,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isCorrect ? <Icon.check /> : <Icon.x />}
      </span>
      <span style={{ fontSize: "13px", fontFamily: T.fontSans, flex: 1 }}>
        {option}
      </span>
      <span
        style={{
          fontSize: "10.5px",
          fontFamily: T.fontSans,
          opacity: 0.75,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Explanation toggle ─── */
function ExplanationToggle({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: "12px" }}>
      <button
        className="exp-toggle"
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          fontSize: "12px",
          fontFamily: T.fontSans,
          color: T.inkFaint,
          transition: "color 0.15s",
        }}
      >
        <Icon.chevron open={open} />
        {open ? "Hide" : "Show"} explanation
      </button>
      {open && (
        <p
          style={{
            fontSize: "13px",
            fontFamily: T.fontSans,
            color: T.inkMid,
            lineHeight: "1.7",
            marginTop: "10px",
            padding: "12px 14px",
            background: T.surfaceAlt,
            borderRadius: T.radiusSm,
            borderLeft: `3px solid ${T.accentMid}`,
            animation: "fadeIn 0.2s ease",
          }}
        >
          {text}
        </p>
      )}
    </div>
  );
}

/* ─── Question review card ─── */
function QuestionReviewCard({ question, index, userAnswer }) {
  const isCorrect = userAnswer === question.correctAnswer;
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: T.radiusLg,
        padding: "1.25rem 1.5rem",
        marginBottom: "10px",
        boxShadow: T.shadow,
        animation: `fadeUp 0.3s ease ${Math.min(index * 0.03, 0.3)}s both`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
          marginBottom: "14px",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            fontFamily: T.font,
            lineHeight: "1.65",
            color: T.ink,
            flex: 1,
          }}
        >
          <span
            style={{
              fontFamily: T.fontMono,
              fontSize: "11px",
              color: T.inkFaint,
              marginRight: "7px",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          {question.questionText}
        </p>
        <Badge variant={isCorrect ? "correct" : "incorrect"}>
          {isCorrect ? "✓ Correct" : "✗ Incorrect"}
        </Badge>
      </div>
      {question.options.map((opt, i) => (
        <ReviewOption
          key={i}
          option={opt}
          isCorrect={opt === question.correctAnswer}
          isUserAnswer={opt === userAnswer}
        />
      ))}
      <ExplanationToggle text={question.explanation} />
    </div>
  );
}

/* ─── Stat cell ─── */
function StatCell({ value, label, accent }) {
  return (
    <div
      style={{
        background: T.surfaceAlt,
        borderRadius: T.radius,
        padding: "1rem 0.75rem",
        textAlign: "center",
        border: `1px solid ${T.border}`,
      }}
    >
      <div
        style={{
          fontSize: "24px",
          fontFamily: T.font,
          fontWeight: "600",
          color: accent || T.ink,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "11px",
          fontFamily: T.fontSans,
          color: T.inkFaint,
          marginTop: "4px",
          letterSpacing: "0.03em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════ */
function SubjectTestPage() {
  const { subjectId, topicId } = useParams();
  const navigate = useNavigate();
  const isTopicMode = Boolean(topicId);

  const [subject, setSubject] = useState(null);
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const [reviewMode, setReviewMode] = useState("all");
  const resultSavedRef = useRef(false);

  useEffect(() => {
    injectFonts();
    injectStyles();
  }, []);

  const defaultDuration = subject?.duration || 300;

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const token = localStorage.getItem("userToken");

        if (!token) {
          navigate("/user-login");
          return;
        }

        const userRequest = { _tokenType: "user" };

        if (isTopicMode) {
          const [topicResponse, questionsResponse] = await Promise.all([
            api.get(`/api/topics/${topicId}`, userRequest),
            api.get(`/api/questions/topic/${topicId}`, userRequest),
          ]);
          const selectedTopic = topicResponse.data;
          if (!selectedTopic) throw new Error("Topic not found");
          const resolvedSubjectId =
            selectedTopic.subjectId?._id || selectedTopic.subjectId;
          const subjectResponse = await api.get(
            `/api/subjects/${resolvedSubjectId}`,
            userRequest,
          );
          const unique = Array.from(
            new Map(questionsResponse.data.map((q) => [q._id, q])).values(),
          );
          setTopic(selectedTopic);
          setSubject(subjectResponse.data);
          setQuestions(
            shuffleArray(
              unique.map((q) => ({ ...q, options: shuffleArray(q.options) })),
            ),
          );
        } else {
          const [subjectResponse, questionsResponse] = await Promise.all([
            api.get(`/api/subjects/${subjectId}`, userRequest),
            api.get(`/api/questions/subject/${subjectId}`, userRequest),
          ]);
          const unique = Array.from(
            new Map(questionsResponse.data.map((q) => [q._id, q])).values(),
          );
          setTopic(null);
          setSubject(subjectResponse.data);
          setQuestions(
            shuffleArray(
              unique.map((q) => ({ ...q, options: shuffleArray(q.options) })),
            ),
          );
        }
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
        setReviewMode("all");
        resultSavedRef.current = false;
      } catch (err) {
        console.error(err);
        setErrorMessage("Unable to load this test right now.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPageData();
  }, [subjectId, topicId, isTopicMode, navigate]);

  useEffect(() => {
    if (!subject) return;
    setTimeLeft(subject.duration || 300);
  }, [subject]);

  useEffect(() => {
    if (isLoading || showResults || questions.length === 0) return;
    if (timeLeft <= 0) {
      setShowResults(true);
      return;
    }
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, isLoading, showResults, questions.length]);

  const score = useMemo(
    () =>
      questions.reduce(
        (n, q) => (selectedAnswers[q._id] === q.correctAnswer ? n + 1 : n),
        0,
      ),
    [questions, selectedAnswers],
  );

  useEffect(() => {
    if (!showResults || resultSavedRef.current || !subject || questions.length === 0) {
      return;
    }

    const saveResult = async () => {
      try {
        resultSavedRef.current = true;
        const timeUsed = Math.max(0, (subject.duration || 300) - timeLeft);

        await api.post(
          "/api/results",
          {
            subjectId: subject._id,
            topicId: isTopicMode ? topicId : null,
            score,
            total: questions.length,
            timeTaken: timeUsed,
            mode: isTopicMode ? "topic" : "subject",
          },
          { _tokenType: "user" },
        );
      } catch (error) {
        resultSavedRef.current = false;
        console.error("Failed to save result:", error);
      }
    };

    saveResult();
  }, [showResults, subject, questions.length, score, timeLeft, isTopicMode, topicId]);

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = questions.length
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;
  const breadcrumb = isTopicMode
    ? `${subject?.name} · ${topic?.name || ""}`
    : subject?.name || "";

  const getPerformanceMessage = () => {
    if (!questions.length) return "";
    const pct = score / questions.length;
    if (pct === 1) return "Perfect score";
    if (pct === 0) return "Keep studying";
    if (pct >= 0.8) return "Excellent work";
    if (pct >= 0.5) return "Good progress";
    return "Keep practicing";
  };

  const handleRetakeTest = () => {
    resultSavedRef.current = false;
    setReviewMode("all");
    setQuestions(
      shuffleArray(
        questions.map((q) => ({ ...q, options: shuffleArray(q.options) })),
      ),
    );
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setTimeLeft(defaultDuration);
  };

  const handleStopTest = () => {
    if (
      window.confirm("Stop test? Unanswered questions will count as incorrect.")
    ) {
      setShowResults(true);
    }
  };

  const handleSubmit = () => {
    if (answeredCount !== questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setShowResults(true);
  };

  /* ── shared page shell ── */
  const page = (children) => (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        fontFamily: T.fontSans,
        color: T.ink,
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "2.5rem 1.25rem 4rem",
        }}
      >
        {children}
      </div>
    </div>
  );

  /* ── Loading ── */
  if (isLoading)
    return page(
      <div style={{ textAlign: "center", paddingTop: "5rem" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: `2px solid ${T.accentLight}`,
            borderTop: `2px solid ${T.accent}`,
            animation: "pulse 1s linear infinite",
            margin: "0 auto 12px",
          }}
        />
        <p style={{ fontSize: "13px", color: T.inkFaint }}>
          Loading questions…
        </p>
      </div>,
    );

  /* ── Error ── */
  if (errorMessage)
    return page(
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: T.radiusLg,
          padding: "2rem",
          boxShadow: T.shadow,
        }}
      >
        <p style={{ marginBottom: "1rem", color: T.inkMid, fontSize: "14px" }}>
          {errorMessage}
        </p>
        <Btn onClick={() => navigate("/user")}>← Back to subjects</Btn>
      </div>,
    );

  if (!subject) return null;

  /* ── Empty ── */
  if (questions.length === 0)
    return page(
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: T.radiusLg,
          padding: "2rem",
          boxShadow: T.shadow,
        }}
      >
        <p style={{ fontWeight: "500", marginBottom: "6px" }}>{breadcrumb}</p>
        <p style={{ color: T.inkFaint, fontSize: "14px" }}>
          No questions available for this test yet.
        </p>
      </div>,
    );

  /* ══════════════════════════════════════
     RESULTS VIEW
  ══════════════════════════════════════ */
  if (showResults) {
    const timeUsed = Math.max(0, defaultDuration - timeLeft);
    const percentage = Math.round((score / questions.length) * 100);
    const wrongQuestions = questions.filter(
      (question) => selectedAnswers[question._id] !== question.correctAnswer,
    );
    const reviewQuestions = reviewMode === "wrong" ? wrongQuestions : questions;

    return page(
      <>
        {/* Score card */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusLg,
            padding: "2rem",
            marginBottom: "1.25rem",
            boxShadow: T.shadowMd,
            animation: "fadeUp 0.4s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: T.accentLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon.trophy />
            </div>
            <div>
              <p
                style={{
                  fontSize: "11px",
                  fontFamily: T.fontSans,
                  color: T.inkFaint,
                  fontWeight: "500",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: "2px",
                }}
              >
                {breadcrumb}
              </p>
              <h2
                style={{
                  fontSize: "20px",
                  fontFamily: T.font,
                  fontWeight: "600",
                  color: T.ink,
                }}
              >
                {getPerformanceMessage()}
              </h2>
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "8px",
              marginBottom: "1.5rem",
            }}
          >
            <StatCell
              value={`${percentage}%`}
              label="Score"
              accent={T.accent}
            />
            <StatCell
              value={`${score} / ${questions.length}`}
              label="Correct"
            />
            <StatCell value={formatTime(timeUsed)} label="Time used" />
          </div>

          {/* Progress bar */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                fontFamily: T.fontSans,
                color: T.inkFaint,
                marginBottom: "6px",
              }}
            >
              <span>Performance</span>
              <span
                style={{
                  color: percentage >= 50 ? T.accent : T.danger,
                  fontWeight: "500",
                }}
              >
                {percentage}%
              </span>
            </div>
            <div
              style={{
                height: "5px",
                background: "#ECEAE3",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${percentage}%`,
                  height: "100%",
                  background: percentage >= 50 ? T.accent : T.danger,
                  borderRadius: "999px",
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* Question map */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radius,
            padding: "1rem 1.25rem",
            marginBottom: "1.25rem",
            boxShadow: T.shadow,
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontFamily: T.fontSans,
              color: T.inkFaint,
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: "10px",
            }}
          >
            Question overview
          </p>
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {questions.map((q, i) => {
              const correct = selectedAnswers[q._id] === q.correctAnswer;
              return (
                <span
                  key={q._id}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "7px",
                    background: correct ? "#E4F2E9" : T.dangerLight,
                    color: correct ? T.accent : T.danger,
                    fontSize: "11px",
                    fontFamily: T.fontMono,
                    fontWeight: "500",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${correct ? "#B8DDC3" : T.dangerBorder}`,
                  }}
                >
                  {i + 1}
                </span>
              );
            })}
          </div>
        </div>

        {/* Per-question review */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "1rem",
          }}
        >
          <Btn
            variant={reviewMode === "all" ? "primary" : "secondary"}
            onClick={() => setReviewMode("all")}
          >
            All questions
          </Btn>
          <Btn
            variant={reviewMode === "wrong" ? "primary" : "secondary"}
            onClick={() => setReviewMode("wrong")}
          >
            Wrong answers only ({wrongQuestions.length})
          </Btn>
        </div>

        {reviewMode === "wrong" && wrongQuestions.length === 0 ? (
          <div
            style={{
              background: T.accentLight,
              border: "1px solid #B8DDC3",
              borderRadius: T.radiusLg,
              padding: "1.25rem",
              color: T.accent,
              marginBottom: "1rem",
            }}
          >
            Perfect score. No wrong answers to review.
          </div>
        ) : (
          reviewQuestions.map((question) => (
            <QuestionReviewCard
              key={question._id}
              question={question}
              index={questions.findIndex((q) => q._id === question._id)}
              userAnswer={selectedAnswers[question._id]}
            />
          ))
        )}

        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "1.75rem",
          }}
        >
          <Btn variant="primary" onClick={handleRetakeTest}>
            Retake test
          </Btn>
          <Btn onClick={() => navigate(`/subject/${subject._id}/topics`)}>
            ← Back to topics
          </Btn>
        </div>
      </>,
    );
  }

  /* ══════════════════════════════════════
     TEST VIEW
  ══════════════════════════════════════ */
  const timeWarn = timeLeft <= 60;

  return page(
    <>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
          animation: "fadeUp 0.3s ease",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "11px",
              color: T.inkFaint,
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: "4px",
            }}
          >
            {breadcrumb}
          </p>
          <h2
            style={{
              fontSize: "22px",
              fontFamily: T.font,
              fontWeight: "600",
              color: T.ink,
            }}
          >
            {isTopicMode ? "Topic test" : "Subject test"}
          </h2>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 13px",
              borderRadius: T.radius,
              background: timeWarn ? T.dangerLight : T.surface,
              border: `1px solid ${timeWarn ? T.dangerBorder : T.border}`,
              fontSize: "14px",
              fontFamily: T.fontMono,
              fontWeight: "500",
              color: timeWarn ? T.danger : T.ink,
              transition: "all 0.3s",
            }}
          >
            <Icon.clock warn={timeWarn} />
            {formatTime(timeLeft)}
          </div>
          <Btn variant="danger" onClick={handleStopTest}>
            Stop
          </Btn>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: "1.5rem", animation: "fadeUp 0.35s ease" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            fontFamily: T.fontSans,
            color: T.inkFaint,
            marginBottom: "8px",
          }}
        >
          <span>
            Question{" "}
            <span
              style={{
                fontWeight: "600",
                color: T.ink,
                fontFamily: T.fontMono,
              }}
            >
              {currentQuestionIndex + 1}
            </span>{" "}
            of {questions.length}
          </span>
          <span>
            Answered{" "}
            <span
              style={{
                fontWeight: "600",
                color: T.ink,
                fontFamily: T.fontMono,
              }}
            >
              {answeredCount}
            </span>
            /{questions.length}
          </span>
        </div>
        <div
          style={{
            height: "4px",
            background: "#ECEAE3",
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: T.accent,
              borderRadius: "999px",
              transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </div>
      </div>

      {/* Question card */}
      <div
        key={currentQuestionIndex}
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: T.radiusLg,
          padding: "1.75rem",
          boxShadow: T.shadowMd,
          animation: `fadeUp 0.3s ease`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "1.25rem",
          }}
        >
          <Badge variant="neutral">
            Q{String(currentQuestionIndex + 1).padStart(2, "0")}
          </Badge>
        </div>

        <p
          style={{
            fontSize: "15px",
            fontFamily: T.font,
            lineHeight: "1.75",
            color: T.ink,
            marginBottom: "1.5rem",
          }}
        >
          {currentQuestion.questionText}
        </p>

        <div>
          {currentQuestion.options.map((option, i) => {
            const isSelected = selectedAnswers[currentQuestion._id] === option;
            return (
              <label
                key={i}
                className="quiz-option"
                onClick={() =>
                  setSelectedAnswers((prev) => ({
                    ...prev,
                    [currentQuestion._id]: option,
                  }))
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "11px 15px",
                  borderRadius: T.radius,
                  cursor: "pointer",
                  fontSize: "14px",
                  fontFamily: T.fontSans,
                  marginBottom: "7px",
                  border: `1px solid ${isSelected ? T.accentMid : T.border}`,
                  background: isSelected ? T.accentLight : "transparent",
                  color: isSelected ? T.accent : T.ink,
                  transition:
                    "border-color 0.15s, background 0.15s, color 0.15s",
                }}
              >
                <div
                  style={{
                    width: "17px",
                    height: "17px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    border: `1.5px solid ${isSelected ? T.accent : T.borderStrong}`,
                    background: isSelected ? T.accent : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                >
                  {isSelected && (
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        background: "#fff",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </div>
                <span style={{ flex: 1 }}>{option}</span>
                {isSelected && (
                  <span
                    style={{
                      fontSize: "11px",
                      color: T.accentMid,
                      fontWeight: "500",
                    }}
                  >
                    Selected
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "1.25rem",
        }}
      >
        <Btn
          onClick={() => setCurrentQuestionIndex((p) => p - 1)}
          disabled={currentQuestionIndex === 0}
        >
          <Icon.left /> Back
        </Btn>

        {/* Dot nav */}
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          {questions.slice(0, Math.min(questions.length, 12)).map((q, i) => {
            const isActive = i === currentQuestionIndex;
            const isAnswered = Boolean(selectedAnswers[q._id]);
            return (
              <div
                key={i}
                className="dot-nav"
                onClick={() => setCurrentQuestionIndex(i)}
                style={{
                  width: isActive ? "20px" : "7px",
                  height: "7px",
                  borderRadius: "999px",
                  background: isActive
                    ? T.accent
                    : isAnswered
                      ? `${T.accent}55`
                      : "#D0CFC6",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            );
          })}
        </div>

        {currentQuestionIndex < questions.length - 1 ? (
          <Btn
            variant="primary"
            onClick={() => setCurrentQuestionIndex((p) => p + 1)}
            disabled={!selectedAnswers[currentQuestion._id]}
          >
            Next <Icon.right />
          </Btn>
        ) : (
          <Btn
            variant="primary"
            onClick={handleSubmit}
            disabled={!selectedAnswers[currentQuestion._id]}
          >
            Submit
          </Btn>
        )}
      </div>
    </>,
  );
}

export default SubjectTestPage;
