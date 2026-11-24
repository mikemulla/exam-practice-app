import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import StudentHeader from "../components/StudentHeader";
import BamboLoader from "../components/BamboLoader";
import "../styles/dashboard.css";
import "../styles/student.css";

const relDay = (d) => {
  const days = Math.round((Date.now() - new Date(d).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export default function MistakesPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [review, setReview] = useState(null);
  const [openedAt] = useState(() => Date.now());
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("all");
  const [shown, setShown] = useState(20);

  useEffect(() => {
    const opts = { _tokenType: "user" };
    const tz = new Date().getTimezoneOffset();
    api.get(`/api/tests/review?tz=${tz}`, opts).then((res) => setReview(res.data)).catch(() => setReview({ dueToday: 0, inSchedule: 0, subjects: [], week: [] }));
    api
      .get("/api/tests/mistakes", opts)
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Couldn't load your mistakes."));
  }, []);

  const items = useMemo(() => (data?.items || []).filter((q) => subject === "all" || q.subjectId === subject), [data, subject]);

  if ((!data || !review) && !error) return <BamboLoader message="Getting your review ready" tip="Tip: reviewing a question just as you're about to forget it is what makes it stick." />;

  const practise = (subjectId, count) => navigate(`/test/subject/${subjectId}?mode=mistakes&limit=${Math.min(count, 30)}`);

  return (
    <div className="db">
      <StudentHeader active="mistakes" />
      <main className="st-main" style={{ maxWidth: 980 }}>
        <div>
          <h1 className="st-h1">Review</h1>
          <p className="st-sub">Questions you got wrong come back after 1 day, then 3, then 7, until they stick.</p>
        </div>

        {review && (
          <section className="rvw-due" aria-label="Due today">
            <div className="rvw-due-top">
              <div>
                <p className="rvw-label">Due today</p>
                <p className="rvw-big">{review.dueToday} question{review.dueToday === 1 ? "" : "s"}</p>
                <p className="rvw-sub">
                  {review.dueToday > 0
                    ? "A few minutes now saves hours before the exam."
                    : review.inSchedule > 0
                      ? `All done for today. ${review.inSchedule} question${review.inSchedule === 1 ? " is" : "s are"} scheduled for later.`
                      : "Nothing scheduled yet. Questions you get wrong in any test will show up here."}
                </p>
              </div>
              {review.week?.length > 0 && review.inSchedule > 0 && (
                <div className="rvw-week" role="img" aria-label={`Due over the next 7 days: ${review.week.map((d) => d.count).join(", ")}`}>
                  {review.week.map((d) => {
                    const max = Math.max(...review.week.map((w) => w.count), 1);
                    const label = d.day === 0 ? "Today" : new Date(openedAt + d.day * 86400000).toLocaleDateString("en-GB", { weekday: "short" });
                    return (
                      <div key={d.day} className="rvw-col">
                        <span className="rvw-n">{d.count || ""}</span>
                        <span className="rvw-bar" style={{ height: `${Math.max((d.count / max) * 56, d.count ? 6 : 2)}px` }} />
                        <span className="rvw-d">{label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {review.subjects.length > 0 && (
              <div className="rvw-start">
                {review.subjects.map((s) => (
                  <button key={s.subjectId} type="button" className="db-btn-white" onClick={() => navigate(`/test/subject/${s.subjectId}?mode=review&limit=${Math.min(s.count, 30)}`)}>
                    Review {Math.min(s.count, 30)} · <span style={{ textTransform: "capitalize" }}>{s.name}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="st-head" style={{ marginTop: 8 }}>
          <div>
            <h2 className="st-h1" style={{ fontSize: 22 }}>All mistakes</h2>
            <p className="st-sub">Everything you got wrong last time you saw it. Get it right and it leaves this list.</p>
          </div>
          {data && <div className="st-figures"><div><strong>{data.total}</strong>to fix</div><div><strong>{data.subjects.length}</strong>subject{data.subjects.length === 1 ? "" : "s"}</div></div>}
        </div>

        {error && <div className="rs-banner" role="alert">{error}</div>}

        {data && data.total === 0 && (
          <div className="st-panel st-empty">
            <p style={{ margin: "0 0 12px", fontSize: 16 }}>🎉 No mistakes waiting.</p>
            <p style={{ margin: "0 0 16px" }}>Questions you get wrong in any test will collect here so you can practise them.</p>
            <button type="button" className="st-btn" onClick={() => navigate("/user")}>Practise a subject</button>
          </div>
        )}

        {data && data.total > 0 && (
          <>
            <section className="st-modes" aria-label="Practise your mistakes">
              {data.subjects.map((s) => (
                <button key={s.subjectId} type="button" className={`st-mode${data.subjects.length === 1 ? " primary" : ""}`} onClick={() => practise(s.subjectId, s.count)}>
                  <strong style={{ textTransform: "capitalize" }}>{s.name}</strong>
                  <span>Practise {Math.min(s.count, 30)} of your {s.count} mistake{s.count === 1 ? "" : "s"} →</span>
                </button>
              ))}
            </section>

            <section className="st-panel" aria-label="Your mistakes">
              {data.subjects.length > 1 && (
                <div className="st-chips" role="group" aria-label="Filter by subject">
                  <button type="button" className="st-chip" aria-pressed={subject === "all"} onClick={() => setSubject("all")}>All {data.total}</button>
                  {data.subjects.map((s) => (
                    <button key={s.subjectId} type="button" className="st-chip" aria-pressed={subject === s.subjectId} onClick={() => setSubject(s.subjectId)} style={{ textTransform: "capitalize" }}>
                      {s.name} {s.count}
                    </button>
                  ))}
                </div>
              )}
              <div>
                {items.slice(0, shown).map((q) => (
                  <details key={q.questionId} className="mb-item">
                    <summary>
                      <span className="mb-q">{q.questionText || "Question"}</span>
                      <span className="mb-meta">
                        {q.topicName || q.subjectName} · {q.timesWrong > 1 ? <b>wrong {q.timesWrong} times</b> : "wrong once"} · {relDay(q.lastAt)}
                      </span>
                    </summary>
                    <div className="mb-answer">
                      <p><span className="mb-x">✕</span> Your last answer: <b>{q.lastAnswer ?? "skipped"}</b></p>
                      <p><span className="mb-ok">✓</span> Correct answer: <b>{q.correctAnswer}</b></p>
                    </div>
                  </details>
                ))}
              </div>
              {items.length > shown && (
                <button type="button" className="st-btn st-btn-outline" style={{ alignSelf: "center" }} onClick={() => setShown((n) => n + 30)}>
                  Show more ({items.length - shown} left)
                </button>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
