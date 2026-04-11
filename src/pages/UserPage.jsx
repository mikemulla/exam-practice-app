import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function SubjectIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M3 4.5h12M3 9h9M3 13.5h6"
        stroke="#185FA5"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Tag({ children }) {
  return (
    <span
      style={{
        padding: "3px 9px",
        borderRadius: "999px",
        background: "#f1f5f9",
        color: "#64748b",
        fontSize: "11px",
        fontWeight: "500",
      }}
    >
      {children}
    </span>
  );
}

function SubjectCard({ subject, topicCount, onViewTopics }) {
  const [hovered, setHovered] = useState(false);
  const duration = `${Math.floor((subject.duration || 300) / 60)} min`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: `0.5px solid ${hovered ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.08)"}`,
        borderRadius: "14px",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.15s",
      }}
    >
      {/* icon */}
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "#E6F1FB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
          flexShrink: 0,
        }}
      >
        <SubjectIcon />
      </div>

      {/* name */}
      <p
        style={{
          fontSize: "15px",
          fontWeight: "500",
          color: "#0f172a",
          marginBottom: "0.625rem",
          textTransform: "capitalize",
        }}
      >
        {subject.name}
      </p>

      {/* tags */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        <Tag>Timed</Tag>
        <Tag>{duration}</Tag>
        <Tag>
          {topicCount} topic{topicCount === 1 ? "" : "s"}
        </Tag>
      </div>

      {/* divider */}
      <div
        style={{
          height: "0.5px",
          background: "rgba(0,0,0,0.07)",
          marginBottom: "1rem",
        }}
      />

      {/* actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "8px",
          marginTop: "auto",
        }}
      >
        <button
          onClick={onViewTopics}
          style={{
            padding: "9px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            background: "#185FA5",
            color: "#E6F1FB",
            border: "none",
          }}
        >
          View topics
        </button>
        <button
          onClick={onViewTopics}
          style={{
            padding: "9px 12px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            background: "transparent",
            color: "#64748b",
            border: "0.5px solid rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowIcon />
        </button>
      </div>
    </div>
  );
}

function UserPage() {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [subjectsRes, topicsRes] = await Promise.all([
          api.get("/api/subjects"),
          api.get("/api/topics"),
        ]);
        setSubjects(subjectsRes.data);
        setTopics(topicsRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const topicCountsBySubject = useMemo(() => {
    const counts = {};
    topics.forEach((topic) => {
      const id = topic.subjectId?._id || topic.subjectId;
      if (id) counts[id] = (counts[id] || 0) + 1;
    });
    return counts;
  }, [topics]);

  const placeholderStyle = {
    background: "#fff",
    border: "0.5px solid rgba(0,0,0,0.08)",
    borderRadius: "14px",
    padding: "2rem",
  };

  return (
    <>
      <Header />
      <div
        style={{
          minHeight: "100vh",
          background: "#f8f9fb",
          padding: "2rem 1.25rem 3rem",
        }}
      >
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          {/* page header */}
          <div style={{ marginBottom: "2rem" }}>
            <p
              style={{
                fontSize: "11px",
                fontWeight: "500",
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.5rem",
              }}
            >
              User dashboard
            </p>
            <h1
              style={{
                fontSize: "clamp(22px, 3.5vw, 32px)",
                fontWeight: "500",
                color: "#0f172a",
                marginBottom: "0.5rem",
              }}
            >
              Choose a subject
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                lineHeight: "1.6",
                maxWidth: "560px",
              }}
            >
              Pick a subject below, choose a topic or take the full test, then
              get instant review with explanations after submission.
            </p>
          </div>

          {/* states */}
          {isLoading ? (
            <div style={placeholderStyle}>
              <p style={{ fontSize: "14px", color: "#64748b" }}>
                Loading subjects...
              </p>
            </div>
          ) : subjects.length === 0 ? (
            <div
              style={{
                ...placeholderStyle,
                textAlign: "center",
                padding: "3rem 2rem",
              }}
            >
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: "500",
                  color: "#0f172a",
                  marginBottom: "6px",
                }}
              >
                No subjects yet
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  lineHeight: "1.6",
                }}
              >
                Ask the admin to create subjects, topics, and questions before
                you start practicing.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
                gap: "14px",
              }}
            >
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject._id}
                  subject={subject}
                  topicCount={topicCountsBySubject[subject._id] || 0}
                  onViewTopics={() =>
                    navigate(`/subject/${subject._id}/topics`)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default UserPage;
