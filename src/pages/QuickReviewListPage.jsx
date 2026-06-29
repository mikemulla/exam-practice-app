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

function QuickReviewListPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [subjectRes, reviewsRes, topicsRes] = await Promise.all([
          api.get(`/api/subjects/${subjectId}`, { _tokenType: "user" }),
          api.get(`/api/quick-reviews/subject/${subjectId}`, {
            _tokenType: "user",
          }),
          api.get(`/api/topics/subject/${subjectId}`, { _tokenType: "user" }),
        ]);

        setSubject(subjectRes.data?.subject || subjectRes.data);

        const reviewList =
          reviewsRes.data?.reviews || reviewsRes.data?.data || [];

        const topicList = Array.isArray(topicsRes.data)
          ? topicsRes.data
          : topicsRes.data?.topics || topicsRes.data?.data || [];

        setReviews(reviewList);
        setTopics(topicList);
      } catch (error) {
        console.error("Quick review list error:", error);
        alert(error.message || "Unable to load quick reviews.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [subjectId]);

  const reviewByTopicId = useMemo(() => {
    const map = new Map();

    reviews.forEach((review) => {
      const currentTopicId = review.topicId?._id || review.topicId;

      if (currentTopicId) {
        map.set(String(currentTopicId), review);
      }
    });

    return map;
  }, [reviews]);

  const filteredTopics = useMemo(() => {
    const search = query.trim().toLowerCase();

    return topics.filter((topic) => {
      const review = reviewByTopicId.get(String(topic._id));

      if (!search) return true;

      return (
        String(topic.name || "")
          .toLowerCase()
          .includes(search) ||
        String(review?.summary || "")
          .toLowerCase()
          .includes(search)
      );
    });
  }, [topics, reviewByTopicId, query]);

  const availableReviewCount = reviews.length;
  const topicCount = Array.isArray(topics) ? topics.length : 0;

  const S = {
    page: {
      minHeight: "100vh",
      background: "var(--bg-primary)",
      padding: "2.5rem 1.25rem 4rem",
    },
    container: {
      maxWidth: "1120px",
      margin: "0 auto",
      width: "100%",
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
    eyebrow: {
      fontSize: "11px",
      fontWeight: "700",
      color: "var(--text-secondary)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      marginBottom: "0.75rem",
    },
    heading: {
      fontSize: "clamp(24px, 5vw, 34px)",
      fontWeight: "700",
      color: "var(--text-primary)",
      margin: "0 0 0.5rem",
      letterSpacing: "-0.02em",
      lineHeight: 1.15,
    },
    subheading: {
      fontSize: "14px",
      color: "var(--text-secondary)",
      lineHeight: "1.6",
      margin: "0 0 1.5rem",
      maxWidth: "680px",
    },
    statsRow: {
      display: "flex",
      gap: "24px",
      flexWrap: "wrap",
      marginBottom: "1.5rem",
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
    searchWrapper: {
      position: "relative",
      marginBottom: "2rem",
    },
    searchIcon: {
      position: "absolute",
      left: "14px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "var(--text-secondary)",
      pointerEvents: "none",
      display: "flex",
    },
    search: {
      width: "100%",
      boxSizing: "border-box",
      border: "1px solid var(--border-color)",
      borderRadius: "10px",
      padding: "11px 14px 11px 40px",
      background: "var(--bg-secondary)",
      color: "var(--text-primary)",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.2s",
      outline: "none",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "16px",
      alignItems: "stretch",
    },
    card: {
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
      cursor: "pointer",
      transition: "all 0.2s ease",
      color: "var(--text-primary)",
      overflow: "hidden",
    },
    cardHover: {
      borderColor: "rgba(24, 95, 165, 0.42)",
      boxShadow: "0 8px 22px rgba(24, 95, 165, 0.10)",
      transform: "translateY(-1px)",
    },
    cardDisabled: {
      opacity: 0.78,
      cursor: "not-allowed",
    },
    cardHeader: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      minWidth: 0,
    },
    iconBubble: {
      width: "44px",
      height: "44px",
      minWidth: "44px",
      borderRadius: "10px",
      background: "var(--surface-alt)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    titleArea: {
      flex: 1,
      minWidth: 0,
    },
    cardTitle: {
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
    cardBody: {
      marginTop: "14px",
      flex: 1,
      minHeight: "42px",
    },
    cardDescription: {
      fontSize: "13px",
      color: "var(--text-secondary)",
      margin: 0,
      lineHeight: "1.5",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
    },
    cardFooter: {
      marginTop: "18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
    },
    statusBadge: {
      borderRadius: "999px",
      padding: "5px 10px",
      fontSize: "11px",
      fontWeight: "800",
      whiteSpace: "nowrap",
      flexShrink: 0,
    },
    arrowButton: {
      width: "36px",
      height: "36px",
      padding: 0,
      border: "none",
      borderRadius: "9px",
      cursor: "pointer",
      transition: "all 0.15s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      background: "var(--button-primary)",
      color: "#fff",
    },
    emptyState: {
      background: "var(--bg-secondary)",
      border: "1px solid var(--border-color)",
      borderRadius: "12px",
      padding: "3rem 2rem",
      textAlign: "center",
      marginTop: "2rem",
    },
    emptyIcon: {
      fontSize: "40px",
      marginBottom: "1rem",
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

        .review-page-header {
          animation: fadeUp 0.4s ease both;
        }

        .review-card-enter {
          animation: fadeUp 0.35s ease both;
        }

        .search-input:focus {
          border-color: rgba(24, 95, 165, 0.4) !important;
          background: var(--bg-secondary) !important;
          box-shadow: 0 0 0 3px rgba(24, 95, 165, 0.08);
        }

        @media (max-width: 768px) {
          .review-page {
            padding: 1.75rem 1rem 4rem !important;
          }

          .review-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .review-page {
            padding: 1.5rem 0.75rem 4rem !important;
          }

          .search-input {
            font-size: 14px !important;
          }

          .review-card {
            min-height: 155px !important;
            padding: 14px !important;
          }
        }
      `}</style>

      <div className="review-page" style={S.page}>
        <div style={S.container}>
          <div className="review-page-header" style={S.header}>
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
              ← Back
            </button>

            <p style={S.eyebrow}>Quick Review</p>

            <h1 style={S.heading}>
              {subject?.name || "Subject"} Review Topics
            </h1>

            <p style={S.subheading}>
              Select a topic to revise key information and study notes before
              taking a practice test.
            </p>

            <div style={S.statsRow}>
              <div style={S.statItem}>
                <span style={S.statValue}>{topicCount}</span>
                <span>available topic{topicCount === 1 ? "" : "s"}</span>
              </div>

              <div style={S.statItem}>
                <span style={S.statValue}>{availableReviewCount}</span>
                <span>review{availableReviewCount === 1 ? "" : "s"}</span>
              </div>
            </div>

            <div style={S.searchWrapper}>
              <div style={S.searchIcon}>
                <SearchIcon />
              </div>

              <input
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by topic or review summary..."
                style={S.search}
              />
            </div>
          </div>

          {filteredTopics.length === 0 && topics.length === 0 ? (
            <div style={S.emptyState}>
              <div style={S.emptyIcon}>📚</div>
              <p style={S.emptyTitle}>No topics available</p>
              <p style={S.emptyBody}>
                This subject does not have any topics yet. Check back later or
                explore other subjects.
              </p>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div style={S.emptyState}>
              <div style={S.emptyIcon}>🔍</div>
              <p style={S.emptyTitle}>No results found</p>
              <p style={S.emptyBody}>
                We could not find any topics matching "{query}". Try adjusting
                your search terms.
              </p>
            </div>
          ) : null}

          {filteredTopics.length > 0 && (
            <div className="review-grid" style={S.grid}>
              {filteredTopics.map((topic, index) => {
                const review = reviewByTopicId.get(String(topic._id));
                const hasReview = Boolean(review);

                return (
                  <div
                    key={topic._id}
                    className="review-card-enter"
                    style={{
                      animationDelay: `${index * 35}ms`,
                      height: "100%",
                    }}
                  >
                    <ReviewCard
                      topic={topic}
                      review={review}
                      hasReview={hasReview}
                      onNavigate={() => {
                        if (hasReview) {
                          navigate(`/quick-review/topic/${topic._id}`);
                        }
                      }}
                      S={S}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ReviewCard({ topic, review, hasReview, onNavigate, S }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      className="review-card"
      onClick={onNavigate}
      disabled={!hasReview}
      style={{
        ...S.card,
        ...(hovered && hasReview ? S.cardHover : {}),
        ...(hasReview ? {} : S.cardDisabled),
      }}
      onMouseEnter={() => hasReview && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={S.cardHeader}>
        <div style={S.iconBubble}>
          <ReviewIcon />
        </div>

        <div style={S.titleArea}>
          <h3 style={S.cardTitle}>{topic.name}</h3>
        </div>
      </div>

      <div style={S.cardBody}>
        <p style={S.cardDescription}>
          {hasReview
            ? review?.summary || "Quick review is available for this topic."
            : "Review content has not been added yet. Check back soon!"}
        </p>
      </div>

      <div style={S.cardFooter}>
        <span
          style={{
            ...S.statusBadge,
            background: hasReview ? "#dcfce7" : "#f1f5f9",
            color: hasReview ? "#166534" : "#64748b",
          }}
        >
          {hasReview ? "Available" : "Coming soon"}
        </span>

        {hasReview && (
          <span style={S.arrowButton}>
            <ChevronRight />
          </span>
        )}
      </div>
    </button>
  );
}

export default QuickReviewListPage;
