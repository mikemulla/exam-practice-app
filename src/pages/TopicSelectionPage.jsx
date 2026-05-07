import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useNavigate, useParams } from "react-router-dom";

function TopicSelectionPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [subjectQuestions, setSubjectQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Design tokens matching AdminPage
  const S = {
    container: {
      minHeight: "100vh",
      background: "#f8fafc",
      padding: "40px 20px",
    },
    maxWidth: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      marginBottom: "48px",
    },
    headerTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px",
      marginBottom: "16px",
    },
    backBtn: {
      padding: "10px 20px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      backgroundColor: "white",
      color: "#334155",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    headerTitle: {
      fontSize: `clamp(28px, 5vw, 36px)`,
      fontWeight: "600",
      margin: "0 0 8px",
      color: "#0f172a",
      textTransform: "capitalize",
    },
    headerSubtitle: {
      fontSize: "15px",
      color: "#64748b",
      margin: "0",
    },
    headerDescription: {
      fontSize: "14px",
      color: "#475569",
      margin: "12px 0 8px",
      lineHeight: "1.6",
    },
    headerMeta: {
      fontSize: "13px",
      color: "#64748b",
      margin: "0",
    },
    alertCard: {
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "18px 20px",
      marginBottom: "32px",
      textAlign: "center",
    },
    alertTitle: {
      fontSize: "15px",
      fontWeight: "600",
      color: "#0f172a",
      margin: "0 0 8px",
    },
    alertText: {
      fontSize: "14px",
      color: "#64748b",
      margin: "0",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: "20px",
      marginBottom: "32px",
    },
    card: {
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "24px",
      transition: "all 0.2s ease",
      display: "flex",
      flexDirection: "column",
    },
    cardHover: {
      borderColor: "#185fa5",
      boxShadow: "0 4px 12px rgba(24, 95, 165, 0.08)",
    },
    iconBox: {
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      marginBottom: "16px",
    },
    iconBoxBlue: {
      backgroundColor: "#e0f2fe",
    },
    iconBoxGreen: {
      backgroundColor: "#dcfce7",
    },
    cardTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#0f172a",
      margin: "0 0 10px",
    },
    cardDescription: {
      fontSize: "14px",
      color: "#64748b",
      margin: "0 0 16px",
      lineHeight: "1.6",
      flex: 1,
    },
    cardBadge: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#185fa5",
      margin: "0 0 16px",
    },
    button: {
      padding: "11px 16px",
      border: "none",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s",
      width: "100%",
    },
    buttonPrimary: {
      backgroundColor: "#185fa5",
      color: "white",
    },
    buttonSecondary: {
      backgroundColor: "#e2e8f0",
      color: "#0f172a",
    },
    empty: {
      padding: "48px 20px",
      textAlign: "center",
      color: "#94a3b8",
      fontSize: "14px",
    },
    emptyTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#0f172a",
      margin: "0 0 8px",
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
      <div style={S.container}>
        <div style={S.maxWidth}>
          <div style={S.empty}>
            <p style={S.emptyTitle}>Loading topics…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div style={S.container}>
        <div style={S.maxWidth}>
          <div style={S.empty}>
            <p style={S.emptyTitle}>Unable to load subject</p>
            <p>Please try again or go back.</p>
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
          ...(hovered && S.cardHover),
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ ...S.iconBox, ...S.iconBoxGreen }}>🗂️</div>
        <h2 style={S.cardTitle}>{topic.name}</h2>
        <p style={S.cardDescription}>
          Practice only questions from this topic.
        </p>
        <p style={S.cardBadge}>
          {questionCount} question{questionCount === 1 ? "" : "s"}
        </p>
        <button
          onClick={() => navigate(`/test/topic/${topic._id}`)}
          style={{ ...S.button, ...S.buttonPrimary }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0e3d6e";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#185fa5";
          }}
        >
          Start Topic Test
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
          ...(hovered && S.cardHover),
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ ...S.iconBox, ...S.iconBoxBlue }}>📘</div>
        <h2 style={S.cardTitle}>Full Subject Test</h2>
        <p style={S.cardDescription}>
          Practice all questions available under this subject.
        </p>
        <p style={S.cardBadge}>
          {totalQuestionCount} question{totalQuestionCount === 1 ? "" : "s"}
        </p>
        <button
          onClick={() => navigate(`/test/subject/${subject._id}`)}
          style={{ ...S.button, ...S.buttonSecondary }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#cbd5e1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#e2e8f0";
          }}
        >
          Start Full Test
        </button>
      </div>
    );
  };

  return (
    <div style={S.container}>
      <div style={S.maxWidth}>
        {/* Header with back button */}
        <div style={S.header}>
          <div style={S.headerTop}>
            <div style={{ flex: 1 }}>
              <p style={S.headerSubtitle}>Topic selection</p>
              <h1 style={S.headerTitle}>{subject.name}</h1>
              <p style={S.headerDescription}>
                Choose a full subject test or focus on one topic.
              </p>
              <p style={S.headerMeta}>
                {Array.isArray(topics) ? topics.length : 0} topic
                {Array.isArray(topics) && topics.length === 1 ? "" : "s"}{" "}
                available, {totalQuestionCount} total question
                {totalQuestionCount === 1 ? "" : "s"}
              </p>
            </div>
            <button
              onClick={() => navigate("/user")}
              style={S.backBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f1f5f9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* No topics alert */}
        {(!Array.isArray(topics) || topics.length === 0) && (
          <div style={S.alertCard}>
            <p style={S.alertTitle}>No topics added yet</p>
            <p style={S.alertText}>
              You can still take the full subject test below.
            </p>
          </div>
        )}

        {/* Cards Grid */}
        <div style={S.grid}>
          <FullSubjectCard />
          {(Array.isArray(topics) ? topics : []).map((topic) => {
            const topicCount = topicQuestionCounts[topic._id] || 0;
            return (
              <TopicCard
                key={topic._id}
                topic={topic}
                questionCount={topicCount}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TopicSelectionPage;
