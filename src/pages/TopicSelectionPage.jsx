import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useNavigate, useParams } from "react-router-dom";

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

function BookmarkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M5 2h10a1 1 0 0 1 1 1v14l-6-3-6 3V3a1 1 0 0 1 1-1Z"
        stroke="#185FA5"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
      <path
        d="M2 5l5-3 5 3-5 3-5-3Z"
        stroke="#185FA5"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M2 9l5 3 5-3"
        stroke="#185FA5"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TopicSelectionPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [subjectQuestions, setSubjectQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const S = {
    page: {
      minHeight: "100vh",
      background: "#f8f9fb",
      padding: "2.5rem 1.25rem 4rem",
    },
    inner: {
      maxWidth: "1080px",
      margin: "0 auto",
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
      border: "0.5px solid rgba(0,0,0,0.12)",
      borderRadius: "8px",
      background: "#fff",
      color: "#334155",
      fontSize: "13px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    eyebrow: {
      fontSize: "11px",
      fontWeight: "600",
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      marginBottom: "0.75rem",
    },
    heading: {
      fontSize: "clamp(24px, 4vw, 32px)",
      fontWeight: "600",
      color: "#0f172a",
      margin: "0 0 0.625rem",
      letterSpacing: "-0.02em",
    },
    subheading: {
      fontSize: "14px",
      color: "#64748b",
      lineHeight: "1.65",
      maxWidth: "540px",
      margin: "0",
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
      color: "#64748b",
    },
    statValue: {
      fontWeight: "600",
      color: "#185FA5",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
      gap: "16px",
    },
    card: {
      background: "#fff",
      border: "0.5px solid rgba(0,0,0,0.08)",
      borderRadius: "14px",
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      cursor: "default",
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
      background: "#E6F1FB",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "1.25rem",
      flexShrink: 0,
    },
    cardTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#0f172a",
      margin: "0 0 8px",
      letterSpacing: "-0.01em",
    },
    cardDescription: {
      fontSize: "13px",
      color: "#64748b",
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
      background: "#f1f5f9",
      color: "#64748b",
      fontSize: "12px",
      fontWeight: "500",
      marginBottom: "1.25rem",
      width: "fit-content",
    },
    divider: {
      height: "0.5px",
      background: "rgba(0,0,0,0.07)",
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
    },
    buttonPrimary: {
      background: "#185FA5",
      color: "#fff",
    },
    buttonSecondary: {
      background: "#f1f5f9",
      color: "#185FA5",
    },
    emptyState: {
      background: "#fff",
      border: "0.5px solid rgba(0,0,0,0.08)",
      borderRadius: "14px",
      padding: "3.5rem 2rem",
      textAlign: "center",
    },
    emptyIcon: {
      fontSize: "40px",
      marginBottom: "1rem",
    },
    emptyTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#0f172a",
      margin: "0 0 8px",
    },
    emptyBody: {
      fontSize: "13px",
      color: "#64748b",
      lineHeight: "1.65",
      maxWidth: "360px",
      margin: "0 auto",
    },
    loadingGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
      gap: "16px",
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const token = localStorage.getItem("userToken");

        if (!token) {
          navigate("/user-login");
          return;
        }

        const [subjectResponse, topicsResponse, questionsResponse] =
          await Promise.all([
            api.get(`/api/subjects/${subjectId}`, { _tokenType: "user" }),
            api.get(`/api/topics/subject/${subjectId}`, { _tokenType: "user" }),
            api.get(`/api/questions/subject/${subjectId}`, {
              _tokenType: "user",
            }),
          ]);

        const subjectData =
          subjectResponse.data?.subject || subjectResponse.data;
        const topicsData = Array.isArray(topicsResponse.data)
          ? topicsResponse.data
          : topicsResponse.data?.topics || [];
        const questionsData = Array.isArray(questionsResponse.data)
          ? questionsResponse.data
          : questionsResponse.data?.questions || [];

        setSubject(subjectData);
        setTopics(topicsData);
        setSubjectQuestions(questionsData);
      } catch (error) {
        console.error("Error loading topics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [subjectId, navigate]);

  const topicQuestionCounts = useMemo(() => {
    const counts = {};
    const questions = Array.isArray(subjectQuestions) ? subjectQuestions : [];

    questions.forEach((question) => {
      const currentTopicId = question.topicId?._id || question.topicId;
      if (currentTopicId) {
        counts[currentTopicId] = (counts[currentTopicId] || 0) + 1;
      }
    });

    return counts;
  }, [subjectQuestions]);

  const totalQuestionCount = Array.isArray(subjectQuestions)
    ? subjectQuestions.length
    : 0;

  if (isLoading) {
    return (
      <div style={S.page}>
        <style>{`
          @keyframes shimmer {
            0%   { background-position: -400px 0 }
            100% { background-position:  400px 0 }
          }
          .shimmer {
            background     : linear-gradient(90deg, #f1f5f9 25%, #e8edf4 50%, #f1f5f9 75%);
            background-size: 800px 100%;
            animation      : shimmer 1.4s infinite;
            border-radius  : 6px;
          }
          .skeleton-card {
            background    : #fff;
            border        : 0.5px solid rgba(0,0,0,0.08);
            border-radius : 14px;
            padding       : 1.5rem;
            display       : flex;
            flex-direction: column;
          }
        `}</style>
        <div style={S.inner}>
          <div style={S.loadingGrid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div
                  className="shimmer"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 11,
                    marginBottom: "1.25rem",
                  }}
                />
                <div
                  className="shimmer"
                  style={{ height: 16, marginBottom: 8 }}
                />
                <div
                  className="shimmer"
                  style={{ height: 13, width: "70%", marginBottom: 20 }}
                />
                <div
                  className="shimmer"
                  style={{ height: 24, borderRadius: 8 }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div style={S.page}>
        <div style={S.inner}>
          <div style={S.emptyState}>
            <div style={S.emptyIcon}>⚠️</div>
            <p style={S.emptyTitle}>Unable to load subject</p>
            <p style={S.emptyBody}>Please try again or go back.</p>
            <button
              onClick={() => navigate("/user")}
              style={{
                marginTop: "1.5rem",
                padding: "10px 20px",
                background: "#185FA5",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ← Back to subjects
            </button>
          </div>
        </div>
      </div>
    );
  }

  const TopicCard = ({ topic, questionCount }) => {
    const [hovered, setHovered] = useState(false);

    return (
      <div
        style={{
          ...S.card,
          ...(hovered ? S.cardHover : {}),
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={S.iconBubble}>
          <LayersIcon />
        </div>
        <h3 style={S.cardTitle}>{topic.name}</h3>
        <p style={S.cardDescription}>
          Practice questions from this specific topic with detailed review.
        </p>
        <div style={S.cardMeta}>
          <span style={{ fontSize: "11px" }}>📊</span>
          <span>
            {questionCount} question{questionCount === 1 ? "" : "s"}
          </span>
        </div>
        <div style={S.divider} />
        <button
          onClick={() => navigate(`/test/topic/${topic._id}`)}
          style={{
            ...S.button,
            ...S.buttonPrimary,
          }}
          onMouseEnter={(e) => {
            if (hovered) e.currentTarget.style.backgroundColor = "#0e3d6e";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#185FA5";
          }}
        >
          <span>Start topic test</span>
          <ChevronRight />
        </button>
      </div>
    );
  };

  const FullSubjectCard = () => {
    const [hovered, setHovered] = useState(false);

    return (
      <div
        style={{
          ...S.card,
          ...(hovered ? S.cardHover : {}),
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={S.iconBubble}>
          <BookmarkIcon />
        </div>
        <h3 style={S.cardTitle}>Full subject test</h3>
        <p style={S.cardDescription}>
          Challenge yourself with all available questions across every topic in
          this subject.
        </p>
        <div style={S.cardMeta}>
          <span style={{ fontSize: "11px" }}>📚</span>
          <span>
            {totalQuestionCount} question{totalQuestionCount === 1 ? "" : "s"}
          </span>
        </div>
        <div style={S.divider} />
        <button
          onClick={() => navigate(`/test/subject/${subject._id}`)}
          style={{
            ...S.button,
            ...S.buttonSecondary,
          }}
          onMouseEnter={(e) => {
            if (hovered) e.currentTarget.style.backgroundColor = "#e2e8f0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#f1f5f9";
          }}
        >
          <span>Start full test</span>
          <ChevronRight />
        </button>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .topic-page-header { animation: fadeUp 0.4s ease both; }
        .topic-card-enter {
          animation: fadeUp 0.35s ease both;
        }
      `}</style>
      <div style={S.page}>
        <div style={S.inner}>
          {/* Header */}
          <div className="topic-page-header" style={S.header}>
            <button
              onClick={() => navigate("/user")}
              style={S.backBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f1f5f9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#fff";
              }}
            >
              ← Back
            </button>

            <p style={S.eyebrow}>Topic selection</p>
            <h1 style={S.heading}>{subject.name}</h1>
            <p style={S.subheading}>
              Choose between focused topic practice or a comprehensive full
              subject test.
            </p>

            {/* Stats */}
            <div style={S.statsRow}>
              <div style={S.statItem}>
                <span>{Array.isArray(topics) ? topics.length : 0}</span>
                <span>
                  topic{Array.isArray(topics) && topics.length === 1 ? "" : "s"}
                </span>
              </div>
              <div style={S.statItem}>
                <span style={S.statValue}>{totalQuestionCount}</span>
                <span>question{totalQuestionCount === 1 ? "" : "s"}</span>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {!Array.isArray(topics) || topics.length === 0 ? (
            <div style={S.emptyState}>
              <div style={S.emptyIcon}>🎯</div>
              <p style={S.emptyTitle}>No topics available</p>
              <p style={S.emptyBody}>
                This subject doesn't have any topics yet, but you can still take
                the full subject test below.
              </p>
            </div>
          ) : null}

          <div style={S.grid}>
            <FullSubjectCard />
            {(Array.isArray(topics) ? topics : []).map((topic, index) => {
              const topicCount = topicQuestionCounts[topic._id] || 0;
              return (
                <div
                  key={topic._id}
                  className="topic-card-enter"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TopicCard topic={topic} questionCount={topicCount} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default TopicSelectionPage;
