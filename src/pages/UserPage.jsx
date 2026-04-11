import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

function UserPage() {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [subjectsResponse, topicsResponse] = await Promise.all([
          api.get("/api/subjects"),
          api.get("/api/topics"),
        ]);

        setSubjects(subjectsResponse.data);
        setTopics(topicsResponse.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const topicCountsBySubject = useMemo(() => {
    const counts = {};

    topics.forEach((topic) => {
      const currentSubjectId = topic.subjectId?._id || topic.subjectId;

      if (currentSubjectId) {
        counts[currentSubjectId] = (counts[currentSubjectId] || 0) + 1;
      }
    });

    return counts;
  }, [topics]);

  const formatDuration = (seconds) => {
    const mins = Math.floor((seconds || 300) / 60);
    return `${mins} min`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fbff 0%, #eef4ff 50%, #f7f9fc 100%)",
        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            User dashboard
          </p>
          <h1
            style={{
              margin: "10px 0 8px",
              fontSize: "40px",
              color: "#0f172a",
            }}
          >
            Choose a subject to begin
          </h1>
          <p
            style={{
              margin: 0,
              color: "#475569",
              fontSize: "17px",
              lineHeight: "1.6",
              maxWidth: "700px",
            }}
          >
            Pick a subject, choose a topic or take the full test, then get
            instant review with explanations after submission.
          </p>
        </div>

        {isLoading ? (
          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
            }}
          >
            <p style={{ margin: 0, color: "#64748b" }}>Loading subjects...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#0f172a" }}>
              No subjects available
            </h2>
            <p style={{ marginBottom: 0, color: "#64748b", lineHeight: "1.6" }}>
              Ask the admin to create subjects, topics, and questions before
              users begin practicing.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "20px",
            }}
          >
            {subjects.map((subject) => {
              const topicCount = topicCountsBySubject[subject._id] || 0;

              return (
                <div
                  key={subject._id}
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
                    📚
                  </div>

                  <h2
                    style={{
                      margin: "0 0 10px",
                      color: "#0f172a",
                      textTransform: "capitalize",
                    }}
                  >
                    {subject.name}
                  </h2>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginBottom: "18px",
                    }}
                  >
                    <span
                      style={{
                        padding: "7px 12px",
                        borderRadius: "999px",
                        backgroundColor: "#f8fafc",
                        color: "#475569",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      Timed test
                    </span>

                    <span
                      style={{
                        padding: "7px 12px",
                        borderRadius: "999px",
                        backgroundColor: "#f8fafc",
                        color: "#475569",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      {formatDuration(subject.duration)}
                    </span>

                    <span
                      style={{
                        padding: "7px 12px",
                        borderRadius: "999px",
                        backgroundColor: "#f8fafc",
                        color: "#475569",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      {topicCount} topic{topicCount === 1 ? "" : "s"}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/subject/${subject._id}/topics`)}
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
                    View Topics
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserPage;
