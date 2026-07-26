import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import * as FireworksPreset from "react-canvas-confetti/dist/presets/fireworks";

/* ═══════════════════════════════════════════════
   Preset resolver
═══════════════════════════════════════════════ */
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
    (c) => typeof c === "function" || Boolean(c && c.$$typeof),
  );
};

const Fireworks = resolvePresetComponent(FireworksPreset);

/* ═══════════════════════════════════════════════
   Theme & Global Styles
═══════════════════════════════════════════════ */
const THEME_CSS = `
  :root {
    --q-bg: #f6f7f9;
    --q-surface: #ffffff;
    --q-ink: #0f172a;
    --q-ink-secondary: #475569;
    --q-ink-muted: #94a3b8;
    --q-border: #e2e8f0;
    --q-border-hover: #cbd5e1;
    --q-accent: #2563eb;
    --q-accent-soft: #eff6ff;
    --q-accent-hover: #1d4ed8;
    --q-success: #10b981;
    --q-success-soft: #ecfdf5;
    --q-danger: #ef4444;
    --q-danger-soft: #fef2f2;
    --q-warning: #f59e0b;
    --q-warning-soft: #fffbeb;
    --q-flag: #f43f5e;
    --q-flag-soft: #fff1f2;
    --q-radius: 16px;
    --q-radius-sm: 12px;
    --q-radius-xs: 8px;
    --q-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04);
    --q-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
    --q-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05);
    --q-transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
    --q-font: "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --q-bg: #0f172a;
      --q-surface: #1e293b;
      --q-ink: #f8fafc;
      --q-ink-secondary: #94a3b8;
      --q-ink-muted: #64748b;
      --q-border: #334155;
      --q-border-hover: #475569;
      --q-accent: #3b82f6;
      --q-accent-soft: rgba(59,130,246,0.12);
      --q-accent-hover: #60a5fa;
      --q-success: #34d399;
      --q-success-soft: rgba(52,211,153,0.12);
      --q-danger: #f87171;
      --q-danger-soft: rgba(248,113,113,0.12);
      --q-warning: #fbbf24;
      --q-warning-soft: rgba(251,191,36,0.12);
      --q-flag: #fb7185;
      --q-flag-soft: rgba(251,113,133,0.12);
      --q-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.2), 0 1px 2px -1px rgb(0 0 0 / 0.2);
      --q-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3);
      --q-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3);
    }
  }

  @keyframes q-fade-up {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes q-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes q-slide-right {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes q-scale-in {
    from { opacity: 0; transform: scale(0.96); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes q-pulse-soft {
    0%, 100% { opacity: 1; }
    50% { opacity: .6; }
  }

  .q-card { animation: q-fade-up 0.35s ease both; }
  .q-option { transition: all var(--q-transition); cursor: pointer; }
  .q-option:hover { border-color: var(--q-accent); background: var(--q-accent-soft); }
  .q-btn { transition: all var(--q-transition); }
  .q-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
  .q-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
  .q-nav-dot { transition: all var(--q-transition); }
  .q-nav-dot:hover { transform: scale(1.15); }
`;

const injectGlobalStyles = () => {
  if (document.getElementById("q-styles")) return;
  const style = document.createElement("style");
  style.id = "q-styles";
  style.textContent = THEME_CSS;
  document.head.appendChild(style);

  if (document.getElementById("q-fonts")) return;
  const link = document.createElement("link");
  link.id = "q-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
  document.head.appendChild(link);
};

/* ═══════════════════════════════════════════════
   Utilities
═══════════════════════════════════════════════ */
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

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const questionImageSrc = (question) => {
  if (!question) return "";
  if (question.imageData && question.imageContentType) {
    if (String(question.imageData).startsWith("data:"))
      return question.imageData;
    return `data:${question.imageContentType};base64,${question.imageData}`;
  }
  const raw =
    question.imageUrl ||
    question.image ||
    question.questionImage ||
    question.imagePath ||
    "";
  if (!raw) return "";
  if (String(raw).startsWith("http") || String(raw).startsWith("data:"))
    return raw;
  const base =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000";
  return `${base}${String(raw).startsWith("/") ? "" : "/"}${raw}`;
};

/* ═══════════════════════════════════════════════
   Icons
═══════════════════════════════════════════════ */
const Icon = ({ name, size = 16, className = "", style = {} }) => {
  const s = { width: size, height: size, ...style };
  const stroke = "currentColor";
  const sw = 1.5;

  const paths = {
    left: (
      <path
        d="M10 12L6 8l4-4"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    right: (
      <path
        d="M6 4l4 4-4 4"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    clock: (
      <>
        <circle cx="8" cy="8" r="6" stroke={stroke} strokeWidth="1.3" />
        <path
          d="M8 5.5v2.5l1.5 1"
          stroke={stroke}
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </>
    ),
    flag: ({ filled } = {}) => (
      <path
        d="M3 2v12m0 0h7a2 2 0 002-2V4a2 2 0 00-2-2H3"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
      />
    ),
    check: (
      <path
        d="M1.5 6l3 3 6-6"
        stroke={stroke}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    x: (
      <>
        <path
          d="M2.5 2.5l7 7M9.5 2.5l-7 7"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </>
    ),
    skip: (
      <>
        <path d="M2 4l6 4-6 4V4z" fill="currentColor" />
        <path
          d="M10 4v8"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinecap="round"
        />
      </>
    ),
    chevron: ({ open } = {}) => (
      <path
        d="M4.5 3l3 3-3 3"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: "transform 0.25s",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
        }}
      />
    ),
    trophy: (
      <>
        <path
          d="M8 21h8M12 17v4M7 4H4a1 1 0 00-1 1v2a4 4 0 004 4h.5M17 4h3a1 1 0 011 1v2a4 4 0 01-4 4h-.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M7 4h10v6a5 5 0 01-10 0V4z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </>
    ),
  };

  const content =
    name === "flag"
      ? paths.flag({ filled: style.filled })
      : paths[name] || null;
  return (
    <svg viewBox="0 0 16 16" fill="none" style={s} className={className}>
      {content}
    </svg>
  );
};

/* ═══════════════════════════════════════════════
   Sub-components
═══════════════════════════════════════════════ */

const Badge = ({ variant, children, style = {} }) => {
  const map = {
    correct: {
      bg: "var(--q-success-soft)",
      color: "var(--q-success)",
      border: "var(--q-success)",
    },
    incorrect: {
      bg: "var(--q-danger-soft)",
      color: "var(--q-danger)",
      border: "var(--q-danger)",
    },
    flagged: {
      bg: "var(--q-flag-soft)",
      color: "var(--q-flag)",
      border: "var(--q-flag)",
    },
    info: {
      bg: "var(--q-accent-soft)",
      color: "var(--q-accent)",
      border: "var(--q-accent)",
    },
    neutral: {
      bg: "transparent",
      color: "var(--q-ink-muted)",
      border: "var(--q-border)",
    },
  };
  const v = map[variant] || map.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "11px",
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: "999px",
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        letterSpacing: "0.02em",
        lineHeight: 1,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

const Button = ({
  variant = "secondary",
  children,
  onClick,
  disabled,
  style = {},
  title,
}) => {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "10px 18px",
    borderRadius: "var(--q-radius-xs)",
    fontSize: "13px",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    fontFamily: "inherit",
    opacity: disabled ? 0.45 : 1,
    letterSpacing: "0.01em",
    whiteSpace: "nowrap",
  };
  const variants = {
    primary: { background: "var(--q-accent)", color: "#fff" },
    secondary: {
      background: "var(--q-surface)",
      color: "var(--q-ink-secondary)",
      border: "1px solid var(--q-border)",
    },
    ghost: { background: "transparent", color: "var(--q-ink-secondary)" },
    danger: { background: "var(--q-danger-soft)", color: "var(--q-danger)" },
    flag: {
      background: "transparent",
      color: "var(--q-flag)",
      border: "1.5px solid var(--q-flag)",
    },
    flagActive: {
      background: "var(--q-flag)",
      color: "#fff",
      border: "1.5px solid var(--q-flag)",
    },
  };
  const v = variants[variant] || variants.secondary;
  return (
    <button
      className="q-btn"
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      title={title}
      style={{ ...base, ...v, ...style }}
    >
      {children}
    </button>
  );
};

const Stat = ({ value, label }) => (
  <div
    style={{
      background: "var(--q-surface)",
      borderRadius: "var(--q-radius-sm)",
      padding: "20px 16px",
      textAlign: "center",
      border: "1px solid var(--q-border)",
      boxShadow: "var(--q-shadow)",
    }}
  >
    <div
      style={{
        fontSize: "28px",
        fontWeight: 700,
        color: "var(--q-accent)",
        lineHeight: 1.1,
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontSize: "11px",
        color: "var(--q-ink-muted)",
        marginTop: "6px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}
    >
      {label}
    </div>
  </div>
);

const CircularProgress = ({ percentage, size = 120, stroke = 8 }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percentage / 100) * c;
  const color = percentage >= 50 ? "var(--q-success)" : "var(--q-danger)";

  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--q-border)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: c,
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 1s ease",
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <span
          style={{ fontSize: "22px", fontWeight: 700, color: "var(--q-ink)" }}
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
};

const QuestionReviewCard = ({
  question,
  index,
  userAnswer,
  imageSrc,
  isFlagged,
}) => {
  const isCorrect = userAnswer === question.correctAnswer;
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div
      className="q-card"
      style={{
        background: "var(--q-surface)",
        border: `1px solid ${isFlagged ? "var(--q-flag)" : "var(--q-border)"}`,
        borderRadius: "var(--q-radius)",
        padding: "24px",
        marginBottom: "16px",
        boxShadow: isFlagged
          ? "0 0 0 3px var(--q-flag-soft), var(--q-shadow-md)"
          : "var(--q-shadow-md)",
        animationDelay: `${Math.min(index * 0.04, 0.3)}s`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        <p
          style={{
            fontSize: "15px",
            lineHeight: 1.65,
            color: "var(--q-ink)",
            margin: 0,
            flex: 1,
          }}
        >
          <span
            style={{
              color: "var(--q-ink-muted)",
              fontWeight: 600,
              marginRight: "8px",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          {question.questionText}
        </p>
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          {isFlagged && (
            <Badge variant="flagged">
              <Icon name="flag" size={12} style={{ filled: true }} /> Flagged
            </Badge>
          )}
          <Badge variant={isCorrect ? "correct" : "incorrect"}>
            {isCorrect ? "Correct" : "Incorrect"}
          </Badge>
        </div>
      </div>

      {imageSrc && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            background: "var(--q-bg)",
            borderRadius: "var(--q-radius-sm)",
            border: "1px solid var(--q-border)",
          }}
        >
          <img
            src={imageSrc}
            alt="Question"
            style={{
              display: "block",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "320px",
              objectFit: "contain",
              borderRadius: "var(--q-radius-xs)",
              margin: "0 auto",
            }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {question.options.map((opt, i) => {
          const isUser = opt === userAnswer;
          const isRight = opt === question.correctAnswer;
          if (!isUser && !isRight) return null;
          const wrong = isUser && !isRight;
          const bg = wrong ? "var(--q-danger-soft)" : "var(--q-success-soft)";
          const color = wrong ? "var(--q-danger)" : "var(--q-success)";
          const border = wrong ? "var(--q-danger)" : "var(--q-success)";
          const label =
            isRight && isUser
              ? "Your answer · correct"
              : isRight
                ? "Correct answer"
                : "Your answer · incorrect";

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "var(--q-radius-xs)",
                background: bg,
                border: `1px solid ${border}`,
                color,
                fontSize: "13px",
              }}
            >
              <span
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: color,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name={wrong ? "x" : "check"} size={10} />
              </span>
              <span style={{ flex: 1 }}>{opt}</span>
              <span
                style={{ fontSize: "11px", opacity: 0.8, whiteSpace: "nowrap" }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {question.explanation && (
        <div style={{ marginTop: "16px" }}>
          <button
            onClick={() => setShowExplanation((p) => !p)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontSize: "13px",
              color: "var(--q-accent)",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontFamily: "inherit",
            }}
          >
            <Icon name="chevron" size={12} style={{ open: showExplanation }} />
            {showExplanation ? "Hide explanation" : "Show explanation"}
          </button>
          {showExplanation && (
            <div
              style={{
                marginTop: "10px",
                padding: "14px",
                background: "var(--q-bg)",
                borderRadius: "var(--q-radius-xs)",
                borderLeft: "3px solid var(--q-accent)",
                fontSize: "13px",
                color: "var(--q-ink-secondary)",
                lineHeight: 1.7,
                animation: "q-fade-in 0.2s ease",
              }}
            >
              {question.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   Keyboard hook
═══════════════════════════════════════════════ */
const useKeyboard = (handlers, deps) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;
      const key = e.key.toLowerCase();
      if (handlers[key]) handlers[key](e);
      if (handlers["any"]) handlers["any"](e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

/* ═══════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════ */
export default function SubjectTestPage() {
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
  const [stoppedTest, setStoppedTest] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const resultSavedRef = useRef(false);
  const perfectScoreAudioRef = useRef(null);
  const hasPlayedPerfectScoreRef = useRef(false);
  const optionRefs = useRef([]);

  const defaultDuration = subject?.duration || 300;

  useEffect(() => {
    injectGlobalStyles();
    perfectScoreAudioRef.current = new Audio("/sounds/perfect-score.mp3");
    perfectScoreAudioRef.current.volume = 0.8;
    return () => {
      if (perfectScoreAudioRef.current) {
        perfectScoreAudioRef.current.pause();
        perfectScoreAudioRef.current = null;
      }
    };
  }, []);

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

  const preloadImagesInBatches = useCallback(
    async (questionList, batchSize = 5) => {
      const imageQuestions = questionList.filter(
        (q) =>
          q?._id &&
          (q.hasImage || q.imageContentType || q.imageSize) &&
          !q.imageData,
      );
      if (imageQuestions.length === 0) return;
      setIsPreloadingImages(true);
      try {
        for (let i = 0; i < imageQuestions.length; i += batchSize) {
          const batch = imageQuestions.slice(i, i + batchSize);
          const loaded = await Promise.all(
            batch.map(async (q) => {
              try {
                const src = await fetchQuestionImage(q._id);
                return [q._id, src];
              } catch (e) {
                console.error("Image preload failed", q._id, e);
                return [q._id, ""];
              }
            }),
          );
          setQuestionImages((prev) => {
            const next = { ...prev };
            loaded.forEach(([id, src]) => {
              if (src) next[id] = src;
            });
            return next;
          });
        }
      } finally {
        setIsPreloadingImages(false);
      }
    },
    [],
  );

  /* ── Data fetch ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const token = localStorage.getItem("userToken");
        if (!token) {
          navigate("/user-login");
          return;
        }
        const req = { _tokenType: "user" };
        if (!subjectId && !topicId)
          throw new Error("Missing subject or topic ID");

        if (isTopicMode) {
          const [topicRes, qRes] = await Promise.all([
            api.get(`/api/topics/${topicId}`, req),
            api.get(`/api/questions/topic/${topicId}`, req),
          ]);
          const t = topicRes.data;
          if (!t) throw new Error("Topic not found");
          const sid =
            t.subjectId?._id || t.subject?._id || t.subjectId || t.subject;
          if (!sid) throw new Error("Topic subject not found");
          const subRes = await api.get(`/api/subjects/${sid}`, req);
          const unique = Array.from(
            new Map(qRes.data.map((q) => [q._id, q])).values(),
          );
          const prepared = shuffleArray(
            unique.map((q) => ({ ...q, options: shuffleArray(q.options) })),
          );
          setTopic(t);
          setSubject(subRes.data);
          setQuestionImages({});
          setQuestions(prepared);
          preloadImagesInBatches(prepared);
        } else {
          const [subRes, qRes] = await Promise.all([
            api.get(`/api/subjects/${subjectId}`, req),
            api.get(`/api/questions/subject/${subjectId}`, req),
          ]);
          const unique = Array.from(
            new Map(qRes.data.map((q) => [q._id, q])).values(),
          );
          const randomized = shuffleArray(
            unique.map((q) => ({ ...q, options: shuffleArray(q.options) })),
          );
          const prepared = isRandomMode
            ? randomized.slice(0, Math.min(requestedLimit, randomized.length))
            : randomized;
          setTopic(null);
          setSubject(subRes.data);
          setQuestionImages({});
          setQuestions(prepared);
          preloadImagesInBatches(prepared);
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
    fetchData();
  }, [
    subjectId,
    topicId,
    isTopicMode,
    isRandomMode,
    requestedLimit,
    navigate,
    preloadImagesInBatches,
  ]);

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
      isPerfectScore &&
      !hasPlayedPerfectScoreRef.current &&
      perfectScoreAudioRef.current
    ) {
      hasPlayedPerfectScoreRef.current = true;
      perfectScoreAudioRef.current.currentTime = 0;
      perfectScoreAudioRef.current.play().catch(() => {});
    }
  }, [isPerfectScore]);

  useEffect(() => {
    if (
      !showResults ||
      resultSavedRef.current ||
      !subject ||
      questions.length === 0 ||
      stoppedTest
    )
      return;
    const save = async () => {
      try {
        resultSavedRef.current = true;
        const timeUsed = Math.max(0, (subject.duration || 300) - timeLeft);
        const res = await api.post(
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
        if (res.data?.unlockedBadges?.length) {
          sessionStorage.setItem(
            "newBadge",
            JSON.stringify(res.data.unlockedBadges[0]),
          );
        }
      } catch (e) {
        resultSavedRef.current = false;
        console.error("Failed to save result", e);
      }
    };
    save();
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
  const currentImageSrc = currentQuestion
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
  const isFlaggedCurrent = currentQuestion
    ? flaggedQuestions.has(currentQuestion._id)
    : false;

  const goToQuestion = useCallback(
    (idx) => {
      setCurrentQuestionIndex(clamp(idx, 0, questions.length - 1));
      setSidebarOpen(false);
    },
    [questions.length],
  );

  const toggleFlag = useCallback(() => {
    if (!currentQuestion) return;
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion._id)) next.delete(currentQuestion._id);
      else next.add(currentQuestion._id);
      return next;
    });
  }, [currentQuestion]);

  const selectOption = useCallback(
    (option) => {
      if (!currentQuestion) return;
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestion._id]: option,
      }));
    },
    [currentQuestion],
  );

  const handleSkip = useCallback(() => {
    const next = questions.findIndex(
      (q, i) => i > currentQuestionIndex && !selectedAnswers[q._id],
    );
    if (next !== -1) goToQuestion(next);
    else if (currentQuestionIndex < questions.length - 1)
      goToQuestion(currentQuestionIndex + 1);
  }, [questions, currentQuestionIndex, selectedAnswers, goToQuestion]);

  const handleSubmit = () => {
    if (answeredCount !== questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setShowResults(true);
  };

  const handleRetake = () => {
    resultSavedRef.current = false;
    hasPlayedPerfectScoreRef.current = false;
    setReviewMode("all");
    setQuestions((prev) =>
      shuffleArray(
        prev.map((q) => ({ ...q, options: shuffleArray(q.options) })),
      ),
    );
    setSelectedAnswers({});
    setFlaggedQuestions(new Set());
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setStoppedTest(false);
    setTimeLeft(defaultDuration);
  };

  const handleStop = () => {
    if (
      window.confirm(
        "Stop test? You'll see corrections for questions you attempted.",
      )
    ) {
      setStoppedTest(true);
      setShowResults(true);
    }
  };

  /* ── Keyboard shortcuts ── */
  useKeyboard(
    {
      arrowleft: () =>
        currentQuestionIndex > 0 && goToQuestion(currentQuestionIndex - 1),
      arrowright: () =>
        currentQuestionIndex < questions.length - 1 &&
        goToQuestion(currentQuestionIndex + 1),
      f: () => toggleFlag(),
      s: () => handleSkip(),
      1: () => selectOption(currentQuestion?.options[0]),
      2: () => selectOption(currentQuestion?.options[1]),
      3: () => selectOption(currentQuestion?.options[2]),
      4: () => selectOption(currentQuestion?.options[3]),
      5: () => selectOption(currentQuestion?.options[4]),
      6: () => selectOption(currentQuestion?.options[5]),
    },
    [
      currentQuestionIndex,
      questions,
      currentQuestion,
      goToQuestion,
      toggleFlag,
      handleSkip,
      selectOption,
    ],
  );

  /* ── Helpers ── */
  const getPerformanceMessage = () => {
    if (!questions.length) return "";
    const pct = score / questions.length;
    if (pct === 1) return "Perfect score";
    if (pct === 0) return "Keep studying";
    if (pct >= 0.8) return "Excellent work";
    if (pct >= 0.5) return "Good progress";
    return "Keep practicing";
  };

  const page = (children) => (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--q-bg)",
        fontFamily: "var(--q-font)",
        color: "var(--q-ink)",
        paddingBottom: "48px",
      }}
    >
      {children}
    </div>
  );

  /* ══════════════════════════════════════
     Loading
  ══════════════════════════════════════ */
  if (isLoading) {
    return page(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "3px solid var(--q-border)",
            borderTopColor: "var(--q-accent)",
            animation: "q-pulse-soft 1s linear infinite",
          }}
        />
        <p
          style={{
            fontSize: "14px",
            color: "var(--q-ink-muted)",
            fontWeight: 500,
          }}
        >
          Loading questions…
        </p>
      </div>,
    );
  }

  if (errorMessage) {
    return page(
      <div
        style={{ maxWidth: "640px", margin: "0 auto", padding: "48px 20px" }}
      >
        <div
          className="q-card"
          style={{
            background: "var(--q-surface)",
            borderRadius: "var(--q-radius)",
            padding: "32px",
            boxShadow: "var(--q-shadow-md)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "var(--q-ink-secondary)",
              marginBottom: "20px",
              fontSize: "15px",
            }}
          >
            {errorMessage}
          </p>
          <Button onClick={() => navigate("/user")}>← Back to subjects</Button>
        </div>
      </div>,
    );
  }

  if (!subject) return null;

  if (questions.length === 0) {
    return page(
      <div
        style={{ maxWidth: "640px", margin: "0 auto", padding: "48px 20px" }}
      >
        <div
          className="q-card"
          style={{
            background: "var(--q-surface)",
            borderRadius: "var(--q-radius)",
            padding: "32px",
            boxShadow: "var(--q-shadow-md)",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: "6px", fontSize: "15px" }}>
            {breadcrumb}
          </p>
          <p
            style={{ color: "var(--q-ink-muted)", fontSize: "14px", margin: 0 }}
          >
            No questions available for this test yet.
          </p>
        </div>
      </div>,
    );
  }

  /* ══════════════════════════════════════
     RESULTS VIEW
  ══════════════════════════════════════ */
  if (showResults) {
    const timeUsed = Math.max(0, defaultDuration - timeLeft);
    const percentage = Math.round((score / questions.length) * 100);

    if (stoppedTest) {
      return page(
        <div
          style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 20px" }}
        >
          <div
            className="q-card"
            style={{
              background: "var(--q-surface)",
              borderRadius: "var(--q-radius)",
              padding: "32px",
              boxShadow: "var(--q-shadow-lg)",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "var(--q-radius-sm)",
                  background: "var(--q-warning-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                }}
              >
                📋
              </div>
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--q-ink-muted)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "4px",
                  }}
                >
                  {breadcrumb}
                </p>
                <h2 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
                  Review Your Answers
                </h2>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <Stat value={answeredCount} label="Answered" />
            <Stat
              value={questions.length - answeredCount}
              label="Not Answered"
            />
            <Stat value={flaggedCount} label="Flagged" />
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "24px",
            }}
          >
            <Button
              variant={reviewMode === "all" ? "primary" : "secondary"}
              onClick={() => setReviewMode("all")}
            >
              All ({questions.length})
            </Button>
            <Button
              variant={reviewMode === "answered" ? "primary" : "secondary"}
              onClick={() => setReviewMode("answered")}
            >
              Answered ({answeredCount})
            </Button>
            {flaggedCount > 0 && (
              <Button
                variant={reviewMode === "flagged" ? "primary" : "secondary"}
                onClick={() => setReviewMode("flagged")}
              >
                <Icon name="flag" size={12} style={{ filled: true }} /> Flagged
                ({flaggedCount})
              </Button>
            )}
          </div>

          {(reviewMode === "all"
            ? questions
            : reviewMode === "answered"
              ? questions.filter((q) => selectedAnswers[q._id])
              : questions.filter((q) => flaggedQuestions.has(q._id))
          ).map((q) => (
            <QuestionReviewCard
              key={q._id}
              question={q}
              index={questions.findIndex((x) => x._id === q._id)}
              userAnswer={selectedAnswers[q._id]}
              imageSrc={getDisplayImageSrc(q)}
              isFlagged={flaggedQuestions.has(q._id)}
            />
          ))}

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "32px",
            }}
          >
            <Button variant="primary" onClick={handleRetake}>
              Retake Test
            </Button>
            <Button onClick={() => navigate(`/subject/${subject._id}/topics`)}>
              ← Back to topics
            </Button>
          </div>
        </div>,
      );
    }

    const wrongQuestions = questions.filter(
      (q) => selectedAnswers[q._id] !== q.correctAnswer,
    );
    const reviewQuestions = reviewMode === "wrong" ? wrongQuestions : questions;

    return page(
      <div
        style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 20px" }}
      >
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
              key={`fw-${score}-${questions.length}`}
              autorun={{ speed: 3 }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        )}

        {/* Score hero */}
        <div
          className="q-card"
          style={{
            background: "var(--q-surface)",
            borderRadius: "var(--q-radius)",
            padding: "32px",
            boxShadow: "var(--q-shadow-lg)",
            marginBottom: "24px",
            display: "flex",
            flexWrap: "wrap",
            gap: "28px",
            alignItems: "center",
          }}
        >
          <CircularProgress percentage={percentage} />
          <div style={{ flex: 1, minWidth: "200px" }}>
            <p
              style={{
                fontSize: "11px",
                color: "var(--q-ink-muted)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "6px",
              }}
            >
              {breadcrumb}
            </p>
            <h2
              style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 8px" }}
            >
              {getPerformanceMessage()}
            </h2>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--q-ink-muted)",
                    fontWeight: 500,
                  }}
                >
                  Score
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "var(--q-ink)",
                  }}
                >
                  {score}/{questions.length}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--q-ink-muted)",
                    fontWeight: 500,
                  }}
                >
                  Time used
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "var(--q-ink)",
                  }}
                >
                  {formatTime(timeUsed)}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--q-ink-muted)",
                    fontWeight: 500,
                  }}
                >
                  Accuracy
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color:
                      percentage >= 50 ? "var(--q-success)" : "var(--q-danger)",
                  }}
                >
                  {percentage}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question map */}
        <div
          className="q-card"
          style={{
            background: "var(--q-surface)",
            borderRadius: "var(--q-radius)",
            padding: "20px",
            boxShadow: "var(--q-shadow-md)",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              color: "var(--q-ink-muted)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "12px",
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
                    borderRadius: "8px",
                    background: isFlagged
                      ? "var(--q-flag-soft)"
                      : correct
                        ? "var(--q-success-soft)"
                        : "var(--q-danger-soft)",
                    color: isFlagged
                      ? "var(--q-flag)"
                      : correct
                        ? "var(--q-success)"
                        : "var(--q-danger)",
                    fontSize: "12px",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${
                      isFlagged
                        ? "var(--q-flag)"
                        : correct
                          ? "var(--q-success)"
                          : "var(--q-danger)"
                    }`,
                  }}
                >
                  {isFlagged ? (
                    <Icon name="flag" size={12} style={{ filled: true }} />
                  ) : (
                    i + 1
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <Button
            variant={reviewMode === "all" ? "primary" : "secondary"}
            onClick={() => setReviewMode("all")}
          >
            All questions
          </Button>
          <Button
            variant={reviewMode === "wrong" ? "primary" : "secondary"}
            onClick={() => setReviewMode("wrong")}
          >
            Incorrect ({wrongQuestions.length})
          </Button>
          {flaggedCount > 0 && (
            <Button
              variant={reviewMode === "flagged" ? "primary" : "secondary"}
              onClick={() => setReviewMode("flagged")}
            >
              <Icon name="flag" size={12} style={{ filled: true }} /> Flagged (
              {flaggedCount})
            </Button>
          )}
        </div>

        {reviewMode === "wrong" && wrongQuestions.length === 0 ? (
          <div
            style={{
              background: "var(--q-success-soft)",
              borderRadius: "var(--q-radius)",
              padding: "20px",
              color: "var(--q-success)",
              textAlign: "center",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            🎉 Perfect score! No incorrect answers to review.
          </div>
        ) : (
          (reviewMode === "flagged"
            ? questions.filter((q) => flaggedQuestions.has(q._id))
            : reviewQuestions
          ).map((q) => (
            <QuestionReviewCard
              key={q._id}
              question={q}
              index={questions.findIndex((x) => x._id === q._id)}
              userAnswer={selectedAnswers[q._id]}
              imageSrc={getDisplayImageSrc(q)}
              isFlagged={flaggedQuestions.has(q._id)}
            />
          ))
        )}

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "32px",
          }}
        >
          <Button variant="primary" onClick={handleRetake}>
            Retake test
          </Button>
          <Button onClick={() => navigate(`/subject/${subject._id}/topics`)}>
            ← Back to topics
          </Button>
        </div>
      </div>,
    );
  }

  /* ══════════════════════════════════════
     TEST VIEW
  ══════════════════════════════════════ */
  const timeWarn = timeLeft <= 60;

  return page(
    <div
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        padding: "24px 20px",
        display: "flex",
        gap: "24px",
        alignItems: "flex-start",
      }}
    >
      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div
          className="q-card"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "20px",
            padding: "20px 24px",
            background: "var(--q-surface)",
            borderRadius: "var(--q-radius)",
            boxShadow: "var(--q-shadow-md)",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: "11px",
                color: "var(--q-ink-muted)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "4px",
              }}
            >
              {breadcrumb}
            </p>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              Start the test
            </h1>
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                borderRadius: "var(--q-radius-xs)",
                background: timeWarn ? "var(--q-danger-soft)" : "var(--q-bg)",
                border: `1px solid ${timeWarn ? "var(--q-danger)" : "var(--q-border)"}`,
                fontSize: "14px",
                fontWeight: 600,
                color: timeWarn ? "var(--q-danger)" : "var(--q-ink)",
                transition: "all var(--q-transition)",
              }}
            >
              <Icon name="clock" size={14} />
              {formatTime(timeLeft)}
            </div>
            <Button variant="danger" onClick={handleStop} title="Stop test">
              Stop
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "var(--q-ink-muted)",
              marginBottom: "8px",
              fontWeight: 500,
            }}
          >
            <span>
              Question{" "}
              <strong style={{ color: "var(--q-ink)" }}>
                {currentQuestionIndex + 1}
              </strong>{" "}
              of {questions.length}
            </span>
            <span>
              Answered{" "}
              <strong style={{ color: "var(--q-ink)" }}>{answeredCount}</strong>
              /{questions.length}
            </span>
          </div>
          <div
            style={{
              height: "4px",
              background: "var(--q-border)",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: "var(--q-accent)",
                borderRadius: "999px",
                transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div
          key={currentQuestionIndex}
          className="q-card"
          style={{
            background: "var(--q-surface)",
            borderRadius: "var(--q-radius)",
            padding: "28px",
            boxShadow: "var(--q-shadow-lg)",
            border: `1px solid ${isFlaggedCurrent ? "var(--q-flag)" : "var(--q-border)"}`,
            transition:
              "border-color var(--q-transition), box-shadow var(--q-transition)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <Badge variant={isFlaggedCurrent ? "flagged" : "neutral"}>
              {isFlaggedCurrent && (
                <Icon name="flag" size={12} style={{ filled: true }} />
              )}
              Q{String(currentQuestionIndex + 1).padStart(2, "0")}
            </Badge>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                onClick={handleSkip}
                title="Skip question (S)"
                style={{ padding: "8px 12px" }}
              >
                <Icon name="skip" size={14} /> Skip
              </Button>
              <Button
                variant={isFlaggedCurrent ? "flagActive" : "flag"}
                onClick={toggleFlag}
                title="Flag for review (F)"
                style={{ padding: "8px 12px" }}
              >
                <Icon
                  name="flag"
                  size={14}
                  style={{ filled: isFlaggedCurrent }}
                />
                {isFlaggedCurrent ? "Flagged" : "Flag"}
              </Button>
            </div>
          </div>

          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.7,
              color: "var(--q-ink)",
              marginBottom: "20px",
              fontWeight: 500,
            }}
          >
            {currentQuestion.questionText}
          </p>

          {currentImageSrc && (
            <div
              style={{
                marginBottom: "24px",
                padding: "12px",
                background: "var(--q-bg)",
                borderRadius: "var(--q-radius-sm)",
                border: "1px solid var(--q-border)",
                animation: "q-fade-in 0.3s ease",
              }}
            >
              <img
                src={currentImageSrc}
                alt="Question"
                style={{
                  display: "block",
                  width: "100%",
                  maxWidth: "560px",
                  maxHeight: "360px",
                  objectFit: "contain",
                  borderRadius: "var(--q-radius-xs)",
                  margin: "0 auto",
                }}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          )}

          {!currentImageSrc &&
            (Boolean(currentQuestion?.hasImage) ||
              Boolean(currentQuestion?.imageContentType) ||
              Boolean(currentQuestion?.imageSize)) && (
              <div
                style={{
                  marginBottom: "24px",
                  padding: "16px",
                  background: "var(--q-bg)",
                  border: "1px dashed var(--q-border-hover)",
                  borderRadius: "var(--q-radius-sm)",
                  color: "var(--q-ink-muted)",
                  fontSize: "13px",
                  textAlign: "center",
                  animation: "q-pulse-soft 1.2s ease-in-out infinite",
                }}
              >
                Loading image…
              </div>
            )}

          <div
            role="radiogroup"
            aria-label="Answer options"
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {currentQuestion.options.map((option, i) => {
              const isSelected =
                selectedAnswers[currentQuestion._id] === option;
              return (
                <label
                  key={i}
                  className="q-option"
                  onClick={() => selectOption(option)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 16px",
                    borderRadius: "var(--q-radius-sm)",
                    cursor: "pointer",
                    fontSize: "14px",
                    border: `1.5px solid ${isSelected ? "var(--q-accent)" : "var(--q-border)"}`,
                    background: isSelected
                      ? "var(--q-accent-soft)"
                      : "var(--q-surface)",
                    color: isSelected
                      ? "var(--q-accent-hover)"
                      : "var(--q-ink)",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  <input
                    type="radio"
                    name={`q-${currentQuestion._id}`}
                    checked={isSelected}
                    onChange={() => selectOption(option)}
                    style={{
                      position: "absolute",
                      opacity: 0,
                      width: 0,
                      height: 0,
                    }}
                  />
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      border: `2px solid ${isSelected ? "var(--q-accent)" : "var(--q-border-hover)"}`,
                      background: isSelected
                        ? "var(--q-accent)"
                        : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all var(--q-transition)",
                    }}
                  >
                    {isSelected && (
                      <div
                        style={{
                          width: "7px",
                          height: "7px",
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
                        color: "var(--q-accent)",
                        fontWeight: 700,
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

        {/* Bottom nav */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "20px",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Button
            onClick={() => goToQuestion(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
          >
            <Icon name="left" size={14} /> Back
          </Button>
          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              variant="primary"
              onClick={() => goToQuestion(currentQuestionIndex + 1)}
              disabled={!selectedAnswers[currentQuestion._id]}
            >
              Next <Icon name="right" size={14} />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!selectedAnswers[currentQuestion._id]}
            >
              Submit
            </Button>
          )}
        </div>
      </div>

      {/* Sidebar - Question Grid */}
      <aside
        style={{
          width: "260px",
          flexShrink: 0,
          position: "sticky",
          top: "24px",
          display: "none",
        }}
        className="q-sidebar"
      >
        <div
          style={{
            background: "var(--q-surface)",
            borderRadius: "var(--q-radius)",
            boxShadow: "var(--q-shadow-md)",
            padding: "20px",
            border: "1px solid var(--q-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--q-ink)",
                letterSpacing: "0.02em",
              }}
            >
              Questions
            </span>
            {flaggedCount > 0 && (
              <Badge variant="flagged">
                <Icon name="flag" size={10} style={{ filled: true }} />{" "}
                {flaggedCount}
              </Badge>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "6px",
            }}
          >
            {questions.map((q, i) => {
              const active = i === currentQuestionIndex;
              const answered = Boolean(selectedAnswers[q._id]);
              const flagged = flaggedQuestions.has(q._id);
              return (
                <button
                  key={q._id}
                  onClick={() => goToQuestion(i)}
                  className="q-nav-dot"
                  title={`Q${i + 1}${flagged ? " (flagged)" : ""}${answered ? " (answered)" : ""}`}
                  style={{
                    aspectRatio: "1",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: active
                      ? "var(--q-accent)"
                      : flagged
                        ? "var(--q-flag-soft)"
                        : answered
                          ? "var(--q-accent-soft)"
                          : "var(--q-bg)",
                    color: active
                      ? "#fff"
                      : flagged
                        ? "var(--q-flag)"
                        : answered
                          ? "var(--q-accent)"
                          : "var(--q-ink-muted)",
                    boxShadow: active
                      ? "0 0 0 2px var(--q-accent-soft)"
                      : "none",
                  }}
                >
                  {flagged ? (
                    <Icon name="flag" size={10} style={{ filled: true }} />
                  ) : (
                    i + 1
                  )}
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                color: "var(--q-ink-muted)",
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "3px",
                  background: "var(--q-accent)",
                }}
              />
              Current
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                color: "var(--q-ink-muted)",
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "3px",
                  background: "var(--q-accent-soft)",
                }}
              />
              Answered
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                color: "var(--q-ink-muted)",
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "3px",
                  background: "var(--q-flag-soft)",
                }}
              />
              Flagged
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen((p) => !p)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "var(--q-accent)",
          color: "#fff",
          border: "none",
          boxShadow: "var(--q-shadow-lg)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
        }}
        className="q-mobile-fab"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 40,
            animation: "q-fade-in 0.2s ease",
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "var(--q-surface)",
            borderRadius: "var(--q-radius) var(--q-radius) 0 0",
            padding: "24px",
            zIndex: 45,
            maxHeight: "60vh",
            overflowY: "auto",
            boxShadow: "var(--q-shadow-lg)",
            animation: "q-slide-up 0.3s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 700 }}>
              Jump to question
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "var(--q-ink-muted)",
              }}
            >
              ×
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "8px",
            }}
          >
            {questions.map((q, i) => {
              const active = i === currentQuestionIndex;
              const answered = Boolean(selectedAnswers[q._id]);
              const flagged = flaggedQuestions.has(q._id);
              return (
                <button
                  key={q._id}
                  onClick={() => goToQuestion(i)}
                  style={{
                    aspectRatio: "1",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: active
                      ? "var(--q-accent)"
                      : flagged
                        ? "var(--q-flag-soft)"
                        : answered
                          ? "var(--q-accent-soft)"
                          : "var(--q-bg)",
                    color: active
                      ? "#fff"
                      : flagged
                        ? "var(--q-flag)"
                        : answered
                          ? "var(--q-accent)"
                          : "var(--q-ink-muted)",
                  }}
                >
                  {flagged ? (
                    <Icon name="flag" size={12} style={{ filled: true }} />
                  ) : (
                    i + 1
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Responsive styles injection */}
      <style>{`
        @media (min-width: 900px) {
          .q-sidebar { display: block !important; }
          .q-mobile-fab { display: none !important; }
        }
        @keyframes q-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>,
  );
}
