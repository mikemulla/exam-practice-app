import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publicReviews } from "../data/publicReviews";
import BlobBackground from "../components/BlobBackground";
import usePageMetadata from "../hooks/usePageMetadata";

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
      <path
        d="M5 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle
        cx="8.5"
        cy="8.5"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M13 13l4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M4 3.5h8.5A2.5 2.5 0 0 1 15 6v10.5H6.5A2.5 2.5 0 0 0 4 19V3.5Z"
        stroke="var(--button-primary)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 7h5M7 10h5M7 13h3"
        stroke="var(--button-primary)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

const S = {
  page: {
    minHeight: "100vh",
    background: "var(--bg-primary)",
    position: "relative",
    overflow: "hidden",
  },

  inner: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1080px",
    margin: "0 auto",
    padding: "2.5rem 1.25rem 4rem",
  },
  header: { marginBottom: "2rem" },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "1.25rem",
    padding: "7px 14px",
    border: "0.5px solid var(--border-color)",
    borderRadius: "8px",
    background: "var(--bg-secondary)",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  eyebrow: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "0.75rem",
  },
  heading: {
    fontSize: "clamp(26px, 4.5vw, 38px)",
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: "0 0 0.625rem",
    letterSpacing: "-0.02em",
    maxWidth: "620px",
  },
  subheading: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: "1.65",
    maxWidth: "540px",
    margin: 0,
  },
  statsRow: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    marginTop: "1rem",
    fontSize: "13px",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "var(--text-secondary)",
  },
  statValue: { fontWeight: "600", color: "var(--button-primary)" },
  searchWrapper: {
    position: "relative",
    marginTop: "1.5rem",
    marginBottom: "0.5rem",
    maxWidth: "560px",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-secondary)",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    border: "0.5px solid var(--border-color)",
    borderRadius: "10px",
    padding: "12px 14px 12px 42px",
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
    fontSize: "14px",
    fontWeight: "500",
    outline: "none",
    transition: "all 0.2s ease",
  },
  clearSearchButton: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "26px",
    height: "26px",
    border: "none",
    borderRadius: "50%",
    background: "var(--surface-alt)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "700",
    lineHeight: 1,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
    gap: "16px",
    marginTop: "2rem",
  },
  card: {
    background: "var(--bg-secondary)",
    border: "0.5px solid var(--border-color)",
    borderRadius: "14px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.2s ease",
  },
  cardHover: {
    borderColor: "rgba(24, 95, 165, 0.25)",
    boxShadow: "0 8px 32px rgba(24,95,165,0.10), 0 2px 8px rgba(0,0,0,0.06)",
    transform: "translateY(-2px)",
  },
  iconBubble: {
    width: "44px",
    height: "44px",
    borderRadius: "11px",
    background: "var(--surface-alt)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1.25rem",
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: "0 0 8px",
    letterSpacing: "-0.01em",
    lineHeight: 1.35,
  },
  cardDescription: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    margin: "0 0 1.25rem",
    lineHeight: "1.65",
    flex: 1,
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "var(--surface-alt)",
    color: "var(--button-primary)",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "1.25rem",
    width: "fit-content",
  },
  divider: {
    height: "0.5px",
    background: "var(--border-color)",
    marginBottom: "1.25rem",
  },
  button: {
    marginTop: "auto",
    width: "100%",
    padding: "11px 16px",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    letterSpacing: "-0.01em",
    background: "var(--button-primary)",
    color: "#fff",
  },
  emptyState: {
    background: "var(--bg-secondary)",
    border: "0.5px solid var(--border-color)",
    borderRadius: "14px",
    padding: "3.5rem 2rem",
    textAlign: "center",
    marginTop: "2rem",
  },
  emptyIcon: { fontSize: "40px", marginBottom: "1rem" },
  emptyTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: "0 0 8px",
  },
  emptyBody: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.65",
    maxWidth: "360px",
    margin: "0 auto",
  },
};

function ReviewCard({ review, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="review-card-enter"
      style={{
        ...S.card,
        ...(hovered ? S.cardHover : {}),
        animationDelay: `${index * 50}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={S.iconBubble}>
        <ReviewIcon />
      </div>
      <h3 style={S.cardTitle}>{review.title}</h3>
      <p style={S.cardDescription}>{review.excerpt}</p>
      <div style={S.cardMeta}>
        <span style={{ fontSize: "11px" }}>📚</span>
        <span>{review.subject}</span>
      </div>
      <div style={S.divider} />
      <Link
        to={`/quick-reviews/${review.slug}`}
        style={S.button}
        onMouseEnter={(e) => {
          if (hovered) e.currentTarget.style.backgroundColor = "#0e3d6e";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--button-primary)";
        }}
      >
        <span>Read {review.title}</span>
        <ChevronRight />
      </Link>
    </div>
  );
}

export default function PublicQuickReviewsPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  usePageMetadata(
    "Free Medical Quick Reviews | Bambo",
    "Read free medical study reviews covering cardiology, paediatrics, renal medicine, respiratory medicine, and other exam topics.",
  );

  const reviews = useMemo(() => {
    const n = q.trim().toLowerCase();
    return n
      ? publicReviews.filter((r) =>
          `${r.title} ${r.subject} ${r.excerpt}`.toLowerCase().includes(n),
        )
      : publicReviews;
  }, [q]);

  const subjectCount = useMemo(
    () => new Set(publicReviews.map((r) => r.subject)).size,
    [],
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={S.page}>
        <BlobBackground amount="full" orientation="wide" />

        <div style={S.inner}>
          <div className="library-header" style={S.header}>
            <button
              onClick={() => navigate("/")}
              style={S.backBtn}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--surface-alt)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")
              }
            >
              ← Back
            </button>

            <p style={S.eyebrow}>Quick Reviews</p>
            <h1 style={S.heading}>
              Clear, focused reviews for better exam preparation.
            </h1>
            <p style={S.subheading}>
              Explore original study articles covering important concepts,
              practical diagnostic frameworks, and exam-focused explanations. No
              account is required.
            </p>

            <div className="study-library-intro"><p>Each review includes a worked example, a comparison table and references for further reading. Read for understanding, then test recall by explaining the case before checking its reasoning.</p><p>Start with <Link to="/quick-reviews/cardiac-output-physiology">cardiac output</Link> for core physiology, <Link to="/quick-reviews/acute-kidney-injury">acute kidney injury</Link> for diagnostic frameworks, or <Link to="/sample-questions">worked questions</Link> to find a topic to revisit.</p></div>
            <div style={S.statsRow}>
              <div style={S.statItem}>
                <span style={S.statValue}>{publicReviews.length}</span>
                <span>review{publicReviews.length === 1 ? "" : "s"}</span>
              </div>
              <div style={S.statItem}>
                <span style={S.statValue}>{subjectCount}</span>
                <span>subject{subjectCount === 1 ? "" : "s"}</span>
              </div>
            </div>

            <div className="library-search-wrapper" style={S.searchWrapper}>
              <div style={S.searchIcon}>
                <SearchIcon />
              </div>
              <input
                className="library-search-input"
                aria-label="Search reviews by topic or subject"
                type="search"
                placeholder="Search reviews by topic or subject"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                style={{ ...S.searchInput, paddingRight: q ? "44px" : "14px" }}
              />
              {q && (
                <button
                  type="button"
                  aria-label="Clear search"
                  style={S.clearSearchButton}
                  onClick={() => setQ("")}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {reviews.length === 0 ? (
            <div style={S.emptyState}>
              <div style={S.emptyIcon}>🔍</div>
              <p style={S.emptyTitle}>No matching reviews found</p>
              <p style={S.emptyBody}>
                No review matches "{q}". Try another keyword.
              </p>
            </div>
          ) : (
            <div style={S.grid}>
              {reviews.map((r, i) => (
                <ReviewCard
                  key={r.slug}
                  review={r}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
