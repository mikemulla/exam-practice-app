import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import * as FireworksPreset from "react-canvas-confetti/dist/presets/fireworks";

const resolvePresetComponent = (presetModule) => {
  const candidates = [
    presetModule?.default?.default,
    presetModule?.default?.Fireworks,
    presetModule?.Fireworks?.default,
    presetModule?.Fireworks,
    presetModule?.default,
    presetModule,
  ];

  return candidates.find(
    (candidate) =>
      typeof candidate === "function" ||
      Boolean(candidate && candidate.$$typeof),
  );
};

const Fireworks = resolvePresetComponent(FireworksPreset);

/* ─── Design tokens ─── */
const T = {
  bg: "var(--bg-primary)",
  surface: "var(--bg-secondary)",
  surfaceAlt: "var(--surface-alt)",
  border: "var(--border-color)",
  borderStrong: "var(--border-strong)",
  ink: "var(--text-primary)",
  inkMid: "var(--text-secondary)",
  inkFaint: "var(--text-secondary)",
  accent: "var(--button-primary)",
  accentLight: "#E6F1FB",
  accentMid: "#0e3d6e",
  accentDark: "#042C53",
  success: "#16A34A",
  successLight: "#DCFCE7",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  dangerBorder: "#FCA5A5",
  radius: "10px",
  radiusSm: "6px",
  radiusLg: "14px",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowMd: "0 2px 8px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)",
  fontSans: "Inter, system-ui, sans-serif",
};

const injectFonts = () => {
  if (document.getElementById("test-fonts")) return;
  const link = document.createElement("link");
  link.id = "test-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";
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
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .quiz-option {
    transition: all 0.2s ease;
  }
  .quiz-option:hover {
    border-color: ${T.accent} !important;
    background: ${T.accentLight} !important;
  }
  .quiz-btn:hover { opacity: 0.88; transform: translateY(-1px); }
  .quiz-btn:active { transform: scale(0.98); }
  .dot-nav {
    transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  }
  .dot-nav:hover { transform: scale(1.4); }
`;

const injectStyles = () => {
  if (document.getElementById("test-styles")) return;
  const s = document.createElement("style");
  s.id = "test-styles";
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

const questionImageSrc = (question) => {
  if (!question) return "";

  if (question.imageData && question.imageContentType) {
    if (String(question.imageData).startsWith("data:")) {
      return question.imageData;
    }
    return `data:${question.imageContentType};base64,${question.imageData}`;
  }

  const rawImageUrl =
    question.imageUrl ||
    question.image ||
    question.questionImage ||
    question.imagePath ||
    "";

  if (!rawImageUrl) return "";

  if (
    String(rawImageUrl).startsWith("http") ||
    String(rawImageUrl).startsWith("data:")
  ) {
    return rawImageUrl;
  }

  const baseUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000";

  return `${baseUrl}${String(rawImageUrl).startsWith("/") ? "" : "/"}${rawImageUrl}`;
};

/* ─── Icons ─── */
const Icon = {
  left: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M10 12L6 8l4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  right: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  clock: ({ warn }) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke={warn ? T.danger : T.inkMid}
        strokeWidth="1.3"
      />
      <path
        d="M8 5.5v2.5l1.5 1"
        stroke={warn ? T.danger : T.inkMid}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  ),
  check: () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
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
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 21h8M12 17v4M7 4H4a1 1 0 00-1 1v2a4 4 0 004 4h.5M17 4h3a1 1 0 011 1v2a4 4 0 01-4 4h-.5"
        stroke={T.accent}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7 4h10v6a5 5 0 01-10 0V4z"
        stroke={T.accent}
        strokeWidth="1.5"
      />
    </svg>
  ),
};

/* ─── Badge ─── */
function Badge({ variant, children }) {
  const variants = {
    correct: { bg: T.successLight, color: T.success, border: "#86efac" },
    incorrect: { bg: T.dangerLight, color: T.danger, border: T.dangerBorder },
    info: { bg: T.accentLight, color: T.accent, border: "#bfdbfe" },
    neutral: { bg: "var(--surface-alt)", color: T.inkMid, border: T.border },
  };
  const c = variants[variant] || variants.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: "12px",
        fontWeight: "600",
        padding: "4px 10px",
        borderRadius: "6px",
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
    padding: "10px 16px",
    borderRadius: T.radiusSm,
    fontSize: "13px",
    fontWeight: "600",
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    transition: "all 0.2s",
    opacity: disabled ? 0.5 : 1,
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
      disabled={disabled}
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
  const color = isWrong ? T.danger : T.success;
  const bg = isWrong ? T.dangerLight : T.successLight;
  const border = isWrong ? T.dangerBorder : "#86efac";
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
        padding: "10px 12px",
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
          fontSize: "11px",
        }}
      >
        {isCorrect ? <Icon.check /> : <Icon.x />}
      </span>
      <span style={{ fontSize: "13px", flex: 1 }}>{option}</span>
      <span
        style={{
          fontSize: "11px",
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
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          fontSize: "13px",
          color: T.accent,
          fontWeight: "600",
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
            color: T.inkMid,
            lineHeight: "1.7",
            marginTop: "10px",
            padding: "12px 14px",
            background: T.surfaceAlt,
            borderRadius: T.radiusSm,
            borderLeft: `3px solid ${T.accent}`,
            animation: "fadeIn 0.2s ease",
            margin: "10px 0 0",
          }}
        >
          {text}
        </p>
      )}
    </div>
  );
}

/* ─── Question review card ─── */
function QuestionReviewCard({ question, index, userAnswer, imageSrc }) {
  const isCorrect = userAnswer === question.correctAnswer;
  const displayImageSrc = imageSrc || questionImageSrc(question);
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: T.radiusLg,
        padding: "1.5rem",
        marginBottom: "1rem",
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
          marginBottom: "1rem",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            lineHeight: "1.65",
            color: T.ink,
            flex: 1,
            margin: 0,
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: T.inkFaint,
              marginRight: "8px",
              fontWeight: "600",
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

      {displayImageSrc && (
        <div
          style={{
            margin: "0 0 1rem",
            padding: "10px",
            background: T.surfaceAlt,
            border: `1px solid ${T.border}`,
            borderRadius: T.radius,
          }}
        >
          <img
            src={displayImageSrc}
            alt="Question"
            style={{
              display: "block",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "360px",
              objectFit: "contain",
              borderRadius: T.radiusSm,
              margin: "0 auto",
            }}
          />
        </div>
      )}

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
function StatCell({ value, label }) {
  return (
    <div
      style={{
        background: T.surfaceAlt,
        borderRadius: T.radiusSm,
        padding: "1rem",
        textAlign: "center",
        border: `1px solid ${T.border}`,
      }}
    >
      <p
        style={{
          fontSize: "24px",
          fontWeight: "700",
          color: T.accent,
          lineHeight: 1.1,
          margin: 0,
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: "12px",
          color: T.inkFaint,
          marginTop: "6px",
          margin: "6px 0 0",
          fontWeight: "500",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════ */
function SubjectTestPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const subjectId = params.subjectId || searchParams.get("subjectId") || "";
  const topicId = params.topicId || searchParams.get("topicId") || "";
  const isTopicMode = Boolean(topicId);

  const [subject, setSubject] = useState(null);
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionImages, setQuestionImages] = useState({});
  const [isPreloadingImages, setIsPreloadingImages] = useState(false);
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

  const makeImageSrc = (imageData, imageContentType) => {
    if (!imageData || !imageContentType) return "";
    if (String(imageData).startsWith("data:")) return imageData;
    return `data:${imageContentType};base64,${imageData}`;
  };

  const getDisplayImageSrc = (question) => {
    if (!question?._id) return "";
    return questionImages[question._id] || questionImageSrc(question);
  };

  const fetchQuestionImage = async (questionId) => {
    const response = await api.get(`/api/questions/${questionId}/image`, {
      _tokenType: "user",
    });

    return makeImageSrc(
      response.data?.imageData,
      response.data?.imageContentType,
    );
  };

  const preloadImagesInBatches = async (questionList, batchSize = 5) => {
    const imageQuestions = questionList.filter(
      (question) =>
        question?._id &&
        (question.hasImage ||
          question.imageContentType ||
          question.imageSize) &&
        !question.imageData,
    );

    if (imageQuestions.length === 0) return;

    setIsPreloadingImages(true);

    try {
      for (let i = 0; i < imageQuestions.length; i += batchSize) {
        const batch = imageQuestions.slice(i, i + batchSize);

        const loadedImages = await Promise.all(
          batch.map(async (question) => {
            try {
              const imageSrc = await fetchQuestionImage(question._id);
              return [question._id, imageSrc];
            } catch (error) {
              console.error(
                "Question image preload failed:",
                question._id,
                error,
              );
              return [question._id, ""];
            }
          }),
        );

        setQuestionImages((previousImages) => {
          const nextImages = { ...previousImages };

          loadedImages.forEach(([questionId, imageSrc]) => {
            if (imageSrc) nextImages[questionId] = imageSrc;
          });

          return nextImages;
        });
      }
    } finally {
      setIsPreloadingImages(false);
    }
  };

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

        if (!subjectId && !topicId) {
          throw new Error("Missing subject or topic ID");
        }

        if (isTopicMode) {
          const [topicResponse, questionsResponse] = await Promise.all([
            api.get(`/api/topics/${topicId}`, userRequest),
            api.get(`/api/questions/topic/${topicId}`, userRequest),
          ]);
          const selectedTopic = topicResponse.data;
          if (!selectedTopic) throw new Error("Topic not found");
          const resolvedSubjectId =
            selectedTopic.subjectId?._id ||
            selectedTopic.subject?._id ||
            selectedTopic.subjectId ||
            selectedTopic.subject;

          if (!resolvedSubjectId) {
            throw new Error("Topic subject not found");
          }

          const subjectResponse = await api.get(
            `/api/subjects/${resolvedSubjectId}`,
            userRequest,
          );
          const unique = Array.from(
            new Map(questionsResponse.data.map((q) => [q._id, q])).values(),
          );

          const preparedQuestions = shuffleArray(
            unique.map((q) => ({ ...q, options: shuffleArray(q.options) })),
          );

          setTopic(selectedTopic);
          setSubject(subjectResponse.data);
          setQuestionImages({});
          setQuestions(preparedQuestions);
          preloadImagesInBatches(preparedQuestions);
        } else {
          const [subjectResponse, questionsResponse] = await Promise.all([
            api.get(`/api/subjects/${subjectId}`, userRequest),
            api.get(`/api/questions/subject/${subjectId}`, userRequest),
          ]);
          const unique = Array.from(
            new Map(questionsResponse.data.map((q) => [q._id, q])).values(),
          );

          const preparedQuestions = shuffleArray(
            unique.map((q) => ({ ...q, options: shuffleArray(q.options) })),
          );

          setTopic(null);
          setSubject(subjectResponse.data);
          setQuestionImages({});
          setQuestions(preparedQuestions);
          preloadImagesInBatches(preparedQuestions);
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

  const isPerfectScore =
    showResults && questions.length > 0 && score === questions.length;


  useEffect(() => {
    if (
      !showResults ||
      resultSavedRef.current ||
      !subject ||
      questions.length === 0
    ) {
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
  }, [
    showResults,
    subject,
    questions.length,
    score,
    timeLeft,
    isTopicMode,
    topicId,
  ]);

  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionImageSrc = currentQuestion
    ? getDisplayImageSrc(currentQuestion)
    : "";
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
        fontFamily: "'Inter', sans-serif",
        color: T.ink,
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "2rem 1.25rem 4rem",
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
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: `3px solid ${T.accentLight}`,
            borderTop: `3px solid ${T.accent}`,
            animation: "pulse 1s linear infinite",
            margin: "0 auto 1rem",
          }}
        />
        <p style={{ fontSize: "14px", color: T.inkFaint }}>
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
          border: `1px solid ${T.dangerBorder}`,
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
        <p style={{ fontWeight: "600", marginBottom: "6px" }}>{breadcrumb}</p>
        <p style={{ color: T.inkFaint, fontSize: "14px", margin: 0 }}>
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
        {isPerfectScore && Fireworks && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              width: "100vw",
              height: "100vh",
              pointerEvents: "none",
              zIndex: 9999,
            }}
          >
            <Fireworks
              key={`perfect-fireworks-${score}-${questions.length}`}
              autorun={{ speed: 3 }}
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        )}

        {/* Score card */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusLg,
            padding: "2rem",
            marginBottom: "1.5rem",
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
                width: "52px",
                height: "52px",
                borderRadius: T.radius,
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
                  fontSize: "12px",
                  color: T.inkFaint,
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "4px",
                }}
              >
                {breadcrumb}
              </p>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: T.ink,
                  margin: 0,
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
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <StatCell value={`${percentage}%`} label="Score" />
            <StatCell value={`${score}/${questions.length}`} label="Correct" />
            <StatCell value={formatTime(timeUsed)} label="Time used" />
          </div>

          {/* Progress bar */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                color: T.inkFaint,
                marginBottom: "8px",
                fontWeight: "500",
              }}
            >
              <span>Performance</span>
              <span style={{ color: percentage >= 50 ? T.success : T.danger }}>
                {percentage}%
              </span>
            </div>
            <div
              style={{
                height: "6px",
                background: "#e2e8f0",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${percentage}%`,
                  height: "100%",
                  background:
                    percentage >= 50
                      ? `linear-gradient(90deg, ${T.success} 0%, ${T.accent} 100%)`
                      : T.danger,
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
            padding: "1.25rem",
            marginBottom: "1.5rem",
            boxShadow: T.shadow,
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: T.inkFaint,
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "1rem",
              margin: "0 0 1rem",
            }}
          >
            Question overview
          </p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {questions.map((q, i) => {
              const correct = selectedAnswers[q._id] === q.correctAnswer;
              return (
                <span
                  key={q._id}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    background: correct ? T.successLight : T.dangerLight,
                    color: correct ? T.success : T.danger,
                    fontSize: "12px",
                    fontWeight: "600",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${correct ? "#86efac" : T.dangerBorder}`,
                  }}
                >
                  {i + 1}
                </span>
              );
            })}
          </div>
        </div>

        {/* Review filter */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "1.5rem",
          }}
        >
          <Btn
            variant={reviewMode === "all" ? "primary" : "ghost"}
            onClick={() => setReviewMode("all")}
          >
            All questions
          </Btn>
          <Btn
            variant={reviewMode === "wrong" ? "primary" : "ghost"}
            onClick={() => setReviewMode("wrong")}
          >
            Incorrect ({wrongQuestions.length})
          </Btn>
        </div>

        {/* Perfect score message */}
        {reviewMode === "wrong" && wrongQuestions.length === 0 ? (
          <div
            style={{
              background: T.successLight,
              border: `1px solid #86efac`,
              borderRadius: T.radiusLg,
              padding: "1.25rem",
              color: T.success,
              marginBottom: "1rem",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            🎉 Perfect score! No incorrect answers to review.
          </div>
        ) : (
          reviewQuestions.map((question) => (
            <QuestionReviewCard
              key={question._id}
              question={question}
              index={questions.findIndex((q) => q._id === question._id)}
              userAnswer={selectedAnswers[question._id]}
              imageSrc={getDisplayImageSrc(question)}
            />
          ))
        )}

        {/* Footer actions */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "2rem",
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
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
          animation: "fadeUp 0.3s ease",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "12px",
              color: T.inkFaint,
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "4px",
            }}
          >
            {breadcrumb}
          </p>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: T.ink,
              margin: 0,
            }}
          >
            Start the test
          </h2>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 14px",
              borderRadius: T.radiusSm,
              background: timeWarn ? T.dangerLight : T.surface,
              border: `1px solid ${timeWarn ? T.dangerBorder : T.border}`,
              fontSize: "14px",
              fontWeight: "600",
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
            fontSize: "13px",
            color: T.inkFaint,
            marginBottom: "8px",
            fontWeight: "500",
          }}
        >
          <span>
            Question{" "}
            <span style={{ color: T.ink, fontWeight: "700" }}>
              {currentQuestionIndex + 1}
            </span>{" "}
            of {questions.length}
          </span>
          <span>
            Answered{" "}
            <span style={{ color: T.ink, fontWeight: "700" }}>
              {answeredCount}
            </span>
            /{questions.length}
          </span>
        </div>
        <div
          style={{
            height: "6px",
            background: "#e2e8f0",
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
          padding: "2rem",
          boxShadow: T.shadowMd,
          animation: `fadeUp 0.3s ease`,
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <Badge variant="neutral">
            Q{String(currentQuestionIndex + 1).padStart(2, "0")}
          </Badge>
        </div>

        <p
          style={{
            fontSize: "16px",
            lineHeight: "1.75",
            color: T.ink,
            marginBottom: "1.5rem",
          }}
        >
          {currentQuestion.questionText}
        </p>

        {currentQuestionImageSrc && (
          <div
            style={{
              margin: "0 0 1.5rem",
              padding: "10px",
              background: T.surfaceAlt,
              border: `1px solid ${T.border}`,
              borderRadius: T.radius,
              animation: "fadeIn 0.25s ease",
            }}
          >
            <img
              src={currentQuestionImageSrc}
              alt="Question"
              style={{
                display: "block",
                width: "100%",
                maxWidth: "600px",
                maxHeight: "380px",
                objectFit: "contain",
                borderRadius: T.radiusSm,
                margin: "0 auto",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        {!currentQuestionImageSrc &&
          (Boolean(currentQuestion?.hasImage) ||
            Boolean(currentQuestion?.imageContentType) ||
            Boolean(currentQuestion?.imageSize)) && (
            <div
              style={{
                margin: "-0.5rem 0 1.5rem",
                padding: "14px",
                background: T.surfaceAlt,
                border: `1px dashed ${T.borderStrong}`,
                borderRadius: T.radius,
                color: T.inkMid,
                fontSize: "13px",
                fontFamily: T.fontSans,
                textAlign: "center",
                animation: "pulse 1.2s ease-in-out infinite",
              }}
            >
              Loading image...
            </div>
          )}

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
                  padding: "12px 14px",
                  borderRadius: T.radius,
                  cursor: "pointer",
                  fontSize: "14px",
                  marginBottom: "8px",
                  border: `1px solid ${isSelected ? T.accent : T.border}`,
                  background: isSelected ? T.accentLight : "transparent",
                  color: isSelected ? T.accentDark : T.ink,
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
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
                      color: T.accent,
                      fontWeight: "600",
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
          gap: "1rem",
        }}
      >
        <Btn
          onClick={() => setCurrentQuestionIndex((p) => p - 1)}
          disabled={currentQuestionIndex === 0}
        >
          <Icon.left /> Back
        </Btn>

        {/* Dot nav */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {questions.slice(0, Math.min(questions.length, 12)).map((q, i) => {
            const isActive = i === currentQuestionIndex;
            const isAnswered = Boolean(selectedAnswers[q._id]);
            return (
              <div
                key={i}
                className="dot-nav"
                onClick={() => setCurrentQuestionIndex(i)}
                style={{
                  width: isActive ? "22px" : "8px",
                  height: "8px",
                  borderRadius: "999px",
                  background: isActive
                    ? T.accent
                    : isAnswered
                      ? `${T.accent}66`
                      : "var(--border-strong)",
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
