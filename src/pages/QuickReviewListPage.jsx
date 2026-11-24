import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import StudentHeader from "../components/StudentHeader";
import BamboLoader from "../components/BamboLoader";
import "../styles/dashboard.css";
import "../styles/student.css";

const listOf = (data, key) =>
  Array.isArray(data) ? data : Array.isArray(data?.[key]) ? data[key] : Array.isArray(data?.data) ? data.data : [];
const idOf = (ref) => (ref && typeof ref === "object" ? ref._id : ref) || null;

export default function QuickReviewListPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [query, setQuery] = useState("");
  const [onlyReady, setOnlyReady] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const opts = { _tokenType: "user" };
    Promise.all([
      api.get(`/api/subjects/${subjectId}`, opts),
      api.get(`/api/quick-reviews/subject/${subjectId}`, opts),
      api.get(`/api/topics/subject/${subjectId}`, opts),
    ])
      .then(([s, r, t]) => {
        if (cancelled) return;
        setSubject(s.data?.subject || s.data);
        setReviews(listOf(r.data, "reviews"));
        setTopics(listOf(t.data, "topics"));
      })
      .catch((err) => {
        console.error("Quick review list error:", err);
        if (!cancelled) setError("We couldn't load the quick reviews. Check your connection and try again.");
      })
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [subjectId]);

  const cards = useMemo(() => {
    const byTopic = new Map(reviews.map((r) => [String(idOf(r.topicId)), r]));
    const q = query.trim().toLowerCase();
    return topics
      .map((topic) => ({ topic, review: byTopic.get(String(topic._id)) || null }))
      .filter(({ topic, review }) => {
        if (onlyReady && !review) return false;
        if (!q) return true;
        return String(topic.name).toLowerCase().includes(q) || String(review?.summary || "").toLowerCase().includes(q);
      })
      .sort((a, b) => Number(Boolean(b.review)) - Number(Boolean(a.review)) || String(a.topic.name).localeCompare(String(b.topic.name), undefined, { numeric: true }));
  }, [topics, reviews, query, onlyReady]);

  if (isLoading) return <BamboLoader message="Loading quick reviews" tip="Tip: read the quick review, then take the topic test while it's fresh." />;

  const readyCount = topics.filter((t) => reviews.some((r) => String(idOf(r.topicId)) === String(t._id))).length;

  return (
    <div className="db">
      <StudentHeader active="subjects" />
      <main className="st-main">
        <nav className="st-crumb" aria-label="Breadcrumb">
          <button type="button" onClick={() => navigate("/user")}>Subjects</button>
          <span aria-hidden="true">/</span>
          <button type="button" style={{ textTransform: "capitalize" }} onClick={() => navigate(`/subject/${subjectId}/topics`)}>{subject?.name || "Subject"}</button>
          <span aria-hidden="true">/</span>
          <span>Quick reviews</span>
        </nav>

        <div className="st-head">
          <div>
            <h1 className="st-h1">Quick reviews</h1>
            <p className="st-sub">
              <span style={{ textTransform: "capitalize" }}>{subject?.name}</span> · {readyCount} of {topics.length} topics have a review. Read one, then test yourself on it.
            </p>
          </div>
        </div>

        {error ? (
          <div className="rs-banner" role="alert">{error}</div>
        ) : (
          <section className="st-panel" aria-label="Reviews">
            <div className="st-toolbar">
              <div className="st-chips" role="group" aria-label="Filter">
                <button type="button" className="st-chip" aria-pressed={onlyReady} onClick={() => setOnlyReady(true)}>With a review {readyCount}</button>
                <button type="button" className="st-chip" aria-pressed={!onlyReady} onClick={() => setOnlyReady(false)}>All topics {topics.length}</button>
              </div>
              <label className="st-search">
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Search reviews</span>
                <input type="search" placeholder="Search topics or summaries" value={query} onChange={(e) => setQuery(e.target.value)} />
              </label>
            </div>

            {cards.length === 0 ? (
              <p className="st-empty">
                {topics.length === 0 ? "This subject has no topics yet." : readyCount === 0 && onlyReady ? "No quick reviews have been published for this subject yet." : "Nothing matches your search."}
              </p>
            ) : (
              <div className="qr-grid">
                {cards.map(({ topic, review }) => {
                  const sections = Array.isArray(review?.sections) ? review.sections : [];
                  const points = sections.reduce((n, s) => n + (Array.isArray(s.points) ? s.points.length : 0), 0);
                  return (
                    <article key={topic._id} className={`qr-card${review ? "" : " off"}`}>
                      <div>
                        <h2>{topic.name}</h2>
                        <p>{review ? review.summary || `${sections.length} sections to read before your test.` : "No quick review for this topic yet."}</p>
                      </div>
                      <div className="qr-foot">
                        <span className="st-muted">{review ? `${sections.length} section${sections.length === 1 ? "" : "s"} · ${points} point${points === 1 ? "" : "s"}` : `${topic.questionCount || 0} questions`}</span>
                        <div className="st-actions">
                          <button type="button" className="st-btn st-btn-text" disabled={!topic.questionCount} onClick={() => navigate(`/test/topic/${topic._id}`)}>Practise</button>
                          {review && <button type="button" className="st-btn" onClick={() => navigate(`/quick-review/topic/${topic._id}`)}>Read</button>}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
