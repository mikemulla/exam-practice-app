import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";

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

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M6.5 3.5h7l-1 6 2.5 2.5v1H11v4l-1 1-1-1v-4H5v-1l2.5-2.5-1-6Z"
        stroke="var(--button-primary)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M5 3.5h7l3 3v10H5v-13Z"
        stroke="var(--button-primary)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M12 3.5V7h3M7.5 10h5M7.5 13h5"
        stroke="var(--button-primary)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function QuickReviewDetailPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [review, setReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setIsLoading(true);

        const response = await api.get(`/api/quick-reviews/topic/${topicId}`, {
          _tokenType: "user",
        });

        setReview(response.data?.review);
      } catch (error) {
        console.error("Quick review detail error:", error);
        alert(error.message || "Unable to load quick review.");
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReview();
  }, [topicId, navigate]);

  const sections = useMemo(() => {
    return Array.isArray(review?.sections) ? review.sections : [];
  }, [review]);

  const pointCount = useMemo(() => {
    return sections.reduce((total, section) => {
      return (
        total + (Array.isArray(section.points) ? section.points.length : 0)
      );
    }, 0);
  }, [sections]);

  const S = {
    page: {
      minHeight: "100vh",
      background: "var(--bg-primary)",
      padding: "2.5rem 1.25rem 4rem",
      color: "var(--text-primary)",
    },
    container: {
      maxWidth: "1120px",
      margin: "0 auto",
      width: "100%",
    },
    loadingContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "16px",
      marginTop: "2rem",
    },
    loadingItem: {
      background: "var(--bg-secondary)",
      border: "1px solid var(--border-color)",
      borderRadius: "14px",
      height: "170px",
      animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    },
    header: {
      marginBottom: "2rem",
    },
    backBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      marginBottom: "1.25rem",
      padding: "7px 14px",
      border: "1px solid var(--border-color)",
      borderRadius: "8px",
      background: "var(--bg-secondary)",
      color: "var(--text-secondary)",
      fontSize: "13px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    hero: {
      background: "var(--bg-secondary)",
      border: "1px solid var(--border-color)",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 8px 22px rgba(15,23,42,0.06)",
    },
    heroTop: {
      display: "flex",
      alignItems: "flex-start",
      gap: "14px",
      minWidth: 0,
    },
    iconBubble: {
      width: "48px",
      height: "48px",
      minWidth: "48px",
      borderRadius: "12px",
      background: "var(--surface-alt)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    heroText: {
      flex: 1,
      minWidth: 0,
    },
    eyebrow: {
      fontSize: "11px",
      fontWeight: "700",
      color: "var(--text-secondary)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      margin: "0 0 0.5rem",
    },
    title: {
      fontSize: "clamp(24px, 5vw, 34px)",
      fontWeight: "700",
      color: "var(--text-primary)",
      margin: "0 0 0.5rem",
      letterSpacing: "-0.02em",
      lineHeight: 1.15,
      wordBreak: "break-word",
    },
    subtitle: {
      fontSize: "13px",
      color: "var(--button-primary)",
      fontWeight: "700",
      margin: 0,
      lineHeight: 1.5,
    },
    summary: {
      margin: "18px 0 0",
      color: "var(--text-secondary)",
      lineHeight: 1.7,
      fontSize: "14px",
      maxWidth: "820px",
    },
    statsRow: {
      display: "flex",
      gap: "18px",
      flexWrap: "wrap",
      marginTop: "18px",
      fontSize: "13px",
    },
    statItem: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "var(--text-secondary)",
    },
    statValue: {
      fontWeight: "800",
      color: "var(--button-primary)",
      fontSize: "16px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "16px",
      alignItems: "stretch",
      marginTop: "18px",
    },
    sectionCard: {
      width: "100%",
      minHeight: "170px",
      height: "100%",
      boxSizing: "border-box",
      background: "var(--bg-secondary)",
      border: "1px solid var(--border-color)",
      borderRadius: "14px",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      textAlign: "left",
      color: "var(--text-primary)",
      overflow: "hidden",
      boxShadow: "0 8px 22px rgba(15,23,42,0.04)",
    },
    sectionHeader: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      minWidth: 0,
      marginBottom: "14px",
    },
    sectionIcon: {
      width: "42px",
      height: "42px",
      minWidth: "42px",
      borderRadius: "10px",
      background: "var(--surface-alt)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    sectionTitleWrap: {
      flex: 1,
      minWidth: 0,
    },
    sectionTitle: {
      fontSize: "15px",
      fontWeight: "700",
      color: "var(--text-primary)",
      margin: 0,
      letterSpacing: "-0.01em",
      lineHeight: 1.35,
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      wordBreak: "break-word",
    },
    countBadge: {
      borderRadius: "999px",
      padding: "5px 10px",
      fontSize: "11px",
      fontWeight: "800",
      whiteSpace: "nowrap",
      flexShrink: 0,
      background: "#eff6ff",
      color: "var(--button-primary)",
    },
    list: {
      margin: 0,
      paddingLeft: "18px",
      display: "grid",
      gap: "10px",
    },
    listItem: {
      color: "var(--text-secondary)",
      lineHeight: 1.65,
      fontSize: "13px",
      paddingLeft: "2px",
    },
    notesCard: {
      background: "var(--bg-secondary)",
      border: "1px solid var(--border-color)",
      borderRadius: "14px",
      padding: "16px",
      marginTop: "16px",
      boxShadow: "0 8px 22px rgba(15,23,42,0.04)",
    },
    notesHeader: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "12px",
    },
    extraNotes: {
      margin: 0,
      color: "var(--text-secondary)",
      lineHeight: 1.7,
      whiteSpace: "pre-line",
      fontSize: "13px",
    },
    emptyState: {
      background: "var(--bg-secondary)",
      border: "1px solid var(--border-color)",
      borderRadius: "12px",
      padding: "3rem 2rem",
      textAlign: "center",
      marginTop: "2rem",
    },
    emptyTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "var(--text-primary)",
      margin: "0 0 8px",
    },
    emptyBody: {
      fontSize: "13px",
      color: "var(--text-secondary)",
      lineHeight: "1.6",
      margin: "0 auto",
    },
    footerActions: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginTop: "22px",
    },
    primaryButton: {
      border: "none",
      borderRadius: "10px",
      padding: "11px 16px",
      background: "var(--button-primary)",
      color: "#fff",
      fontWeight: "800",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
    },
    secondaryButton: {
      border: "1px solid var(--border-color)",
      borderRadius: "10px",
      padding: "11px 16px",
      background: "var(--bg-secondary)",
      color: "var(--text-primary)",
      fontWeight: "800",
      cursor: "pointer",
    },
  };

  if (isLoading) {
    return (
      <div style={S.page}>
        <div style={S.container}>
          <div style={{ height: "140px" }} />
          <div style={S.loadingContainer}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={S.loadingItem} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!review) return null;

  const topicName = review.topicId?.name || "Topic";
  const subjectName = review.subjectId?.name || "Subject";

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .detail-page-header {
          animation: fadeUp 0.4s ease both;
        }

        .review-section-card {
          animation: fadeUp 0.35s ease both;
        }

        @media (max-width: 768px) {
          .detail-page {
            padding: 1.75rem 1rem 4rem !important;
          }

          .review-section-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .detail-page {
            padding: 1.5rem 0.75rem 4rem !important;
          }

          .detail-hero {
            padding: 16px !important;
          }

          .review-section-card {
            min-height: auto !important;
            padding: 14px !important;
          }

          .detail-actions button {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>

      <div className="detail-page" style={S.page}>
        <div style={S.container}>
          <div className="detail-page-header" style={S.header}>
            <button
              onClick={() => navigate(-1)}
              style={S.backBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--surface-alt)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
              }}
            >
              ← Back to reviews
            </button>

            <section className="detail-hero" style={S.hero}>
              <div style={S.heroTop}>
                <div style={S.iconBubble}>
                  <ReviewIcon />
                </div>

                <div style={S.heroText}>
                  <p style={S.eyebrow}>Quick Review</p>

                  <h1 style={S.title}>{topicName}</h1>

                  <p style={S.subtitle}>
                    {subjectName} · {topicName}
                  </p>
                </div>
              </div>

              {review.summary && <p style={S.summary}>{review.summary}</p>}

              <div style={S.statsRow}>
                <div style={S.statItem}>
                  <span style={S.statValue}>{sections.length}</span>
                  <span>section{sections.length === 1 ? "" : "s"}</span>
                </div>

                <div style={S.statItem}>
                  <span style={S.statValue}>{pointCount}</span>
                  <span>review point{pointCount === 1 ? "" : "s"}</span>
                </div>
              </div>
            </section>
          </div>

          {sections.length === 0 && !review.extraNotes ? (
            <div style={S.emptyState}>
              <p style={S.emptyTitle}>No review content available</p>
              <p style={S.emptyBody}>
                This topic does not have review sections yet.
              </p>
            </div>
          ) : null}

          {sections.length > 0 && (
            <div className="review-section-grid" style={S.grid}>
              {sections.map((section, index) => (
                <ReviewSection
                  key={`${section.heading}-${index}`}
                  title={section.heading}
                  items={section.points}
                  index={index}
                  S={S}
                />
              ))}
            </div>
          )}

          {review.extraNotes && (
            <section
              className="review-section-card"
              style={{
                ...S.notesCard,
                animationDelay: `${sections.length * 35}ms`,
              }}
            >
              <div style={S.notesHeader}>
                <div style={S.sectionIcon}>
                  <NoteIcon />
                </div>

                <h2 style={S.sectionTitle}>Extra Notes</h2>
              </div>

              <p style={S.extraNotes}>{review.extraNotes}</p>
            </section>
          )}

          <div className="detail-actions" style={S.footerActions}>
            <button
              style={S.primaryButton}
              onClick={() => navigate(`/test/topic/${topicId}`)}
            >
              <span>Practise This Topic</span>
              <ChevronRight />
            </button>

            <button style={S.secondaryButton} onClick={() => navigate(-1)}>
              Back to Reviews
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ReviewSection({ title, items, index, S }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <section
      className="review-section-card"
      style={{
        ...S.sectionCard,
        animationDelay: `${index * 35}ms`,
      }}
    >
      <div style={S.sectionHeader}>
        <div style={S.sectionIcon}>
          <PinIcon />
        </div>

        <div style={S.sectionTitleWrap}>
          <h2 style={S.sectionTitle}>{title}</h2>
        </div>

        <span style={S.countBadge}>
          {items.length} point{items.length === 1 ? "" : "s"}
        </span>
      </div>

      <ul style={S.list}>
        {items.map((item, itemIndex) => (
          <li key={`${title}-${itemIndex}`} style={S.listItem}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default QuickReviewDetailPage;
