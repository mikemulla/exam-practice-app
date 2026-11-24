import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import StudentHeader from "../components/StudentHeader";
import BamboLoader from "../components/BamboLoader";
import "../styles/dashboard.css";
import "../styles/student.css";

const listOf = (data, key) =>
  Array.isArray(data) ? data : Array.isArray(data?.[key]) ? data[key] : Array.isArray(data?.data) ? data.data : [];
const pct = (s, t) => (Number(t) ? Math.round((Number(s) / Number(t)) * 100) : 0);
const idOf = (ref) => (ref && typeof ref === "object" ? ref._id : ref) || null;

const STATUS = {
  none: { label: "Not started", cls: "tag-none" },
  work: { label: "Needs work", cls: "tag-work" },
  good: { label: "Doing well", cls: "tag-good" },
  master: { label: "Mastered", cls: "tag-master" },
};

function shortDate(date) {
  if (!date) return "";
  const d = new Date(date);
  const days = Math.round((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return d.toLocaleDateString("en-GB", { weekday: "short" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const toneBar = (p) => (p >= 80 ? "#16A34A" : p >= 50 ? "#3B82F6" : "#EA580C");
const minutes = (seconds) => Math.max(1, Math.round(Number(seconds || 0) / 60));

export default function TopicSelectionPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [randomCount, setRandomCount] = useState(20);
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const opts = { _tokenType: "user" };
    Promise.all([
      api.get(`/api/subjects/${subjectId}`, opts),
      api.get(`/api/topics/subject/${subjectId}`, opts),
      api.get("/api/results/me?limit=100", opts).catch(() => ({ data: [] })),
      api.get(`/api/tests/mistakes?subjectId=${subjectId}`, opts).catch(() => ({ data: { total: 0 } })),
    ])
      .then(([subjectRes, topicsRes, resultsRes, mistakesRes]) => {
        if (cancelled) return;
        setSubject(subjectRes.data);
        setTopics(listOf(topicsRes.data, "topics"));
        setResults(listOf(resultsRes.data, "results").filter((r) => String(idOf(r.subjectId)) === String(subjectId)));
        setMistakes(Number(mistakesRes.data?.total || 0));
      })
      .catch((err) => {
        console.error("Error loading subject:", err);
        if (!cancelled) setError((err?.status ?? err?.response?.status) === 403 ? "This subject isn't part of your course and level." : "We couldn't load this subject. Check your connection and try again.");
      })
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [subjectId]);

  const rows = useMemo(() => {
    const byTopic = new Map();
    for (const r of results) {
      const tid = idOf(r.topicId);
      if (!tid || ["retry", "mistakes", "review"].includes(r.mode)) continue;
      if (!byTopic.has(String(tid))) byTopic.set(String(tid), []);
      byTopic.get(String(tid)).push(r);
    }
    return topics
      .map((t) => {
        const attempts = byTopic.get(String(t._id)) || [];
        const scores = attempts.map((r) => pct(r.score, r.total));
        const last = attempts[0] || null;
        const best = scores.length ? Math.max(...scores) : null;
        let status = "none";
        if (attempts.length) {
          if (scores.length >= 2 && scores[0] >= 80 && scores[1] >= 80) status = "master";
          else if (scores[0] >= 80) status = "good";
          else status = "work";
        }
        const missed = last ? Number(last.total) - Number(last.score) : 0;
        return { topic: t, attempts, last, best, status, missed, canRetry: Boolean(last && last.sessionId && missed > 0) };
      })
      .sort((a, b) => String(a.topic.name).localeCompare(String(b.topic.name), undefined, { numeric: true }));
  }, [topics, results]);

  if (isLoading) return <BamboLoader message="Loading topics" />;

  if (error || !subject) {
    return (
      <div className="db">
        <StudentHeader active="subjects" />
        <main className="st-main">
          <div className="rs-banner" role="alert">{error || "Subject not found."}</div>
          <div><button type="button" className="st-btn" onClick={() => navigate("/user")}>Back to subjects</button></div>
        </main>
      </div>
    );
  }

  const totalQuestions = topics.reduce((n, t) => n + Number(t.questionCount || 0), 0);
  const attempted = rows.filter((r) => r.status !== "none");
  const mastered = rows.filter((r) => r.status === "master").length;
  const needsWork = rows.filter((r) => r.status === "work");
  const sum = results.filter((r) => !["retry", "mistakes", "review"].includes(r.mode)).reduce((a, r) => ({ s: a.s + Number(r.score || 0), t: a.t + Number(r.total || 0) }), { s: 0, t: 0 });
  const average = sum.t ? pct(sum.s, sum.t) : null;
  const weakest = [...needsWork].sort((a, b) => pct(a.last.score, a.last.total) - pct(b.last.score, b.last.total))[0];

  const q = query.trim().toLowerCase();
  const shown = rows.filter(
    (r) => (filter === "all" || r.status === filter) && (!q || String(r.topic.name).toLowerCase().includes(q)),
  );

  const countOptions = [5, 10, 20, 30, 50, 100].filter((n) => n < totalQuestions);
  if (totalQuestions > 0) countOptions.push(Math.min(totalQuestions, 200));
  const safeCount = Math.min(randomCount, totalQuestions || 0) || countOptions[0] || 0;

  const chips = [
    ["all", `All ${rows.length}`],
    ["none", `Not started ${rows.filter((r) => r.status === "none").length}`],
    ["work", `Needs work ${needsWork.length}`],
    ["master", `Mastered ${mastered}`],
  ];

  return (
    <div className="db">
      <StudentHeader active="subjects" />
      <main className="st-main">
        <nav className="st-crumb" aria-label="Breadcrumb">
          <button type="button" onClick={() => navigate("/user")}>Subjects</button>
          <span aria-hidden="true">/</span>
          <span style={{ textTransform: "capitalize" }}>{subject.name}</span>
        </nav>

        <div className="st-head">
          <div>
            <h1 className="st-h1" style={{ textTransform: "capitalize" }}>{subject.name}</h1>
            <p className="st-sub">
              {topics.length} topic{topics.length === 1 ? "" : "s"} · {totalQuestions.toLocaleString("en-GB")} questions · every question is explained
            </p>
          </div>
          <div className="st-figures">
            <div><strong>{attempted.length}</strong>attempted</div>
            <div><strong>{mastered}</strong>mastered</div>
            <div><strong>{average === null ? "–" : `${average}%`}</strong>average</div>
          </div>
        </div>

        <section className="st-modes" aria-label="Ways to practise">
          <button type="button" className="st-mode primary" disabled={!totalQuestions} onClick={() => navigate(`/test/subject/${subjectId}`)}>
            <strong>Full subject test</strong>
            <span>All {totalQuestions.toLocaleString("en-GB")} questions across every topic · {minutes(subject.duration)} min timer</span>
          </button>
          <div className="st-mode" style={{ cursor: "default" }}>
            <strong>Random mix</strong>
            <span>Questions picked at random from all topics</span>
            <div className="st-mode-row">
              <label style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }} htmlFor="random-count">Number of questions</label>
              <select id="random-count" className="st-select" value={safeCount} onChange={(e) => setRandomCount(Number(e.target.value))} disabled={!totalQuestions}>
                {countOptions.map((n) => (
                  <option key={n} value={n}>{n} questions</option>
                ))}
              </select>
              <button type="button" className="st-btn" style={{ minHeight: 40 }} disabled={!safeCount} onClick={() => navigate(`/test/subject/${subjectId}?mode=random&limit=${safeCount}`)}>
                Start
              </button>
            </div>
          </div>
          {mistakes > 0 ? (
            <button type="button" className="st-mode" onClick={() => navigate(`/test/subject/${subjectId}?mode=mistakes&limit=${Math.min(mistakes, 30)}`)}>
              <strong>Fix your mistakes</strong>
              <span>{mistakes} question{mistakes === 1 ? "" : "s"} you got wrong last time{mistakes > 30 ? " · 30 at a time" : ""}</span>
            </button>
          ) : (
            <button type="button" className="st-mode" disabled={!weakest} onClick={() => weakest && navigate(`/test/topic/${weakest.topic._id}`)}>
              <strong>Weakest topic</strong>
              <span>{weakest ? `${weakest.topic.name} · last score ${pct(weakest.last.score, weakest.last.total)}%` : "Take a few topic tests and your weakest one shows up here"}</span>
            </button>
          )}
          <button type="button" className="st-mode" onClick={() => navigate(`/subject/${subjectId}/quick-review`)}>
            <strong>Quick reviews</strong>
            <span>Short summaries to read before a test</span>
          </button>
        </section>

        <section className="st-panel" aria-label="Topics">
          <div className="st-toolbar">
            <div className="st-chips" role="group" aria-label="Filter topics">
              {chips.map(([key, label]) => (
                <button key={key} type="button" className="st-chip" aria-pressed={filter === key} onClick={() => setFilter(key)}>
                  {label}
                </button>
              ))}
            </div>
            <label className="st-search">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Search topics</span>
              <input type="search" placeholder="Search topics" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
          </div>

          <div role="table" aria-label="Topics">
            <div className="st-trow st-thead" role="row">
              <span role="columnheader">Topic</span>
              <span role="columnheader">Questions</span>
              <span role="columnheader">Your best</span>
              <span role="columnheader">Last attempt</span>
              <span role="columnheader" style={{ textAlign: "right" }}>Actions</span>
            </div>
            {shown.length === 0 ? (
              <p className="st-empty">{rows.length === 0 ? "No topics have been added to this subject yet." : "No topics match this filter."}</p>
            ) : (
              shown.map((r) => {
                const st = STATUS[r.status];
                const count = Number(r.topic.questionCount || 0);
                return (
                  <div className="st-trow" role="row" key={r.topic._id}>
                    <div role="cell">
                      <div className="st-topic-name">{r.topic.name}</div>
                      <span className={`st-tag ${st.cls}`}>{st.label}</span>
                    </div>
                    <div role="cell" className="st-muted">
                      <span className="st-cell-label">Questions</span>
                      {count}
                    </div>
                    <div role="cell">
                      <span className="st-cell-label">Your best</span>
                      {r.best === null ? (
                        <span className="st-muted">—</span>
                      ) : (
                        <div className="st-best">
                          <span className="db-track" style={{ display: "block" }}>
                            <span className="db-fill" style={{ display: "block", height: 6, width: `${Math.max(r.best, 3)}%`, background: toneBar(r.best) }} />
                          </span>
                          <b>{r.best}%</b>
                        </div>
                      )}
                    </div>
                    <div role="cell" className="st-muted">
                      <span className="st-cell-label">Last attempt</span>
                      {r.last ? `${shortDate(r.last.createdAt)}, ${r.last.score}/${r.last.total}` : "—"}
                    </div>
                    <div role="cell" className="st-actions">
                      {r.canRetry && (
                        <button type="button" className="st-btn st-btn-text" onClick={() => navigate(`/test/subject/${subjectId}?retry=${r.last._id}`)}>
                          Retry {r.missed} missed
                        </button>
                      )}
                      {r.status === "none" && (
                        <button type="button" className="st-btn st-btn-text" onClick={() => navigate(`/subject/${subjectId}/quick-review`)}>
                          Quick review
                        </button>
                      )}
                      <button
                        type="button"
                        className={`st-btn${r.status === "master" || r.status === "none" ? " st-btn-outline" : ""}`}
                        disabled={!count}
                        onClick={() => navigate(`/test/topic/${r.topic._id}`)}
                      >
                        {r.status === "none" ? "Start" : r.status === "master" ? "Practise again" : "Practise"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
