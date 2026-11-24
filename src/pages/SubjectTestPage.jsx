import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import api from "../lib/api";
import BamboLoader from "../components/BamboLoader";
import MistakeTutor from "../components/MistakeTutor";
import "../styles/dashboard.css";
import "../styles/student.css";

/* ── helpers ─────────────────────────────────────────── */

const LETTERS = "ABCDEF";
const fmtClock = (s) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;
const fmtDuration = (s) => {
  const v = Number(s || 0);
  if (v < 60) return `${v} sec`;
  const m = Math.round(v / 60);
  return `${m} min`;
};
const pct = (s, t) => (Number(t) ? Math.round((Number(s) / Number(t)) * 100) : 0);

const toImageSrc = (data, type) => {
  if (!data || !type) return "";
  return String(data).startsWith("data:") ? data : `data:${type};base64,${data}`;
};

const Svg = ({ children, size = 20, stroke = 2 }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const I = {
  close: <path d="M18 6 6 18M6 6l12 12" />,
  back: <path d="m15 18-6-6 6-6" />,
  next: <path d="m9 18 6-6-6-6" />,
  flag: <path d="M4 22V4m0 0h12l-2 4 2 4H4" />,
  grid: (<><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>),
  clock: (<><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M9 2h6" /></>),
  check: <path d="m5 12 5 5 9-10" />,
};

function ScoreRing({ value }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const color = value >= 80 ? "#15803D" : value >= 50 ? "#185FA5" : "#EA580C";
  return (
    <svg role="img" aria-label={`Score ${value} percent`} width="104" height="104" viewBox="0 0 104 104" style={{ flex: "none" }}>
      <circle cx="52" cy="52" r={r} fill="none" stroke="var(--border-color)" strokeWidth="10" />
      <circle cx="52" cy="52" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(c * value) / 100} ${c}`} transform="rotate(-90 52 52)" />
      <text x="52" y="59" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="23" fontWeight="700" fill="currentColor">{value}%</text>
    </svg>
  );
}

function Sheet({ title, children, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="tt-scrim" onClick={onClose}>
      <div className="tt-sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

const REPORT_REASONS = [
  ["wrong_answer", "The marked answer is wrong"],
  ["unclear", "The question is unclear or has two right answers"],
  ["explanation", "The explanation is wrong or unhelpful"],
  ["typo", "Typo or formatting problem"],
  ["image", "The picture is missing or wrong"],
  ["other", "Something else"],
];

function ReportSheet({ question, onClose, onSent }) {
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const send = async () => {
    setSending(true);
    setError("");
    try {
      await api.post("/api/reports", { questionId: question._id, reason, message: message.trim() }, { _tokenType: "user" });
      onSent(question._id);
    } catch (err) {
      setError(err?.data?.message || err?.message || "Couldn't send your report. Please try again.");
      setSending(false);
    }
  };
  const needsText = reason === "other" && message.trim().length < 5;
  return (
    <Sheet title="Report a problem" onClose={onClose}>
      <p>Thanks for helping keep the questions accurate. What's wrong?</p>
      <div className="rp-reasons" role="radiogroup" aria-label="What's wrong">
        {REPORT_REASONS.map(([value, label]) => (
          <label key={value} className={`rp-reason${reason === value ? " on" : ""}`}>
            <input type="radio" name="report-reason" value={value} checked={reason === value} onChange={() => setReason(value)} />
            {label}
          </label>
        ))}
      </div>
      <label className="rp-text">
        <span>{reason === "wrong_answer" ? "Which answer is right, and why? Write the answer out, because the letters are shuffled for each student." : "Anything to add? (optional)"}</span>
        <textarea rows={3} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={reason === "wrong_answer" ? "e.g. \"Stop the infusion\" is right because…" : "Tell us more"} />
      </label>
      {error && <p style={{ color: "#b91c1c" }} role="alert">{error}</p>}
      <div className="tt-sheet-actions">
        <button type="button" className="st-btn st-btn-lg" disabled={!reason || needsText || sending} onClick={send}>
          {sending ? "Sending…" : "Send report"}
        </button>
        <button type="button" className="st-btn st-btn-text st-btn-lg" onClick={onClose}>Cancel</button>
      </div>
    </Sheet>
  );
}

/* ── page ────────────────────────────────────────────── */

function SubjectTestPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const routeSubjectId = params.subjectId || searchParams.get("subjectId") || "";
  const routeTopicId = params.topicId || searchParams.get("topicId") || "";
  const retryOf = searchParams.get("retry") || "";
  const resumeId = searchParams.get("resume") || "";
  const isMistakes = searchParams.get("mode") === "mistakes";
  const isReview = searchParams.get("mode") === "review";
  const requestedLimit = Number(searchParams.get("limit") || 0);
  const isRandom = !routeTopicId && !retryOf && searchParams.get("mode") === "random" && requestedLimit > 0;

  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState("loading"); // loading | error | test | grading | results | review
  const [loadError, setLoadError] = useState("");
  const [meta, setMeta] = useState({ mode: "subject", subjectId: "", topicId: null, subjectName: "", topicName: "", duration: 300 });
  const [questions, setQuestions] = useState([]);
  const [images, setImages] = useState({});
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(() => new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [sheet, setSheet] = useState(null); // grid | finish | exit
  const [gradeError, setGradeError] = useState("");
  const [result, setResult] = useState(null);
  const [review, setReview] = useState({ list: [], pos: 0, kind: "mistakes" });
  const [reportFor, setReportFor] = useState(null); // question being reported
  const [reported, setReported] = useState(() => new Set());

  const [resumed, setResumed] = useState(false);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | failed
  const sessionIdRef = useRef(null);
  const endAtRef = useRef(0);
  const finishingRef = useRef(false);
  const celebratedRef = useRef(false);

  /* load / start a session */
  useEffect(() => {
    let cancelled = false;
    const opts = { _tokenType: "user" };
    (async () => {
      try {
        const body = retryOf
          ? { retryOf }
          : isReview
            ? { subjectId: routeSubjectId, mode: "review", limit: requestedLimit || 30, tz: new Date().getTimezoneOffset() }
            : isMistakes
            ? { subjectId: routeSubjectId, mode: "mistakes", limit: requestedLimit || 30 }
          : routeTopicId
            ? { topicId: routeTopicId }
            : isRandom
              ? { subjectId: routeSubjectId, mode: "random", limit: requestedLimit }
              : { subjectId: routeSubjectId, mode: "subject" };
        const start = resumeId
          ? await api.get(`/api/tests/${resumeId}`, opts)
          : await api.post("/api/tests/start", body, opts);
        if (cancelled) return;
        const data = start.data || {};
        const subjectId = data.subjectId || routeSubjectId;
        const topicId = data.topicId || routeTopicId || null;
        const [subjectRes, topicRes] = await Promise.all([
          subjectId ? api.get(`/api/subjects/${subjectId}`, opts).catch(() => null) : null,
          topicId ? api.get(`/api/topics/${topicId}`, opts).catch(() => null) : null,
        ]);
        if (cancelled) return;
        sessionIdRef.current = data.sessionId;
        finishingRef.current = false;
        celebratedRef.current = false;
        const duration = Number(data.duration) > 0 ? Number(data.duration) : 300;
        const remaining = Number.isFinite(Number(data.remaining)) ? Number(data.remaining) : duration;
        endAtRef.current = Date.now() + remaining * 1000;
        setMeta({
          mode: data.mode || "subject",
          subjectId,
          topicId,
          subjectName: subjectRes?.data?.name || "",
          topicName: topicRes?.data?.name || "",
          duration,
        });
        setQuestions(data.questions || []);
        setImages({});
        const saved = data.progress || {};
        setIndex(Math.min(Number(saved.index || 0), Math.max((data.questions || []).length - 1, 0)));
        setAnswers(Object.fromEntries((saved.answers || []).filter((a) => a.selectedAnswer != null).map((a) => [a.questionId, a.selectedAnswer])));
        setFlagged(new Set(saved.flagged || []));
        setResumed(Boolean(resumeId));
        setTimeLeft(remaining);
        setResult(null);
        setGradeError("");
        setSheet(null);
        setPhase((data.questions || []).length ? "test" : "error");
        if (!(data.questions || []).length) setLoadError("There are no questions in this test yet.");
        // Load pictures in small batches in the background.
        const withImages = (data.questions || []).filter((q) => q.hasImage);
        for (let i = 0; i < withImages.length && !cancelled; i += 5) {
          const batch = await Promise.all(
            withImages.slice(i, i + 5).map((q) =>
              api
                .get(`/api/questions/${q._id}/image`, opts)
                .then((res) => [q._id, toImageSrc(res.data?.imageData, res.data?.imageContentType)])
                .catch(() => [q._id, ""]),
            ),
          );
          if (!cancelled) setImages((prev) => ({ ...prev, ...Object.fromEntries(batch.filter(([, src]) => src)) }));
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to start test:", err);
        const status = err?.status ?? err?.response?.status;
        const serverMessage = err?.data?.message ?? err?.response?.data?.message;
        setLoadError(
          serverMessage && status && status < 500
            ? serverMessage
            : "We couldn't load this test right now. Check your connection and try again.",
        );
        setPhase("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [routeSubjectId, routeTopicId, retryOf, resumeId, isMistakes, isReview, isRandom, requestedLimit, attempt]);

  /* submit to the server for marking */
  const finishTest = useCallback(
    async (stopped) => {
      if (finishingRef.current || !sessionIdRef.current) return;
      finishingRef.current = true;
      const sessionId = sessionIdRef.current;
      setSheet(null);
      setGradeError("");
      setPhase("grading");
      try {
        const res = await api.post(
          `/api/tests/${sessionId}/submit`,
          { stopped, answers: questions.map((q) => ({ questionId: q._id, selectedAnswer: answers[q._id] ?? null })) },
          { _tokenType: "user" },
        );
        if (sessionIdRef.current !== sessionId) return;
        const data = res.data || {};
        const byId = new Map((data.review || []).map((r) => [String(r.questionId), r]));
        setQuestions((prev) =>
          prev.map((q) => {
            const r = byId.get(String(q._id));
            return r ? { ...q, correctAnswer: r.correctAnswer, explanation: r.explanation } : q;
          }),
        );
        if (!stopped && data.unlockedBadges?.length) {
          try { sessionStorage.setItem("newBadge", JSON.stringify(data.unlockedBadges[0])); } catch { /* ignore */ }
        }
        setResult({
          score: Number(data.score || 0),
          total: Number(data.total || questions.length),
          timeTaken: Number(data.timeTaken || 0),
          stopped: Boolean(data.stopped),
          resultId: data.resultId || null,
          previous: data.previous || null,
          badges: data.unlockedBadges || [],
        });
        setPhase("results");
        window.scrollTo({ top: 0 });
      } catch (err) {
        if (sessionIdRef.current !== sessionId) return;
        finishingRef.current = false;
        console.error("Failed to submit test:", err);
        setGradeError(
          (err?.status ?? err?.response?.status) === 404
            ? "This test session has expired, so it can't be marked. Please start the test again."
            : "We couldn't mark your test. Check your connection and try again. Your answers are still here.",
        );
        setPhase("gradeError");
      }
    },
    [questions, answers],
  );

  /* autosave: answers, flags and position, a moment after each change */
  const progressBody = useCallback(
    () => ({
      answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({ questionId, selectedAnswer })),
      flagged: [...flagged],
      index,
    }),
    [answers, flagged, index],
  );
  const firstSaveRef = useRef(true);
  useEffect(() => {
    if (phase !== "test" || !sessionIdRef.current) return undefined;
    if (firstSaveRef.current) {
      firstSaveRef.current = false; // nothing changed yet
      return undefined;
    }
    const sessionId = sessionIdRef.current;
    const t = setTimeout(() => {
      setSaveState("saving");
      api
        .put(`/api/tests/${sessionId}/progress`, progressBody(), { _tokenType: "user" })
        .then(() => setSaveState("saved"))
        .catch(() => setSaveState("failed"));
    }, 1200);
    return () => clearTimeout(t);
  }, [phase, progressBody]);
  // When the tab is hidden or closed, save straight away (keepalive survives the page closing).
  useEffect(() => {
    if (phase !== "test") return undefined;
    const flush = () => {
      if (!sessionIdRef.current || finishingRef.current) return;
      try {
        fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/tests/${sessionIdRef.current}/progress`, {
          method: "PUT",
          keepalive: true,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("userToken") || ""}` },
          body: JSON.stringify(progressBody()),
        }).catch(() => {});
      } catch { /* ignore */ }
    };
    const onVis = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", flush);
    };
  }, [phase, progressBody]);

  const saveAndLeave = async () => {
    setSheet(null);
    try {
      await api.put(`/api/tests/${sessionIdRef.current}/progress`, progressBody(), { _tokenType: "user" });
    } catch { /* the keepalive save on page hide is a second chance */ }
    finishingRef.current = true; // stop the leave warning and further saves
    navigate("/user-dashboard");
  };

  /* timer: based on the end time, so it stays right if the phone sleeps */
  useEffect(() => {
    if (phase !== "test") return undefined;
    const tick = () => {
      const left = Math.round((endAtRef.current - Date.now()) / 1000);
      setTimeLeft(left);
      if (left <= 0) finishTest(false);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [phase, finishTest]);

  /* warn before closing the tab mid-test */
  useEffect(() => {
    if (phase !== "test") return undefined;
    const warn = (e) => {
      if (finishingRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase]);

  const current = questions[index];
  const answeredCount = useMemo(() => questions.filter((q) => answers[q._id] != null).length, [questions, answers]);
  const unanswered = questions.length - answeredCount;

  const choose = useCallback((qid, option) => setAnswers((prev) => ({ ...prev, [qid]: option })), []);
  const toggleFlag = () =>
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(current._id)) next.delete(current._id);
      else next.add(current._id);
      return next;
    });
  const goNext = () => {
    if (index < questions.length - 1) setIndex(index + 1);
    else setSheet("finish");
  };

  /* keyboard: A–F or 1–6 to answer, arrows to move */
  useEffect(() => {
    if (phase !== "test" || sheet) return undefined;
    const onKey = (e) => {
      if (e.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey || !current) return;
      const key = e.key.toUpperCase();
      let i = LETTERS.indexOf(key);
      if (i < 0 && /^[1-6]$/.test(key)) i = Number(key) - 1;
      if (i >= 0 && i < current.options.length) {
        choose(current._id, current.options[i]);
        e.preventDefault();
      } else if (e.key === "ArrowRight" && index < questions.length - 1) setIndex(index + 1);
      else if (e.key === "ArrowLeft" && index > 0) setIndex(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, sheet, current, index, questions.length, choose]);

  /* perfect score celebration */
  const isPerfect = phase === "results" && result && !result.stopped && result.total > 0 && result.score === result.total;
  useEffect(() => {
    if (!isPerfect || celebratedRef.current) return;
    celebratedRef.current = true;
    try {
      const audio = new Audio("/sounds/perfect-score.mp3");
      audio.volume = 0.8;
      audio.play().catch(() => {});
    } catch { /* ignore */ }
    if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      confetti({ particleCount: 140, spread: 75, origin: { y: 0.35 } });
    }
  }, [isPerfect]);

  /* labels */
  const testName =
    meta.mode === "review"
      ? `Spaced review${meta.subjectName ? ` · ${meta.subjectName}` : ""}`
      : meta.mode === "mistakes"
      ? `Mistake practice${meta.subjectName ? ` · ${meta.subjectName}` : ""}`
      : meta.mode === "retry"
      ? `Retry: ${meta.topicName || meta.subjectName || "missed questions"}`
      : meta.topicName || (meta.mode === "random" ? `Random mix · ${questions.length} questions` : "Full subject test");
  const subLabel = meta.mode === "review" ? "Questions due for review" : meta.mode === "retry" || meta.mode === "mistakes" ? "Only questions you got wrong" : meta.subjectName;
  const backToTopics = () => navigate(meta.subjectId ? `/subject/${meta.subjectId}/topics` : "/user");
  const retake = () => {
    if (resumeId) {
      // A resumed test's URL points at the old session; start a brand-new one instead.
      const q = meta.mode === "topic" && meta.topicId ? `/test/topic/${meta.topicId}` : meta.mode === "random" ? `/test/subject/${meta.subjectId}?mode=random&limit=${questions.length}` : meta.mode === "mistakes" ? `/test/subject/${meta.subjectId}?mode=mistakes` : meta.mode === "review" ? "/mistakes" : `/test/subject/${meta.subjectId}`;
      navigate(q);
      return;
    }
    if (meta.mode === "mistakes") {
      navigate(`/test/subject/${meta.subjectId}?mode=mistakes&n=${Date.now()}`);
      return;
    }
    if (meta.mode === "review") {
      navigate("/mistakes");
      return;
    }
    setPhase("loading");
    setAttempt((v) => v + 1);
  };

  const isCorrect = (q) => answers[q._id] != null && answers[q._id] === q.correctAnswer;
  const mistakes = questions.filter((q) => !isCorrect(q));
  const openReview = (kind, startId) => {
    const list = kind === "mistakes" ? mistakes : questions;
    const pos = Math.max(0, startId ? list.findIndex((q) => q._id === startId) : 0);
    setReview({ list, pos, kind });
    setPhase("review");
    window.scrollTo({ top: 0 });
  };

  /* ── loading / errors ── */
  if (phase === "loading") return <BamboLoader message="Getting your questions ready" />;
  if (phase === "grading")
    return <BamboLoader message="Marking your answers" tip="Your answers are checked on our server, so every score is fair." />;

  if (phase === "error" || phase === "gradeError") {
    const expired = gradeError.includes("expired");
    return (
      <div className="tt">
        <div className="tt-body" style={{ paddingTop: 48 }}>
          <div className="rs-card" role="alert">
            <h2 style={{ margin: 0, fontSize: 18 }}>{phase === "error" ? "This test couldn't start" : "Your test wasn't marked yet"}</h2>
            <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.6 }}>{phase === "error" ? loadError : gradeError}</p>
            <div className="rs-stack">
              {phase === "gradeError" && !expired && (
                <button type="button" className="st-btn st-btn-lg" onClick={() => finishTest(false)}>Try marking again</button>
              )}
              {(phase === "error" || expired) && (
                <button type="button" className="st-btn st-btn-lg" onClick={retake}>Start again</button>
              )}
              <button type="button" className="st-btn st-btn-outline st-btn-lg" onClick={backToTopics}>Back to topics</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── results ── */
  if (phase === "results" && result) {
    const p = pct(result.score, result.total);
    const change = result.previous ? p - pct(result.previous.score, result.previous.total) : null;
    const countsForBoard = !result.stopped && !["retry", "mistakes", "review"].includes(meta.mode) && result.total >= (meta.mode === "random" ? 20 : 5);
    return (
      <div className="tt">
        <header className="tt-plain-top">
          <div className="tt-top-inner">
            <button type="button" className="tt-icon-btn" aria-label="Back to topics" onClick={backToTopics}><Svg size={22}>{I.back}</Svg></button>
            <h1 style={{ flex: 1 }}>{result.stopped ? "Corrections" : "Results"}</h1>
            <button type="button" className="st-btn st-btn-text" onClick={() => navigate("/user-dashboard")}>Home</button>
          </div>
        </header>
        <main className="tt-body" style={{ paddingBottom: 40 }}>
          {result.stopped && (
            <div className="rs-banner">You stopped this test, so it wasn't saved and doesn't count. Here are the corrections for the questions you answered.</div>
          )}

          <section className="rs-card rs-score">
            <ScoreRing value={p} />
            <div className="rs-meta">
              <p>{testName}</p>
              <h2>{result.score} of {result.total} correct</h2>
              {change !== null && change !== 0 && (
                <p className={change > 0 ? "rs-up" : "rs-down"}>
                  {change > 0 ? "↑" : "↓"} {Math.abs(change)} point{Math.abs(change) === 1 ? "" : "s"} on your last try
                </p>
              )}
              {change === 0 && <p>Same as your last try</p>}
              {!result.stopped && <p>Finished in {fmtDuration(result.timeTaken)}</p>}
            </div>
          </section>

          {isPerfect && (
            <div className="rs-perfect">
              <span aria-hidden="true" style={{ fontSize: 22 }}>🎯</span>
              <span>Perfect score!{countsForBoard ? " This counts towards your leaderboard position." : ""}</span>
            </div>
          )}

          {result.badges.map((b) => (
            <div className="rs-card" key={b.key || b.title} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <span aria-hidden="true" style={{ fontSize: 28 }}>{b.icon}</span>
              <div><strong style={{ display: "block" }}>New badge: {b.title}</strong><span className="db-small">{b.description}</span></div>
            </div>
          ))}

          {!result.stopped && !result.resultId && (
            <div className="rs-banner">Your score was marked, but the tutor isn't available for this attempt.</div>
          )}

          <section className="rs-card">
            <div className="rs-head">
              <h2>Every question</h2>
              <span>✓ right · ✕ wrong · – skipped · orange ring = flagged</span>
            </div>
            <div className="rs-grid">
              {questions.map((q, i) => {
                const ok = isCorrect(q);
                const skipped = answers[q._id] == null;
                return (
                  <button
                    key={q._id}
                    type="button"
                    className={`rs-cell ${ok ? "ok" : skipped ? "skip" : "bad"}${flagged.has(q._id) ? " flagged" : ""}`}
                    aria-label={`Question ${i + 1}: ${ok ? "right" : skipped ? "skipped" : "wrong"}${flagged.has(q._id) ? ", flagged" : ""}`}
                    onClick={() => openReview("all", q._id)}
                  >
                    {i + 1} {ok ? "✓" : skipped ? "–" : "✕"}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rs-stack">
            {mistakes.length > 0 ? (
              <button type="button" className="st-btn st-btn-lg" onClick={() => openReview("mistakes")}>
                Review {mistakes.length} mistake{mistakes.length === 1 ? "" : "s"}{result.resultId ? " with the tutor" : ""}
              </button>
            ) : (
              <button type="button" className="st-btn st-btn-lg" onClick={() => openReview("all")}>Read the explanations</button>
            )}
            {result.resultId && mistakes.length > 0 && (
              <button type="button" className="st-btn st-btn-outline st-btn-lg" onClick={() => navigate(`/test/subject/${meta.subjectId}?retry=${result.resultId}`)}>
                Retry only the {mistakes.length} I missed
              </button>
            )}
            <button type="button" className="st-btn st-btn-outline st-btn-lg" onClick={retake}>
              {meta.mode === "random" ? "New random mix" : meta.mode === "mistakes" ? "Practise my remaining mistakes" : meta.mode === "review" ? "Back to my review" : "Retake the whole test"}
            </button>
            <button type="button" className="st-btn st-btn-text st-btn-lg" onClick={backToTopics}>Back to topics</button>
          </section>
        </main>
      </div>
    );
  }

  /* ── review, one question at a time ── */
  if (phase === "review") {
    const q = review.list[review.pos];
    if (!q) return null;
    const qNumber = questions.findIndex((x) => x._id === q._id) + 1;
    const mine = answers[q._id] ?? null;
    const wrong = mine !== q.correctAnswer;
    const label = review.kind === "mistakes" ? `Mistake ${review.pos + 1} of ${review.list.length}` : `Question ${review.pos + 1} of ${review.list.length}`;
    const move = (d) => {
      setReview((r) => ({ ...r, pos: r.pos + d }));
      window.scrollTo({ top: 0 });
    };
    return (
      <div className="tt">
        <header className="tt-plain-top">
          <div className="tt-top-inner">
            <button type="button" className="tt-icon-btn" aria-label="Back to results" onClick={() => setPhase("results")}><Svg size={22}>{I.back}</Svg></button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1>{label}</h1>
              <p>Question {qNumber}{mine == null ? " · skipped" : ""}</p>
            </div>
            {review.pos < review.list.length - 1 && (
              <button type="button" className="st-btn st-btn-text" onClick={() => move(1)}>Next</button>
            )}
          </div>
        </header>
        <main className="tt-body" style={{ paddingBottom: 40 }}>
          <p className="tt-q" style={{ fontSize: 16 }}>{q.questionText}</p>
          {q.hasImage && (images[q._id] ? <img className="tt-img" src={images[q._id]} alt={`Picture for question ${qNumber}`} /> : <div className="tt-img-wait">Loading picture…</div>)}
          <div className="rs-stack" style={{ gap: 8 }}>
            {q.options.map((opt, i) => {
              const isRight = opt === q.correctAnswer;
              const isMine = opt === mine;
              const cls = isRight ? "right" : isMine ? "wrong" : "";
              return (
                <div key={`${i}-${opt}`} className={`rv-opt ${cls}`}>
                  <div className="rv-opt-line">
                    <span className="rv-dot" aria-hidden="true">{isRight ? "✓" : isMine ? "✕" : LETTERS[i]}</span>
                    <span style={{ fontWeight: isRight || isMine ? 600 : 500 }}>
                      {opt}
                      {isRight && <span className="rv-who"> · correct</span>}
                      {isMine && !isRight && <span className="rv-who"> · your answer</span>}
                      {isMine && isRight && <span className="rv-who"> (your answer)</span>}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {q.explanation && (
            <div className="rv-expl">
              <strong>Explanation</strong>
              {q.explanation}
            </div>
          )}
          <div className="rv-report">
            {reported.has(q._id) ? (
              <span>✓ Thanks, you reported this question. We'll check it.</span>
            ) : (
              <button type="button" className="st-btn st-btn-text" onClick={() => setReportFor(q)}>
                Something wrong with this question? Report it
              </button>
            )}
          </div>
          {wrong && !result?.stopped && result?.resultId && <MistakeTutor key={q._id} resultId={result.resultId} questionId={q._id} />}
          {reportFor && (
            <ReportSheet
              question={reportFor}
              onClose={() => setReportFor(null)}
              onSent={(id) => {
                setReported((prev) => new Set(prev).add(id));
                setReportFor(null);
              }}
            />
          )}
          <div className="rv-nav">
            <button type="button" className="st-btn st-btn-outline" disabled={review.pos === 0} onClick={() => move(-1)}>Previous</button>
            {review.pos < review.list.length - 1 ? (
              <button type="button" className="st-btn" onClick={() => move(1)}>Next</button>
            ) : (
              <button type="button" className="st-btn" onClick={() => setPhase("results")}>Back to results</button>
            )}
          </div>
        </main>
      </div>
    );
  }

  /* ── taking the test ── */
  if (!current) return null;
  const picked = answers[current._id] ?? null;
  const isFlagged = flagged.has(current._id);
  const low = timeLeft <= 60;
  const isLast = index === questions.length - 1;

  return (
    <div className="tt">
      <header className="tt-top">
        <div className="tt-top-inner">
          <div className="tt-row">
            <button type="button" className="tt-icon-btn" aria-label="Leave test" onClick={() => setSheet("exit")}><Svg size={22}>{I.close}</Svg></button>
            <div className="tt-title">
              <p>{testName}{subLabel && meta.mode !== "retry" && meta.topicName ? ` · ${subLabel}` : ""}</p>
              <h1>Question {index + 1} of {questions.length}</h1>
            </div>
            <div className={`tt-timer${low ? " low" : ""}`} role="timer" aria-label={`${Math.floor(Math.max(0, timeLeft) / 60)} minutes ${Math.max(0, timeLeft) % 60} seconds left`}>
              <Svg size={16} stroke={2.2}>{I.clock}</Svg>
              {fmtClock(timeLeft)}
            </div>
          </div>
          <div className="tt-progress" role="progressbar" aria-valuenow={answeredCount} aria-valuemin={0} aria-valuemax={questions.length} aria-label={`${answeredCount} of ${questions.length} answered`}>
            <div style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
          </div>
        </div>
      </header>

      <main className="tt-body">
        <div className="tt-tags">
          <span className="tt-tag">{answeredCount} of {questions.length} answered</span>
          {isFlagged && <span className="tt-tag flag">Flagged for review</span>}
          {resumed && saveState === "idle" && <span className="tt-tag ok">Welcome back, your answers are here</span>}
          {saveState === "saved" && <span className="tt-save">✓ Saved</span>}
          {saveState === "saving" && <span className="tt-save">Saving…</span>}
          {saveState === "failed" && <span className="tt-save bad">Not saved, check your connection</span>}
        </div>
        <p className="tt-q">{current.questionText}</p>
        {current.hasImage && (images[current._id] ? <img className="tt-img" src={images[current._id]} alt={`Picture for question ${index + 1}`} /> : <div className="tt-img-wait">Loading picture…</div>)}
        <fieldset className="tt-options">
          <legend style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Choose one answer</legend>
          {current.options.map((opt, i) => (
            <button key={`${i}-${opt}`} type="button" className="tt-opt" aria-pressed={picked === opt} onClick={() => choose(current._id, opt)}>
              <span className="tt-letter">{LETTERS[i]}</span>
              <span style={{ flex: 1 }}>{opt}</span>
            </button>
          ))}
        </fieldset>
        <p className="tt-hint">Your answers save automatically. If you close the app, finish from your dashboard. Tip: press A–D to answer and the arrow keys to move.</p>
      </main>

      <footer className="tt-foot">
        <div className="tt-foot-inner">
          <button type="button" className="tt-sq" aria-pressed={isFlagged} aria-label={isFlagged ? "Remove flag" : "Flag question for review"} onClick={toggleFlag}><Svg>{I.flag}</Svg></button>
          <button type="button" className="tt-sq" aria-label="Show all questions" onClick={() => setSheet("grid")}><Svg>{I.grid}</Svg></button>
          <button type="button" className="tt-sq" aria-label="Previous question" disabled={index === 0} onClick={() => setIndex(index - 1)}><Svg>{I.back}</Svg></button>
          <button type="button" className={`tt-next${isLast ? " finish" : ""}`} onClick={goNext}>
            {isLast ? "Finish test" : "Next"}
            <Svg size={18} stroke={2.2}>{isLast ? I.check : I.next}</Svg>
          </button>
        </div>
      </footer>

      {sheet === "grid" && (
        <Sheet title="All questions" onClose={() => setSheet(null)}>
          <div className="tt-legend"><span className="l-ans">Answered</span><span className="l-flag">Flagged</span><span className="l-open">Not answered</span></div>
          <div className="tt-grid">
            {questions.map((q, i) => (
              <button
                key={q._id}
                type="button"
                className={`tt-cell${answers[q._id] != null ? " ans" : ""}${flagged.has(q._id) ? " flag" : ""}${i === index ? " current" : ""}`}
                aria-label={`Go to question ${i + 1}`}
                onClick={() => {
                  setIndex(i);
                  setSheet(null);
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="tt-sheet-actions">
            <button type="button" className="st-btn st-btn-lg" onClick={() => setSheet("finish")}>Finish test</button>
          </div>
        </Sheet>
      )}

      {sheet === "finish" && (
        <Sheet title="Finish the test?" onClose={() => setSheet(null)}>
          {unanswered > 0 ? (
            <p>You have <strong>{unanswered}</strong> unanswered question{unanswered === 1 ? "" : "s"}. They will be marked as wrong.{flagged.size ? ` You also flagged ${flagged.size}.` : ""}</p>
          ) : (
            <p>All {questions.length} questions answered.{flagged.size ? ` You flagged ${flagged.size} to check.` : ""} Ready to see your score?</p>
          )}
          <div className="tt-sheet-actions">
            <button type="button" className="st-btn st-btn-lg" onClick={() => finishTest(false)}>Submit and see my score</button>
            {unanswered > 0 && (
              <button
                type="button"
                className="st-btn st-btn-outline st-btn-lg"
                onClick={() => {
                  const first = questions.findIndex((q) => answers[q._id] == null);
                  if (first >= 0) setIndex(first);
                  setSheet(null);
                }}
              >
                Go to the first unanswered
              </button>
            )}
            <button type="button" className="st-btn st-btn-text st-btn-lg" onClick={() => setSheet(null)}>Keep going</button>
          </div>
        </Sheet>
      )}

      {sheet === "exit" && (
        <Sheet title="Leave this test?" onClose={() => setSheet(null)}>
          <p>Your answers are saved. You can come back and finish from your dashboard, but the timer keeps running ({fmtClock(timeLeft)} left).</p>
          <div className="tt-sheet-actions">
            <button type="button" className="st-btn st-btn-lg" onClick={() => setSheet(null)}>Keep going</button>
            <button type="button" className="st-btn st-btn-outline st-btn-lg" onClick={saveAndLeave}>Leave and finish later</button>
            <button type="button" className="st-btn st-btn-text st-btn-lg" onClick={() => finishTest(true)}>Stop now and see corrections</button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

/* A new URL (for example "retry missed" from the results) starts a fresh page. */
export default function SubjectTestRoute() {
  const location = useLocation();
  return <SubjectTestPage key={location.pathname + location.search} />;
}
