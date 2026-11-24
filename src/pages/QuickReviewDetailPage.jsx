import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import StudentHeader from "../components/StudentHeader";
import BamboLoader from "../components/BamboLoader";
import "../styles/dashboard.css";
import "../styles/student.css";

export default function QuickReviewDetailPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/api/quick-reviews/topic/${topicId}`, { _tokenType: "user" })
      .then((res) => !cancelled && setReview(res.data?.review || null))
      .catch((err) => {
        console.error("Quick review detail error:", err);
        if (!cancelled)
          setError((err?.status ?? err?.response?.status) === 404 ? "There's no quick review for this topic yet." : "We couldn't load this review. Check your connection and try again.");
      })
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  if (isLoading) return <BamboLoader message="Opening the review" />;

  const subjectId = review?.subjectId?._id || review?.subjectId;
  const topicName = review?.topicId?.name || "Topic";
  const subjectName = review?.subjectId?.name || "Subject";
  const sections = Array.isArray(review?.sections) ? review.sections : [];
  const points = sections.reduce((n, s) => n + (Array.isArray(s.points) ? s.points.length : 0), 0);

  return (
    <div className="db">
      <StudentHeader active="subjects" />
      <main className="st-main" style={{ maxWidth: 860 }}>
        {error || !review ? (
          <>
            <div className="rs-banner" role="alert">{error || "Review not found."}</div>
            <div className="st-actions" style={{ justifyContent: "flex-start" }}>
              <button type="button" className="st-btn" onClick={() => navigate(`/test/topic/${topicId}`)}>Practise this topic</button>
              <button type="button" className="st-btn st-btn-outline" onClick={() => navigate(-1)}>Go back</button>
            </div>
          </>
        ) : (
          <>
            <nav className="st-crumb" aria-label="Breadcrumb">
              <button type="button" onClick={() => navigate("/user")}>Subjects</button>
              <span aria-hidden="true">/</span>
              <button type="button" style={{ textTransform: "capitalize" }} onClick={() => navigate(`/subject/${subjectId}/topics`)}>{subjectName}</button>
              <span aria-hidden="true">/</span>
              <button type="button" onClick={() => navigate(`/subject/${subjectId}/quick-review`)}>Quick reviews</button>
            </nav>

            <header className="qr-hero">
              <p className="qr-eyebrow">Quick review</p>
              <h1>{topicName}</h1>
              {review.summary && <p className="qr-summary">{review.summary}</p>}
              <p className="st-muted" style={{ margin: 0, fontSize: 14 }}>
                {sections.length} section{sections.length === 1 ? "" : "s"} · {points} key point{points === 1 ? "" : "s"} · about {Math.max(1, Math.round(points / 4))} min
              </p>
              {sections.length > 2 && (
                <nav className="qr-toc" aria-label="Sections">
                  {sections.map((s, i) => (
                    <a key={i} href={`#qr-${i}`}>{s.heading}</a>
                  ))}
                </nav>
              )}
            </header>

            {sections.length === 0 && !review.extraNotes && <p className="st-empty">This review has no content yet.</p>}

            {sections.map((s, i) => (
              <section key={i} id={`qr-${i}`} className="qr-section">
                <h2><span>{i + 1}</span>{s.heading}</h2>
                {Array.isArray(s.points) && s.points.length > 0 && (
                  <ul>
                    {s.points.map((pt, j) => <li key={j}>{pt}</li>)}
                  </ul>
                )}
              </section>
            ))}

            {review.extraNotes && (
              <section className="qr-section qr-notes">
                <h2>Extra notes</h2>
                <p>{review.extraNotes}</p>
              </section>
            )}

            <div className="qr-cta">
              <div>
                <strong>Ready to test yourself?</strong>
                <span>Take the {topicName} test while it's fresh.</span>
              </div>
              <div className="st-actions">
                <button type="button" className="st-btn st-btn-outline" onClick={() => navigate(`/subject/${subjectId}/quick-review`)}>More reviews</button>
                <button type="button" className="st-btn" onClick={() => navigate(`/test/topic/${topicId}`)}>Practise this topic</button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
