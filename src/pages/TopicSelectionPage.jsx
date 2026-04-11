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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [subjectResponse, topicsResponse, questionsResponse] =
          await Promise.all([
            api.get(`/api/subjects/${subjectId}`),
            api.get(`/api/topics/subject/${subjectId}`),
            api.get(`/api/questions/subject/${subjectId}`),
          ]);

        setSubject(subjectResponse.data);
        setTopics(topicsResponse.data);
        setSubjectQuestions(questionsResponse.data);
      } catch (error) {
        console.error("Error loading topics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [subjectId]);

  const topicQuestionCounts = useMemo(() => {
    const counts = {};

    subjectQuestions.forEach((question) => {
      const currentTopicId = question.topicId?._id || question.topicId;

      if (currentTopicId) {
        counts[currentTopicId] = (counts[currentTopicId] || 0) + 1;
      }
    });

    return counts;
  }, [subjectQuestions]);

  const totalQuestionCount = subjectQuestions.length;

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <p>Loading topics...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <p>Unable to load subject.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fbff 0%, #eef4ff 50%, #f7f9fc 100%)",
        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            User / Topic selection
          </p>

          <h1
            style={{
              margin: "10px 0 8px",
              fontSize: "36px",
              color: "#0f172a",
              textTransform: "capitalize",
            }}
          >
            {subject.name}
          </h1>

          <p
            style={{
              margin: 0,
              color: "#475569",
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            Choose a full subject test or focus on one topic.
          </p>

          <p
            style={{
              color: "#64748b",
              marginTop: "10px",
              fontSize: "14px",
            }}
          >
            {topics.length} topic{topics.length === 1 ? "" : "s"} available,{" "}
            {totalQuestionCount} total question
            {totalQuestionCount === 1 ? "" : "s"}
          </p>
        </div>

        {topics.length === 0 && (
          <div
            style={{
              marginBottom: "20px",
              padding: "20px",
              borderRadius: "12px",
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                color: "#0f172a",
                fontWeight: "600",
              }}
            >
              No topics added yet
            </p>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
              You can still take the full subject test.
            </p>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "18px",
              padding: "22px",
              boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 18px 40px rgba(15,23,42,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow =
                "0 12px 30px rgba(15,23,42,0.06)";
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                backgroundColor: "#e7f0ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                marginBottom: "16px",
              }}
            >
              📘
            </div>

            <h2 style={{ margin: "0 0 10px", color: "#0f172a" }}>
              Full Subject Test
            </h2>

            <p
              style={{
                margin: "0 0 12px",
                color: "#64748b",
                lineHeight: "1.6",
                fontSize: "15px",
              }}
            >
              Practice all questions available under this subject.
            </p>

            <p
              style={{
                margin: "0 0 18px",
                color: "#185FA5",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {totalQuestionCount} question
              {totalQuestionCount === 1 ? "" : "s"}
            </p>

            <button
              onClick={() => navigate(`/test/subject/${subject._id}`)}
              style={{
                padding: "14px 20px",
                border: "none",
                borderRadius: "10px",
                backgroundColor: "#e2e8f0",
                color: "#0f172a",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Start Full Test
            </button>
          </div>

          {topics.map((topic) => {
            const topicCount = topicQuestionCounts[topic._id] || 0;

            return (
              <div
                key={topic._id}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "22px",
                  boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 18px 40px rgba(15,23,42,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow =
                    "0 12px 30px rgba(15,23,42,0.06)";
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    backgroundColor: "#eefbf3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    marginBottom: "16px",
                  }}
                >
                  🗂️
                </div>

                <h2
                  style={{
                    margin: "0 0 10px",
                    color: "#0f172a",
                    textTransform: "capitalize",
                  }}
                >
                  {topic.name}
                </h2>

                <p
                  style={{
                    margin: "0 0 12px",
                    color: "#64748b",
                    lineHeight: "1.6",
                    fontSize: "15px",
                  }}
                >
                  Practice only questions from this topic.
                </p>

                <p
                  style={{
                    margin: "0 0 18px",
                    color: "#185FA5",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  {topicCount} question{topicCount === 1 ? "" : "s"}
                </p>

                <button
                  onClick={() => navigate(`/test/topic/${topic._id}`)}
                  style={{
                    padding: "14px 20px",
                    border: "none",
                    borderRadius: "10px",
                    backgroundColor: "#185FA5",
                    color: "white",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Start Topic Test
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: "24px" }}>
          <button
            onClick={() => navigate("/user")}
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              backgroundColor: "white",
              cursor: "pointer",
            }}
          >
            Back to Subjects
          </button>
        </div>
      </div>
    </div>
  );
}

export default TopicSelectionPage;
