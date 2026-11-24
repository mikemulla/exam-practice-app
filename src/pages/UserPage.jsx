import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import StudentHeader from "../components/StudentHeader";
import BamboLoader from "../components/BamboLoader";
import { readUserInfo } from "../lib/userInfo";
import "../styles/dashboard.css";
import "../styles/student.css";

const listOf = (data, key) =>
  Array.isArray(data) ? data : Array.isArray(data?.[key]) ? data[key] : Array.isArray(data?.data) ? data.data : [];

const pct = (correct, total) => (Number(total) ? Math.round((Number(correct) / Number(total)) * 100) : 0);

export default function UserPage() {
  const navigate = useNavigate();
  const [userInfo] = useState(readUserInfo);
  const [subjects, setSubjects] = useState([]);
  const [topicsBySubject, setTopicsBySubject] = useState({});
  const [bySubject, setBySubject] = useState({});
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const opts = { _tokenType: "user" };
    (async () => {
      try {
        const [subjectsRes, summaryRes] = await Promise.all([
          api.get("/api/subjects?limit=100", opts),
          api.get("/api/results/me/summary", opts).catch(() => ({ data: {} })),
        ]);
        const list = listOf(subjectsRes.data, "subjects");
        const topicLists = await Promise.all(
          list.map((s) =>
            api
              .get(`/api/topics/subject/${s._id}`, opts)
              .then((res) => [s._id, listOf(res.data, "topics")])
              .catch(() => [s._id, []]),
          ),
        );
        if (cancelled) return;
        setSubjects(list);
        setTopicsBySubject(Object.fromEntries(topicLists));
        setBySubject(summaryRes.data?.bySubject || {});
      } catch (err) {
        console.error("Error loading subjects:", err);
        if (!cancelled) setError("We couldn't load your subjects. Check your connection and try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subjects
      .filter((s) => !q || String(s.name).toLowerCase().includes(q))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [subjects, query]);

  if (isLoading) return <BamboLoader message="Loading your subjects" />;

  const classLabel = [userInfo.course?.name, userInfo.level ? `${userInfo.level} Level` : null].filter(Boolean).join(" · ");

  return (
    <div className="db">
      <StudentHeader active="subjects" />
      <main className="st-main">
        <div className="st-head">
          <div>
            {classLabel && <p className="db-eyebrow">{classLabel}</p>}
            <h1 className="st-h1">Subjects</h1>
            <p className="st-sub">Choose a subject to see its topics, practise tests and quick reviews.</p>
          </div>
          <button type="button" className="st-btn st-btn-outline" onClick={() => navigate("/request-subject")}>
            Request a subject
          </button>
        </div>

        {error && <div className="rs-banner" role="alert">{error}</div>}

        {subjects.length > 3 && (
          <label className="st-search" style={{ flex: "none", width: "100%", maxWidth: 360 }}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <span className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Search subjects</span>
            <input type="search" placeholder="Search subjects" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        )}

        {!error && subjects.length === 0 ? (
          <div className="st-panel st-empty">
            <p style={{ margin: 0 }}>There are no subjects for your course and level yet.</p>
            <div><button type="button" className="st-btn" onClick={() => navigate("/request-subject")}>Request a subject</button></div>
          </div>
        ) : (
          <div className="db-grid-3">
            {shown.map((s) => {
              const topics = topicsBySubject[s._id] || [];
              const questionTotal = topics.reduce((n, t) => n + Number(t.questionCount || 0), 0);
              const stats = bySubject[String(s._id)];
              const avg = stats ? pct(stats.correct, stats.total) : 0;
              return (
                <button key={s._id} type="button" className="st-subject" onClick={() => navigate(`/subject/${s._id}/topics`)}>
                  <strong>{s.name}</strong>
                  <span className="db-small">
                    {topics.length} topic{topics.length === 1 ? "" : "s"} · {questionTotal.toLocaleString("en-GB")} question{questionTotal === 1 ? "" : "s"}
                  </span>
                  <span className="db-track" style={{ display: "block", height: 6 }}>
                    <span className="db-fill" style={{ display: "block", height: 6, width: `${stats ? Math.max(avg, 3) : 0}%`, background: "#185FA5" }} />
                  </span>
                  <span className="st-subject-foot">
                    <span>{stats ? `${stats.attempts} test${stats.attempts === 1 ? "" : "s"} · average ${avg}%` : "Not started yet"}</span>
                    <b>Open →</b>
                  </span>
                </button>
              );
            })}
            {shown.length === 0 && <p className="db-small">No subjects match “{query}”.</p>}
          </div>
        )}
      </main>
    </div>
  );
}
