import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import StudentHeader from "../components/StudentHeader";
import BamboLoader from "../components/BamboLoader";
import LeaderboardPanel from "../components/LeaderboardPanel";
import OnboardingTour from "../components/OnboardingTour";
import { TOUR_VERSION, studentId } from "../lib/session";
import "../styles/dashboard.css";

/* ── helpers ─────────────────────────────────────────── */

const pct = (score, total) =>
  Number(total) ? Math.round((Number(score || 0) / Number(total)) * 100) : 0;

const safeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.subjects)) return value.subjects;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const normalizeSummary = (value) => ({
  totalTests: Number(value?.totalTests || 0),
  totalQuestions: Number(value?.totalQuestions || 0),
  totalCorrect: Number(value?.totalCorrect || 0),
  avgScore: Number(value?.avgScore || 0),
  best: Number(value?.best || 0),
  streak: Number(value?.streak || 0),
  bySubject: value?.bySubject || {},
});

const idOf = (ref) => (ref && typeof ref === "object" ? ref._id : ref) || null;
const nameOf = (ref, fallback) =>
  (ref && typeof ref === "object" ? ref.name : null) || fallback;

const scoreTone = (p) =>
  p >= 80
    ? { color: "#15803D", bg: "#F0FDF4", bar: "#16A34A" }
    : p >= 50
      ? { color: "#185FA5", bg: "#E8F1FB", bar: "#3B82F6" }
      : { color: "#9A3412", bg: "#FFF7ED", bar: "#EA580C" };

const fmtTime = (seconds) => {
  const value = Number(seconds || 0);
  if (!value) return "–";
  if (value < 60) return `${value}s`;
  return `${Math.floor(value / 60)}m ${value % 60}s`;
};

function relativeDay(date) {
  if (!date) return "";
  const d = new Date(date);
  const today = new Date();
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(today) - startOf(d)) / 86400000);
  if (diff <= 0) return "today";
  if (diff === 1) return "yesterday";
  if (diff < 7) return d.toLocaleDateString("en-GB", { weekday: "short" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function retakePath(result) {
  const subjectId = idOf(result.subjectId);
  const topicId = idOf(result.topicId);
  if (result.mode === "mistakes" || result.mode === "review") return "/mistakes";
  if (result.mode === "topic" && topicId) return `/test/topic/${topicId}`;
  if (result.mode === "random" && subjectId)
    return `/test/subject/${subjectId}?mode=random&limit=${result.total || 20}`;
  if (subjectId) return `/test/subject/${subjectId}`;
  return "/user";
}

const MODE_LABEL = { topic: "Topic test", subject: "Full subject test", random: "Random test", retry: "Retry of missed questions", mistakes: "Mistake practice", review: "Spaced review" };

/* Per-topic stats from the result history (newest first). */
function buildTopicStats(results) {
  const map = new Map();
  for (const r of results) {
    const topicId = idOf(r.topicId);
    if (!topicId || ["retry", "mistakes", "review"].includes(r.mode)) continue;
    if (!map.has(topicId)) {
      map.set(topicId, {
        topicId,
        name: nameOf(r.topicId, "Topic"),
        subjectId: idOf(r.subjectId),
        subjectName: nameOf(r.subjectId, "Subject"),
        attempts: [],
      });
    }
    map.get(topicId).attempts.push(pct(r.score, r.total));
  }
  return [...map.values()].map((t) => {
    const recent = t.attempts.slice(0, 3);
    const avg = Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
    const mastered = t.attempts.length >= 2 && t.attempts[0] >= 80 && t.attempts[1] >= 80;
    return { ...t, avg, mastered };
  });
}

function weeklyChange(results) {
  const weekAgo = Date.now() - 7 * 86400000;
  let ws = 0, wt = 0, os = 0, ot = 0;
  for (const r of results) {
    const t = new Date(r.createdAt).getTime();
    if (t >= weekAgo) { ws += Number(r.score || 0); wt += Number(r.total || 0); }
    else { os += Number(r.score || 0); ot += Number(r.total || 0); }
  }
  if (!wt || !ot) return null;
  return Math.round((ws / wt) * 100) - Math.round((os / ot) * 100);
}

/* ── small pieces ────────────────────────────────────── */

const Icon = ({ d, size = 20 }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);
const ICONS = {
  redo: <path d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5" />,
  shuffle: <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />,
  book: (<><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" /><path d="M8 7h6M8 11h8" /></>),
  grid: (<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>),
  flame: <path d="M12 2s5 5 5 10a5 5 0 0 1-10 0c0-2 1-4 2-5 0 2 1 3 2 3 0-3 1-6 1-8z" />,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  sun: (<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>),
};

function PlanItem({ tone, icon, title, note, onClick }) {
  return (
    <button type="button" className="db-plan" onClick={onClick}>
      <span className={`db-plan-icon tone-${tone}`}><Icon d={ICONS[icon]} /></span>
      <span className="db-plan-body">
        <strong>{title}</strong>
        <span>{note}</span>
      </span>
      <span className="db-plan-go" aria-hidden="true">›</span>
    </button>
  );
}

/* ── page ────────────────────────────────────────────── */

const TABS = [
  ["overview", "Home"],
  ["history", "My results"],
  ["leaderboard", "Leaderboard"],
];

export default function UserDashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [userInfo] = useState(() => {
    try { return JSON.parse(localStorage.getItem("userInfo") || "{}"); }
    catch { return {}; }
  });
  const [summary, setSummary] = useState(() => normalizeSummary(null));
  const [results, setResults] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [badges, setBadges] = useState([]);
  const [rank, setRank] = useState(null);
  const [active, setActive] = useState(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [dueToday, setDueToday] = useState(0);
  const [discarding, setDiscarding] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [badgePopup, setBadgePopup] = useState(() => {
    try {
      const stored = sessionStorage.getItem("newBadge");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const tabParam = searchParams.get("tab");
  const tab = TABS.some(([key]) => key === tabParam) ? tabParam : "overview";
  const setTab = (next) => {
    setSearchParams(next === "overview" ? {} : { tab: next });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    let cancelled = false;
    const opts = { _tokenType: "user" };
    Promise.allSettled([
      api.get("/api/results/me/summary", opts),
      api.get("/api/results/me?limit=100", opts),
      api.get("/api/badges/me", opts),
      api.get("/api/subjects?limit=100", opts),
      api.get("/api/leaderboard/me?period=month", opts),
      api.get("/api/tests/active", opts),
      api.get("/api/tests/mistakes", opts),
      api.get(`/api/tests/review?tz=${new Date().getTimezoneOffset()}`, opts),
    ]).then(([sum, hist, bad, subs, lb, act, mis, rev]) => {
      if (cancelled) return;
      if (sum.status === "fulfilled") setSummary(normalizeSummary(sum.value.data));
      if (hist.status === "fulfilled") setResults(safeArray(hist.value.data));
      if (bad.status === "fulfilled") setBadges(safeArray(bad.value.data?.badges));
      if (subs.status === "fulfilled") setSubjects(safeArray(subs.value.data));
      if (lb.status === "fulfilled") setRank(lb.value.data);
      if (act.status === "fulfilled") setActive(act.value.data?.active || null);
      if (mis.status === "fulfilled") setMistakeCount(Number(mis.value.data?.total || 0));
      if (rev.status === "fulfilled") setDueToday(Number(rev.value.data?.dueToday || 0));
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  // One-time intro tour (once per account; "App tour" in the menu replays it).
  const tourParam = searchParams.get("tour");
  useEffect(() => {
    if (isLoading) return undefined;
    const key = `bambo:tour:v${TOUR_VERSION}:${studentId()}`;
    if (tourParam === "1") {
      const t = setTimeout(() => setTourOpen(true), 0);
      return () => clearTimeout(t);
    }
    try {
      if (localStorage.getItem(key)) return undefined;
    } catch { /* ignore */ }
    let cancelled = false;
    api
      .get("/api/me/onboarding", { _tokenType: "user" })
      .then((res) => {
        if (cancelled) return;
        if (Number(res.data?.version || 0) >= TOUR_VERSION) {
          try { localStorage.setItem(key, "1"); } catch { /* ignore */ }
        } else {
          setTourOpen(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isLoading, tourParam]);

  const finishTour = () => {
    setTourOpen(false);
    try { localStorage.setItem(`bambo:tour:v${TOUR_VERSION}:${studentId()}`, "1"); } catch { /* ignore */ }
    api.put("/api/me/onboarding", { version: TOUR_VERSION }, { _tokenType: "user" }).catch(() => {});
    if (tourParam) setSearchParams({});
  };

  useEffect(() => {
    if (!badgePopup) return undefined;
    const timer = setTimeout(() => {
      setBadgePopup(null);
      try { sessionStorage.removeItem("newBadge"); } catch { /* ignore */ }
    }, 5000);
    return () => clearTimeout(timer);
  }, [badgePopup]);

  const topicStats = useMemo(() => buildTopicStats(results), [results]);
  const weakest = useMemo(
    () => topicStats.filter((t) => t.avg < 80).sort((a, b) => a.avg - b.avg).slice(0, 4),
    [topicStats],
  );
  const masteredCount = topicStats.filter((t) => t.mastered).length;
  const change = useMemo(() => weeklyChange(results), [results]);
  const lastTen = results.slice(0, 10).reverse();
  const latest = results[0] || null;

  const subjectCards = useMemo(() => {
    const seen = new Set();
    const cards = subjects.map((s) => {
      seen.add(String(s._id));
      const stats = summary.bySubject[String(s._id)];
      return { id: s._id, name: s.name, stats };
    });
    for (const [id, stats] of Object.entries(summary.bySubject)) {
      if (!seen.has(id) && id !== "deleted-subject") cards.push({ id, name: stats.name, stats });
    }
    return cards;
  }, [subjects, summary.bySubject]);

  if (isLoading) return <BamboLoader message="Loading your dashboard" />;

  const firstName = (userInfo.fullName || "").trim().split(/\s+/)[0] || "there";
  const classLabel = [userInfo.course?.name, userInfo.level ? `${userInfo.level} Level` : null].filter(Boolean).join(" · ");

  /* today's plan, built only from real data */
  const plan = [];
  if (dueToday > 0) {
    plan.push({
      tone: "green", icon: "book",
      title: `Review ${dueToday} question${dueToday === 1 ? "" : "s"} due today`,
      note: "Spaced review: catch them just before you forget",
      to: "/mistakes",
    });
  }
  if (mistakeCount > 0 && dueToday === 0) {
    plan.push({
      tone: "red", icon: "redo",
      title: `Fix ${mistakeCount} mistake${mistakeCount === 1 ? "" : "s"}`,
      note: "Questions you got wrong last time. Get them right to clear them",
      to: "/mistakes",
    });
  }
  if (weakest[0]) {
    plan.push({
      tone: "orange", icon: "redo",
      title: `Retake: ${weakest[0].name}`,
      note: `Your weakest topic · ${weakest[0].avg}% on recent attempts`,
      to: `/test/topic/${weakest[0].topicId}`,
    });
  }
  const topSubject = Object.entries(summary.bySubject)
    .filter(([id]) => id !== "deleted-subject")
    .sort((a, b) => Number(b[1].attempts || 0) - Number(a[1].attempts || 0))[0];
  if (topSubject && plan.length < 3) {
    plan.push({
      tone: "blue", icon: "shuffle",
      title: `20 random questions: ${topSubject[1].name}`,
      note: "A mixed test from across the subject",
      to: `/test/subject/${topSubject[0]}?mode=random&limit=20`,
    });
  }
  const reviewSubjectId = weakest[0]?.subjectId || topSubject?.[0];
  if (reviewSubjectId && plan.length < 3) {
    const reviewName = weakest[0]?.subjectName || topSubject?.[1]?.name;
    plan.push({
      tone: "blue", icon: "book",
      title: `Quick reviews: ${reviewName}`,
      note: weakest[0] ? `Read up on ${weakest[0].name} before retaking it` : "Short summaries of each topic",
      to: `/subject/${reviewSubjectId}/quick-review`,
    });
  }
  if (plan.length === 0) {
    plan.push(
      { tone: "blue", icon: "grid", title: "Choose a subject", note: "Pick a subject and start a topic test", to: "/user" },
      { tone: "green", icon: "book", title: "Try the free sample questions", note: "10 worked questions with explanations", to: "/sample-questions" },
    );
  }

  return (
    <div className="db">
      <StudentHeader active={tab === "overview" ? "home" : tab === "history" ? "results" : "leaderboard"} />

      <main className="db-main">
        <div className="db-top">
          <div>
            {classLabel && <p className="db-eyebrow">{classLabel}</p>}
            <h1 className="db-h1">
              {tab === "overview" ? `${greeting()}, ${firstName}` : tab === "history" ? "My results" : "Leaderboard"}
            </h1>
          </div>
          {summary.streak > 0 && (
            <div className="db-streak">
              <Icon d={ICONS.flame} size={18} />
              {summary.streak}-day streak · practise today to keep it
            </div>
          )}
        </div>

        {tab === "overview" && (
          <>
            <section className="db-grid-2" aria-label="Next step and today's plan">
              <div className="db-hero">
                {active ? (
                  <>
                    <p className="db-hero-label">{active.remaining > 0 ? "Unfinished test" : "Time ran out on your test"}</p>
                    <div>
                      <h2>{active.topicName || (active.mode === "mistakes" ? "Mistake practice" : active.mode === "random" ? "Random mix" : active.subjectName || "Your test")}</h2>
                      <p>{active.subjectName}{active.mode === "topic" ? " · Topic test" : ""}</p>
                    </div>
                    <div>
                      <div className="db-hero-meta">
                        <span>{active.answered} of {active.total} answered</span>
                        <span>{active.remaining > 0 ? `${Math.floor(active.remaining / 60)}:${String(active.remaining % 60).padStart(2, "0")} left` : "Submit to see your score"}</span>
                      </div>
                      <div className="db-hero-track">
                        <div className="db-hero-fill" style={{ width: `${(active.answered / Math.max(active.total, 1)) * 100}%` }} />
                      </div>
                    </div>
                    <div className="db-hero-actions">
                      <button type="button" className="db-btn-white" onClick={() => navigate(`/test/subject/${active.subjectId}?resume=${active.sessionId}`)}>
                        {active.remaining > 0 ? "Resume test" : "Submit my answers"}
                      </button>
                      <button
                        type="button"
                        className="db-btn-ghost"
                        disabled={discarding}
                        onClick={async () => {
                          setDiscarding(true);
                          try {
                            await api.post(`/api/tests/${active.sessionId}/discard`, {}, { _tokenType: "user" });
                            setActive(null);
                          } finally {
                            setDiscarding(false);
                          }
                        }}
                      >
                        Discard
                      </button>
                    </div>
                  </>
                ) : latest ? (
                  <>
                    <p className="db-hero-label">Pick up where you left off</p>
                    <div>
                      <h2>{nameOf(latest.topicId, null) || nameOf(latest.subjectId, "Your last test")}</h2>
                      <p>
                        {nameOf(latest.subjectId, "Subject")} · {MODE_LABEL[latest.mode] || "Test"} · {relativeDay(latest.createdAt)}
                      </p>
                    </div>
                    <div>
                      <div className="db-hero-meta">
                        <span>Last score {latest.score}/{latest.total}</span>
                        <span>{pct(latest.score, latest.total)}%</span>
                      </div>
                      <div className="db-hero-track">
                        <div className="db-hero-fill" style={{ width: `${pct(latest.score, latest.total)}%` }} />
                      </div>
                    </div>
                    <div className="db-hero-actions">
                      <button type="button" className="db-btn-white" onClick={() => navigate(retakePath(latest))}>Retake test</button>
                      {idOf(latest.subjectId) && (
                        <button type="button" className="db-btn-ghost" onClick={() => navigate(`/subject/${idOf(latest.subjectId)}/topics`)}>Choose another topic</button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="db-hero-label">Welcome to Bambo</p>
                    <div>
                      <h2>Take your first test</h2>
                      <p>Pick a subject, choose a topic and answer a short timed test. Your progress shows up here.</p>
                    </div>
                    <div className="db-hero-actions">
                      <button type="button" className="db-btn-white" onClick={() => navigate("/user")}>Choose a subject</button>
                    </div>
                  </>
                )}
              </div>

              <div className="db-card">
                <div className="db-card-head">
                  <h2 className="db-h2">Today's plan</h2>
                  <span className="db-small">{plan.length} step{plan.length === 1 ? "" : "s"}</span>
                </div>
                {plan.map((item) => (
                  <PlanItem key={item.title} {...item} onClick={() => navigate(item.to)} />
                ))}
              </div>
            </section>

            <section className="db-grid-4" aria-label="Your numbers">
              <div className="db-stat">
                <p className="db-stat-label">Average score</p>
                <p className="db-stat-value">{summary.avgScore}%</p>
                <p className="db-stat-note">
                  {change === null ? (
                    `Best: ${summary.best}%`
                  ) : change >= 0 ? (
                    <span className="db-up">↑ {change} point{change === 1 ? "" : "s"} this week</span>
                  ) : (
                    <span className="db-down">↓ {Math.abs(change)} point{change === -1 ? "" : "s"} this week</span>
                  )}
                </p>
              </div>
              <div className="db-stat">
                <p className="db-stat-label">Questions answered</p>
                <p className="db-stat-value">{summary.totalQuestions.toLocaleString("en-GB")}</p>
                <p className="db-stat-note">across {summary.totalTests} test{summary.totalTests === 1 ? "" : "s"}</p>
              </div>
              <div className="db-stat">
                <p className="db-stat-label">Topics mastered</p>
                <p className="db-stat-value">{masteredCount}<small> / {topicStats.length}</small></p>
                <p className="db-stat-note">80%+ on your last 2 attempts</p>
              </div>
              <button type="button" className="db-stat clickable" onClick={() => setTab("leaderboard")}>
                <p className="db-stat-label">Leaderboard · this month</p>
                <p className="db-stat-value">{rank?.me?.rank ? `#${rank.me.rank}` : "–"}</p>
                <p className="db-stat-note">
                  {rank?.me?.rank ? `of ${rank.rankedCount} · ${rank.me.perfects} perfect${rank.me.perfects === 1 ? "" : "s"}` : "Score 100% on a topic to get ranked"}
                </p>
              </button>
            </section>

            <section className="db-grid-2-wide">
              <div className="db-card">
                <div className="db-card-head">
                  <h2 className="db-h2">Weakest topics</h2>
                  {weakest[0] && (
                    <button type="button" className="db-link" onClick={() => navigate(`/test/topic/${weakest[0].topicId}`)}>Practise the weakest</button>
                  )}
                </div>
                {weakest.length === 0 ? (
                  <p className="db-small">
                    {topicStats.length === 0 ? "Take a few topic tests and your weakest topics will show up here." : "Nothing below 80% right now. Nice work!"}
                  </p>
                ) : (
                  weakest.map((t) => {
                    const tone = scoreTone(t.avg);
                    return (
                      <button key={t.topicId} type="button" className="db-topic-row" onClick={() => navigate(`/test/topic/${t.topicId}`)} style={{ border: "none", background: "none", padding: 0, textAlign: "left", cursor: "pointer", color: "inherit", font: "inherit" }} aria-label={`Practise ${t.name}, ${t.avg}%`}>
                        <span className="db-topic-head">
                          <span>{t.name}</span>
                          <span style={{ color: tone.color, fontWeight: 600 }}>{t.avg}%</span>
                        </span>
                        <span className="db-track" style={{ display: "block" }}>
                          <span className="db-fill" style={{ display: "block", width: `${Math.max(t.avg, 3)}%`, background: tone.bar }} />
                        </span>
                      </button>
                    );
                  })
                )}
                <p className="db-small">Based on your last 3 attempts at each topic.</p>
              </div>

              <div className="db-card">
                <div className="db-card-head">
                  <h2 className="db-h2">Last {Math.min(results.length, 10) || 10} tests</h2>
                  <button type="button" className="db-link" onClick={() => setTab("history")}>All results</button>
                </div>
                {results.length === 0 ? (
                  <p className="db-small">Your recent scores will appear here after your first test.</p>
                ) : (
                  <>
                    <div className="db-chart" role="img" aria-label={`Scores of your last ${lastTen.length} tests: ${lastTen.map((r) => pct(r.score, r.total) + "%").join(", ")}`}>
                      {lastTen.map((r, i) => (
                        <div
                          key={r._id || i}
                          className={`db-chart-bar${i === lastTen.length - 1 ? " latest" : ""}`}
                          style={{ height: `${Math.max(pct(r.score, r.total), 3)}%` }}
                          title={`${nameOf(r.topicId, null) || nameOf(r.subjectId, "Test")}: ${pct(r.score, r.total)}%`}
                        />
                      ))}
                    </div>
                    <div>
                      {results.slice(0, 3).map((r, i) => {
                        const p = pct(r.score, r.total);
                        return (
                          <div className="db-list-row" key={r._id || i}>
                            <span style={{ minWidth: 0 }}>
                              <strong>{nameOf(r.topicId, null) || nameOf(r.subjectId, "Test")}</strong>
                              <span style={{ color: "var(--text-secondary)" }}> · {relativeDay(r.createdAt)}</span>
                            </span>
                            <span style={{ fontWeight: 600, color: p < 50 ? "#9A3412" : "inherit", whiteSpace: "nowrap" }}>{r.score}/{r.total}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </section>

            <section aria-label="Your subjects" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="db-card-head">
                <h2 className="db-h2">Your subjects</h2>
                <button type="button" className="db-link" onClick={() => navigate("/user")}>See all</button>
              </div>
              {subjectCards.length === 0 ? (
                <div className="db-card"><p className="db-small">No subjects for your course and level yet. You can request one from the account menu.</p></div>
              ) : (
                <div className="db-grid-3">
                  {subjectCards.slice(0, 6).map((s) => {
                    const avg = s.stats ? pct(s.stats.correct, s.stats.total) : 0;
                    return (
                      <button key={s.id} type="button" className="db-subject" onClick={() => navigate(`/subject/${s.id}/topics`)}>
                        <strong>{s.name}</strong>
                        <span className="db-small">
                          {s.stats ? `${s.stats.attempts} test${s.stats.attempts === 1 ? "" : "s"} · average ${avg}%` : "Not started yet"}
                        </span>
                        <span className="db-track" style={{ display: "block", height: 6 }}>
                          <span className="db-fill" style={{ display: "block", height: 6, width: `${s.stats ? Math.max(avg, 3) : 0}%`, background: "#185FA5" }} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {badges.length > 0 && (
              <section className="db-card" aria-label="Achievements">
                <h2 className="db-h2">Achievements</h2>
                <div className="db-badges">
                  {badges.map((b) => (
                    <div className="db-badge" key={b._id || b.key}>
                      <span aria-hidden="true">{b.icon}</span>
                      <div><strong>{b.title}</strong><small>{b.description}</small></div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {tab === "history" && (
          <section className="db-card" aria-label="All test history">
            {results.length === 0 ? (
              <div className="db-empty">
                <span>No tests yet. Your results will be listed here.</span>
                <button type="button" className="db-btn" onClick={() => navigate("/user")}>Start practising</button>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="db-table">
                  <thead>
                    <tr>
                      <th>Test</th>
                      <th>Date</th>
                      <th className="db-hide-sm">Time</th>
                      <th>Score</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => {
                      const p = pct(r.score, r.total);
                      const tone = scoreTone(p);
                      return (
                        <tr key={r._id || i}>
                          <td>
                            {nameOf(r.topicId, null) || nameOf(r.subjectId, "Test")}
                            <small>{nameOf(r.subjectId, "")} · {MODE_LABEL[r.mode] || "Test"}</small>
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>{relativeDay(r.createdAt)}</td>
                          <td className="db-hide-sm">{fmtTime(r.timeTaken)}</td>
                          <td>
                            <span className="db-pill" style={{ background: tone.bg, color: tone.color }}>{r.score}/{r.total} · {p}%</span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button type="button" className="db-link" onClick={() => navigate(retakePath(r))}>Retake</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === "leaderboard" && <LeaderboardPanel />}
      </main>

      {tourOpen && <OnboardingTour onDone={finishTour} />}

      {badgePopup && !tourOpen && (
        <div className="db-toast" role="status">
          <span aria-hidden="true">{badgePopup.icon}</span>
          <div>
            <strong>New badge: {badgePopup.title}</strong>
            <small>{badgePopup.description}</small>
          </div>
        </div>
      )}
    </div>
  );
}
