import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

/* ─── tiny icons ─── */
function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M4 4.5C4 3.12 5.12 2 6.5 2H16v13H6.5A2.5 2.5 0 0 0 4 17.5v-13Z"
        stroke="#185FA5"
        strokeWidth="1.4"
      />
      <path
        d="M4 15.5A2.5 2.5 0 0 1 6.5 13H16"
        stroke="#185FA5"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="#94a3b8" strokeWidth="1.2" />
      <path
        d="M7 4.5V7l1.5 1.5"
        stroke="#94a3b8"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <path
        d="M2 5l5-3 5 3-5 3-5-3Z"
        stroke="#94a3b8"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M2 9l5 3 5-3"
        stroke="#94a3b8"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── skeleton loader ─── */
function SkeletonCard() {
  return (
    <div style={S.card}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -400px 0 }
          100% { background-position: 400px 0 }
        }
        .shimmer {
          background: linear-gradient(90deg, #f1f5f9 25%, #e8edf4 50%, #f1f5f9 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 6px;
        }
      `}</style>
      <div
        className="shimmer"
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          marginBottom: "1rem",
        }}
      />
      <div
        className="shimmer"
        style={{ height: 14, width: "60%", marginBottom: 10 }}
      />
      <div
        className="shimmer"
        style={{ height: 11, width: "40%", marginBottom: 20 }}
      />
      <div className="shimmer" style={{ height: 0.5, marginBottom: 20 }} />
      <div className="shimmer" style={{ height: 36, borderRadius: 8 }} />
    </div>
  );
}

/* ─── subject card ─── */
function SubjectCard({ subject, topicCount, index, onViewTopics }) {
  const [hovered, setHovered] = useState(false);
  const minutes = Math.floor((subject.duration || 300) / 60);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...S.card,
        border: `0.5px solid ${hovered ? "rgba(24,95,165,0.25)" : "rgba(0,0,0,0.08)"}`,
        boxShadow: hovered
          ? "0 8px 32px rgba(24,95,165,0.10), 0 2px 8px rgba(0,0,0,0.06)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        animationDelay: `${index * 60}ms`,
      }}
      className="subject-card-enter"
    >
      {/* icon bubble */}
      <div style={S.iconBubble}>
        <BookIcon />
      </div>

      {/* subject name */}
      <p style={S.subjectName}>{subject.name}</p>

      {/* meta row */}
      <div style={S.metaRow}>
        <span style={S.metaPill}>
          <ClockIcon />
          {minutes} min
        </span>
        <span style={S.metaPill}>
          <LayersIcon />
          {topicCount} topic{topicCount === 1 ? "" : "s"}
        </span>
        <span
          style={{ ...S.metaPill, background: "#E6F1FB", color: "#185FA5" }}
        >
          Timed
        </span>
      </div>

      {/* divider */}
      <div style={S.divider} />

      {/* cta */}
      <button
        onClick={onViewTopics}
        style={{
          ...S.cta,
          background: hovered ? "#1453901" : "#185FA5",
        }}
      >
        <span>View topics</span>
        <span style={S.ctaArrow}>
          <ChevronRight />
        </span>
      </button>
    </div>
  );
}

/* ─── page ─── */
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

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .subject-card-enter {
          animation: fadeUp 0.35s ease both;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .header-fade {
          animation: fadeUp 0.4s ease both;
        }
      `}</style>

      <div style={S.page}>
        <div style={S.inner}>
          {/* ── page header ── */}
          <div className="header-fade" style={S.pageHeader}>
            <button onClick={() => navigate(-1)} style={S.backBtn}>
              ← Back
            </button>
            <div style={S.eyebrow}>User dashboard</div>
            <div style={S.headingRow}>
              <h1 style={S.heading}>Choose a subject</h1>
              <button
                onClick={() => navigate("/request-subject")}
                style={S.requestBtn}
              >
                + Request subject
              </button>
            </div>
            <p style={S.subheading}>
              Pick a subject below, choose a topic or take the full test, then
              get instant review with explanations after submission.
            </p>
          </div>

          {/* ── grid ── */}
          {isLoading ? (
            <div style={S.grid}>
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : subjects.length === 0 ? (
            <div style={S.emptyState}>
              <div style={S.emptyIcon}>📚</div>
              <p style={S.emptyTitle}>No subjects yet</p>
              <p style={S.emptyBody}>
                Ask the admin to create subjects, topics, and questions before
                you start practicing.
              </p>
            </div>
          ) : (
            <div style={S.grid}>
              {subjects.map((subject, i) => (
                <SubjectCard
                  key={subject._id}
                  subject={subject}
                  topicCount={topicCountsBySubject[subject._id] || 0}
                  index={i}
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

/* ─── styles ─── */
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

  /* header */
  pageHeader: {
    marginBottom: "2rem",
  },
  eyebrow: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "0.75rem",
  },
  headingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "0.625rem",
  },
  heading: {
    fontSize: "clamp(22px, 3.5vw, 30px)",
    fontWeight: "600",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  subheading: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.65",
    maxWidth: "520px",
    margin: 0,
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
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  requestBtn: {
    padding: "9px 16px",
    border: "0.5px solid rgba(0,0,0,0.15)",
    borderRadius: "8px",
    background: "#fff",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },

  /* grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
    gap: "14px",
  },

  /* card */
  card: {
    background: "#fff",
    borderRadius: "14px",
    padding: "1.375rem",
    display: "flex",
    flexDirection: "column",
    cursor: "default",
  },
  iconBubble: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#E6F1FB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1rem",
    flexShrink: 0,
  },
  subjectName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "0.625rem",
    textTransform: "capitalize",
    letterSpacing: "-0.01em",
  },

  /* meta */
  metaRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginBottom: "1.125rem",
  },
  metaPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "3px 8px",
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "500",
  },

  divider: {
    height: "0.5px",
    background: "rgba(0,0,0,0.07)",
    marginBottom: "1.125rem",
  },

  /* cta */
  cta: {
    marginTop: "auto",
    width: "100%",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    background: "#185FA5",
    color: "#fff",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "background 0.15s",
    letterSpacing: "-0.01em",
  },
  ctaArrow: {
    display: "flex",
    alignItems: "center",
    opacity: 0.8,
  },

  /* empty */
  emptyState: {
    background: "#fff",
    border: "0.5px solid rgba(0,0,0,0.08)",
    borderRadius: "14px",
    padding: "3.5rem 2rem",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: "32px",
    marginBottom: "1rem",
  },
  emptyTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "6px",
  },
  emptyBody: {
    fontSize: "13px",
    color: "#64748b",
    lineHeight: "1.65",
    maxWidth: "360px",
    margin: "0 auto",
  },
};
