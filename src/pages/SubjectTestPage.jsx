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
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  warningBorder: "#FCD34D",
  flag: "#EF4444",
  flagLight: "#FEE2E2",
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
  @keyframes modalScale {
    from { 
      opacity: 0; 
      transform: translate(-50%, -50%) scale(0.95);
    }
    to { 
      opacity: 1; 
      transform: translate(-50%, -50%) scale(1);
    }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes flagPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(12px); }
    to { opacity: 1; transform: translateX(0); }
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
  .flag-btn {
    position: relative;
    overflow: hidden;
  }
  .flag-btn::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255,255,255,0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s;
  }
  .flag-btn:active::after {
    width: 40px;
    height: 40px;
  }
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
  flag: ({ filled = false }) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 2v12m0 0h7a2 2 0 002-2V4a2 2 0 00-2-2H3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
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
  skip: () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 4l6 4-6 4V4z" fill="currentColor" />
      <path
        d="M10 4v8"
        stroke="currentColor"
        strokeWidth="1.5"
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
    flagged: { bg: T.flagLight, color: T.flag, border: "#FCA5A5" },
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
        gap: "4px",
      }}
    >
      {children}
    </span>
  );
}

/* ─── Button ─── */
function Btn({
  variant = "ghost",
  children,
  onClick,
  disabled,
  style = {},
  isIconOnly = false,
}) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: isIconOnly ? "8px" : "10px 16px",
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
    flag: {
      background: "transparent",
      color: T.flag,
      border: `1.5px solid ${T.flag}`,
    },
    flagActive: {
      background: T.flag,
      color: "#fff",
      border: `1.5px solid ${T.flag}`,
    },
  };
  return (
    <button
      className="quiz-btn flag-btn"
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}
      title={variant === "flag" ? "Flag for review" : ""}
    >
      {children}
    </button>
  );
}

/* ─── Flagged indicator badge with dropdown ─── */
function FlaggedBadge({
  count,
  questions,
  selectedAnswers,
  currentQuestionIndex,
  onSelectFlagged,
  flaggedQuestions,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  if (count === 0) return null;

  const flaggedQuestionsList = questions.filter((q) =>
    flaggedQuestions.has(q._id),
  );

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "relative",
      }}
    >
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "20px",
          background: T.flagLight,
          border: `1.5px solid ${T.flag}`,
          cursor: "pointer",
          transition: "all 0.2s",
          fontSize: "12px",
          fontWeight: "600",
          color: T.flag,
          animation: "slideInRight 0.3s ease",
          fontFamily: T.fontSans,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = T.flag;
          e.currentTarget.style.color = "#fff";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          if (!showDropdown) {
            e.currentTarget.style.background = T.flagLight;
            e.currentTarget.style.color = T.flag;
            e.currentTarget.style.transform = "scale(1)";
          }
        }}
      >
        <Icon.flag filled />
        <span>{count}</span>
      </button>

      {showDropdown && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "calc(100vw - 32px)",
            maxWidth: "320px",
            maxHeight: "60vh",
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusLg,
            boxShadow: T.shadowMd,
            zIndex: 1000,
            overflowY: "auto",
            animation: "modalScale 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div
            style={{
              padding: "12px",
              borderBottom: `1px solid ${T.border}`,
              fontSize: "12px",
              fontWeight: "600",
              color: T.inkFaint,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              position: "sticky",
              top: 0,
              background: T.surface,
              zIndex: 10,
            }}
          >
            Flagged Questions ({count})
          </div>

          {flaggedQuestionsList.map((question, idx) => {
            const questionIndex = questions.findIndex(
              (q) => q._id === question._id,
            );
            const isAnswered = Boolean(selectedAnswers[question._id]);
            const isCurrent = questionIndex === currentQuestionIndex;

            return (
              <button
                key={question._id}
                onClick={() => {
                  onSelectFlagged(questionIndex);
                  setShowDropdown(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px",
                  borderBottom:
                    idx < flaggedQuestionsList.length - 1
                      ? `1px solid ${T.border}`
                      : "none",
                  background: isCurrent ? T.accentLight : "transparent",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  transition: "all 0.15s",
                  fontSize: "13px",
                  color: T.ink,
                  fontFamily: T.fontSans,
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) {
                    e.currentTarget.style.background = "var(--surface-alt)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    background: T.flagLight,
                    color: T.flag,
                    fontSize: "12px",
                    fontWeight: "600",
                    flexShrink: 0,
                  }}
                >
                  {questionIndex + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      fontWeight: "500",
                      color: T.ink,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Q{String(questionIndex + 1).padStart(2, "0")}
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "12px",
                      color: T.inkMid,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {question.questionText}
                  </p>
                </div>
                {isAnswered && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: T.accentLight,
                      color: T.accent,
                      fontSize: "11px",
                      flexShrink: 0,
                    }}
                  >
                    <Icon.check />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
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
function QuestionReviewCard({
  question,
  index,
  userAnswer,
  imageSrc,
  isFlagged,
}) {
  const isCorrect = userAnswer === question.correctAnswer;
  const displayImageSrc = imageSrc || questionImageSrc(question);
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${isFlagged ? T.flag : T.border}`,
        borderRadius: T.radiusLg,
        padding: "1.5rem",
        marginBottom: "1rem",
        boxShadow: isFlagged
          ? `0 0 0 2px ${T.flagLight}, ${T.shadow}`
          : T.shadow,
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
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: "14px",
              lineHeight: "1.65",
              color: T.ink,
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
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {isFlagged && (
            <Badge variant="flagged">
              <Icon.flag filled /> Flagged
            </Badge>
          )}
          <Badge variant={isCorrect ? "correct" : "incorrect"}>
            {isCorrect ? "✓ Correct" : "✗ Incorrect"}
          </Badge>
        </div>
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
  const testMode = searchParams.get("mode") || "";
  const requestedLimit = Number(searchParams.get("limit") || 0);
  const isRandomMode =
    !isTopicMode && testMode === "random" && requestedLimit > 0;

  const [subject, setSubject] = useState(null);
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionImages, setQuestionImages] = useState({});
  const [isPreloadingImages, setIsPreloadingImages] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const [reviewMode, setReviewMode] = useState("all");
  const [showFlaggedFilter, setShowFlaggedFilter] = useState(false);
  const [stoppedTest, setStoppedTest] = useState(false);
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

          const randomizedQuestions = shuffleArray(
            unique.map((q) => ({ ...q, options: shuffleArray(q.options) })),
          );

          const preparedQuestions = isRandomMode
            ? randomizedQuestions.slice(
                0,
                Math.min(requestedLimit, randomizedQuestions.length),
              )
            : randomizedQuestions;

          setTopic(null);
          setSubject(subjectResponse.data);
          setQuestionImages({});
          setQuestions(preparedQuestions);
          preloadImagesInBatches(preparedQuestions);
        }
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setFlaggedQuestions(new Set());
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
  }, [subjectId, topicId, isTopicMode, isRandomMode, requestedLimit, navigate]);

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
      questions.length === 0 ||
      stoppedTest
    ) {
      return;
    }

    const saveResult = async () => {
      try {
        resultSavedRef.current = true;
        const timeUsed = Math.max(0, (subject.duration || 300) - timeLeft);

        const response = await api.post(
          "/api/results",
          {
            subjectId: subject._id,
            topicId: isTopicMode ? topicId : null,
            score,
            total: questions.length,
            timeTaken: timeUsed,
            mode: isTopicMode ? "topic" : isRandomMode ? "random" : "subject",
          },
          { _tokenType: "user" },
        );

        if (response.data?.unlockedBadges?.length) {
          sessionStorage.setItem(
            "newBadge",
            JSON.stringify(response.data.unlockedBadges[0]),
          );
        }
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
    isRandomMode,
    topicId,
    stoppedTest,
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
    : isRandomMode
      ? `${subject?.name || ""} · Randomized Practice`
      : subject?.name || "";
  const flaggedCount = flaggedQuestions.size;
  const isFlaggedCurrentQuestion = flaggedQuestions.has(currentQuestion?._id);

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion._id)) {
        next.delete(currentQuestion._id);
      } else {
        next.add(currentQuestion._id);
      }
      return next;
    });
  };

  const handleSkipQuestion = () => {
    // Move to next unanswered question or next question overall
    const nextIndex = questions.findIndex(
      (q, i) => i > currentQuestionIndex && !selectedAnswers[q._id],
    );
    if (nextIndex !== -1) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      // No unanswered questions ahead, go to next question
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }
  };

  const handleGoToFlagged = (questionIndex) => {
    setCurrentQuestionIndex(questionIndex);
  };

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
    setFlaggedQuestions(new Set());
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setTimeLeft(defaultDuration);
  };

  const handleStopTest = () => {
    if (
      window.confirm(
        "Stop test? You'll see corrections for all questions you attempted.",
      )
    ) {
      setStoppedTest(true);
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

    // Show corrections view when test is stopped (no grading)
    if (stoppedTest) {
      return page(
        <>
          {/* Corrections header */}
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "0",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: T.radius,
                  background: T.warningLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "24px",
                }}
              >
                📋
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
                  Review Your Answers
                </h2>
              </div>
            </div>
          </div>

          {/* Summary stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <StatCell value={answeredCount} label="Answered" />
            <StatCell
              value={questions.length - answeredCount}
              label="Not Answered"
            />
            <StatCell value={flaggedCount} label="Flagged" />
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
              All questions ({questions.length})
            </Btn>
            <Btn
              variant={reviewMode === "answered" ? "primary" : "ghost"}
              onClick={() => setReviewMode("answered")}
            >
              Answered ({answeredCount})
            </Btn>
            {flaggedCount > 0 && (
              <Btn
                variant={reviewMode === "flagged" ? "primary" : "ghost"}
                onClick={() => setReviewMode("flagged")}
              >
                <Icon.flag filled /> Flagged ({flaggedCount})
              </Btn>
            )}
          </div>

          {/* Questions review */}
          {(reviewMode === "all"
            ? questions
            : reviewMode === "answered"
              ? questions.filter((q) => selectedAnswers[q._id])
              : questions.filter((q) => flaggedQuestions.has(q._id))
          ).map((question) => (
            <QuestionReviewCard
              key={question._id}
              question={question}
              index={questions.findIndex((q) => q._id === question._id)}
              userAnswer={selectedAnswers[question._id]}
              imageSrc={getDisplayImageSrc(question)}
              isFlagged={flaggedQuestions.has(question._id)}
            />
          ))}

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
            <Btn
              variant="primary"
              onClick={() => {
                setStoppedTest(false);
                setReviewMode("all");
                setQuestions(
                  shuffleArray(
                    questions.map((q) => ({
                      ...q,
                      options: shuffleArray(q.options),
                    })),
                  ),
                );
                setSelectedAnswers({});
                setFlaggedQuestions(new Set());
                setCurrentQuestionIndex(0);
                setShowResults(false);
                setTimeLeft(defaultDuration);
              }}
            >
              Retake Test
            </Btn>
            <Btn onClick={() => navigate(`/subject/${subject._id}/topics`)}>
              ← Back to topics
            </Btn>
          </div>
        </>,
      );
    }

    // Show normal graded results view
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
              const isFlagged = flaggedQuestions.has(q._id);
              return (
                <span
                  key={q._id}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    background: isFlagged
                      ? T.flagLight
                      : correct
                        ? T.successLight
                        : T.dangerLight,
                    color: isFlagged ? T.flag : correct ? T.success : T.danger,
                    fontSize: "12px",
                    fontWeight: "600",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${
                      isFlagged ? T.flag : correct ? "#86efac" : T.dangerBorder
                    }`,
                    position: "relative",
                  }}
                >
                  {isFlagged && (
                    <Icon.flag
                      filled
                      style={{
                        position: "absolute",
                        fontSize: "10px",
                      }}
                    />
                  )}
                  {!isFlagged && i + 1}
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
          {flaggedCount > 0 && (
            <Btn
              variant={reviewMode === "flagged" ? "primary" : "ghost"}
              onClick={() => setReviewMode("flagged")}
            >
              <Icon.flag filled /> Flagged ({flaggedCount})
            </Btn>
          )}
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
          (reviewMode === "flagged"
            ? questions.filter((q) => flaggedQuestions.has(q._id))
            : reviewQuestions
          ).map((question) => (
            <QuestionReviewCard
              key={question._id}
              question={question}
              index={questions.findIndex((q) => q._id === question._id)}
              userAnswer={selectedAnswers[question._id]}
              imageSrc={getDisplayImageSrc(question)}
              isFlagged={flaggedQuestions.has(question._id)}
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
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {flaggedCount > 0 && (
            <FlaggedBadge
              count={flaggedCount}
              questions={questions}
              selectedAnswers={selectedAnswers}
              currentQuestionIndex={currentQuestionIndex}
              onSelectFlagged={handleGoToFlagged}
              flaggedQuestions={flaggedQuestions}
            />
          )}
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
          border: `1px solid ${isFlaggedCurrentQuestion ? T.flag : T.border}`,
          borderRadius: T.radiusLg,
          padding: "2rem",
          boxShadow: isFlaggedCurrentQuestion
            ? `0 0 0 2px ${T.flagLight}, ${T.shadowMd}`
            : T.shadowMd,
          animation: `fadeUp 0.3s ease`,
          marginBottom: "1.5rem",
          transition: "all 0.2s",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Badge variant={isFlaggedCurrentQuestion ? "flagged" : "neutral"}>
            {isFlaggedCurrentQuestion && <Icon.flag filled />}Q
            {String(currentQuestionIndex + 1).padStart(2, "0")}
          </Badge>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Btn
              onClick={handleSkipQuestion}
              isIconOnly
              title="Skip this question"
            >
              <Icon.skip />
            </Btn>
            <Btn
              variant={isFlaggedCurrentQuestion ? "flagActive" : "flag"}
              onClick={toggleFlag}
              isIconOnly
            >
              <Icon.flag filled={isFlaggedCurrentQuestion} />
            </Btn>
          </div>
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
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gridTemplateRows: "auto auto",
          alignItems: "center",
          gap: "1rem",
          marginTop: "1.5rem",
        }}
      >
        {/* Back button - top left */}
        <Btn
          onClick={() => setCurrentQuestionIndex((p) => p - 1)}
          disabled={currentQuestionIndex === 0}
        >
          <Icon.left /> Back
        </Btn>

        {/* Dot nav - spans middle columns */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gridColumn: "2",
            gridRow: "1",
            minWidth: 0,
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          {questions.slice(0, Math.min(questions.length, 12)).map((q, i) => {
            const isActive = i === currentQuestionIndex;
            const isAnswered = Boolean(selectedAnswers[q._id]);
            const isFlagged = flaggedQuestions.has(q._id);
            return (
              <div
                key={i}
                className="dot-nav"
                onClick={() => setCurrentQuestionIndex(i)}
                style={{
                  width: isActive ? "22px" : "8px",
                  height: "8px",
                  borderRadius: "999px",
                  background: isFlagged
                    ? T.flag
                    : isActive
                      ? T.accent
                      : isAnswered
                        ? `${T.accent}66`
                        : "var(--border-strong)",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                  border: isFlagged ? `1px solid ${T.flag}` : "none",
                  flexShrink: 0,
                }}
              />
            );
          })}
        </div>

        {/* Next/Submit button - top right */}
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
