import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const pct = (score, total) =>
  total ? Math.round((Number(score || 0) / Number(total || 0)) * 100) : 0;

const fmtTime = (seconds) => {
  const value = Number(seconds || 0);
  if (!value) return "0s";
  if (value < 60) return `${value}s`;
  return `${Math.floor(value / 60)}m ${value % 60}s`;
};

const fmtDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
};

const safeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const normalizeSummary = (value) => ({
  totalTests: Number(value?.totalTests || 0),
  totalQuestions: Number(value?.totalQuestions || 0),
  totalCorrect: Number(value?.totalCorrect || 0),
  avgScore: Number(value?.avgScore || 0),
  best: Number(value?.best || 0),
  streak: Number(value?.streak || 0),
  bySubject: value?.bySubject || {},
});

const gradeColor = (p) =>
  p >= 80 ? "#16A34A" : p >= 50 ? "#185FA5" : "#DC2626";
const gradeBg = (p) => (p >= 80 ? "#DCFCE7" : p >= 50 ? "#E6F1FB" : "#FEE2E2");
const gradeMid = (p) => (p >= 80 ? "#16A34A" : p >= 50 ? "#185FA5" : "#EF4444");

const getEncouragement = (summary) => {
  const avg = summary?.avgScore || 0;
  const totalTests = summary?.totalTests || 0;

  if (totalTests === 0) {
    return {
      title: "Start your progress journey",
      text: "Take your first test to begin tracking your performance.",
      icon: "🎯",
    };
  }

  if (avg >= 80) {
    return {
      title: "Excellent progress",
      text: "You're performing at a high level. Keep up the momentum.",
      icon: "⭐",
    };
  }

  if (avg >= 50) {
    return {
      title: "Building momentum",
      text: "Good foundation. Focus on weaker topics to improve further.",
      icon: "📈",
    };
  }

  return {
    title: "Keep practicing",
    text: "Review missed questions and try again to raise your score.",
    icon: "💪",
  };
};

function SectionLabel({ children }) {
  return (
    <p
      style={{
        fontSize: "11px",
        fontWeight: "600",
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        margin: "0 0 1rem",
      }}
    >
      {children}
    </p>
  );
}

function StatCard({ value, label }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid rgba(0,0,0,0.08)",
        borderRadius: "12px",
        padding: "1.25rem",
        flex: 1,
        minWidth: "100px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <p
        style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "#0f172a",
          margin: 0,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
      <span
        style={{
          fontSize: "12px",
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          fontWeight: "500",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function SubjectRow({ name, percent }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 0",
        borderBottom: "0.5px solid rgba(0,0,0,0.05)",
      }}
    >
      <span
        style={{
          fontSize: "13px",
          fontWeight: "500",
          color: "#0f172a",
          width: "100px",
          flexShrink: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textTransform: "capitalize",
        }}
      >
        {name}
      </span>
      <div
        style={{
          flex: 1,
          height: "6px",
          background: "#f1f5f9",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            background: gradeMid(percent),
            borderRadius: "999px",
            transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
      <span
        style={{
          fontSize: "13px",
          fontWeight: "600",
          width: "40px",
          textAlign: "right",
          flexShrink: 0,
          color: gradeMid(percent),
        }}
      >
        {percent}%
      </span>
    </div>
  );
}

function HistRow({ title, topic, date, time, percent }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "0.5px solid rgba(0,0,0,0.05)",
      }}
    >
      <div>
        <p
          style={{
            fontSize: "13px",
            fontWeight: "500",
            color: "#0f172a",
            margin: 0,
            textTransform: "capitalize",
          }}
        >
          {title}
        </p>
        {topic && (
          <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0" }}>
            {topic}
          </p>
        )}
        <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0" }}>
          {date} · {time}
        </p>
      </div>
      <span
        style={{
          fontSize: "12px",
          fontWeight: "600",
          padding: "4px 10px",
          borderRadius: "999px",
          background: gradeBg(percent),
          color: gradeColor(percent),
          whiteSpace: "nowrap",
          marginLeft: "12px",
        }}
      >
        {percent}%
      </span>
    </div>
  );
}

function ProgressChart({ results }) {
  const chartData = useMemo(() => {
    return safeArray(results)
      .slice()
      .reverse()
      .slice(-8)
      .map((r, i) => ({ label: i + 1, score: pct(r.score, r.total) }));
  }, [results]);

  if (chartData.length === 0) {
    return (
      <div
        style={{
          background: "#fff",
          border: "0.5px solid rgba(0,0,0,0.08)",
          borderRadius: "14px",
          padding: "2rem",
        }}
      >
        <SectionLabel>Progress trend</SectionLabel>
        <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
          Your score trend will appear here after you complete a test.
        </p>
      </div>
    );
  }

  const W = 560;
  const H = 160;
  const PX = 30;
  const PY = 20;
  const xStep =
    chartData.length === 1 ? 0 : (W - PX * 2) / (chartData.length - 1);
  const pts = chartData.map((d, i) => ({
    ...d,
    x: PX + i * xStep,
    y: H - PY - (d.score / 100) * (H - PY * 2),
  }));
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pts.map((p) => `${p.x}, ${p.y}`).join(" ")} ${pts[pts.length - 1].x},${H} ${pts[0].x},${H}`;

  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid rgba(0,0,0,0.08)",
        borderRadius: "14px",
        padding: "2rem",
      }}
    >
      <SectionLabel>Progress trend</SectionLabel>
      <p
        style={{
          fontSize: "13px",
          color: "#64748b",
          margin: "0 0 1.5rem",
        }}
      >
        Last {chartData.length} test{chartData.length !== 1 ? "s" : ""} by score
        percentage
      </p>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 320 }}>
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = H - PY - (tick / 100) * (H - PY * 2);
            return (
              <g key={tick}>
                <line
                  x1={PX}
                  x2={W - PX}
                  y1={y}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text x="2" y={y + 4} fontSize="10" fill="#94a3b8">
                  {tick}%
                </text>
              </g>
            );
          })}
          <polygon points={area} fill="#185FA5" fillOpacity="0.06" />
          {pts.length > 1 && (
            <polyline
              points={polyline}
              fill="none"
              stroke="#185FA5"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill={gradeColor(p.score)} />
              <text
                x={p.x}
                y={p.y - 8}
                fontSize="10"
                fill="#0f172a"
                textAnchor="middle"
                fontWeight="600"
              >
                {p.score}%
              </text>
              <text
                x={p.x}
                y={H - 4}
                fontSize="10"
                fill="#94a3b8"
                textAnchor="middle"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function EmptyState({ onStart }) {
  return (
    <div style={{ padding: "2.5rem 1.25rem", textAlign: "center" }}>
      <p style={{ fontSize: "32px", margin: "0 0 0.75rem" }}>🎯</p>
      <p
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "#0f172a",
          margin: "0 0 6px",
        }}
      >
        No test results yet
      </p>
      <p
        style={{
          fontSize: "13px",
          color: "#64748b",
          margin: "0 0 1.5rem",
          maxWidth: "360px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        Complete your first test to start tracking your progress and performance
        trends.
      </p>
      <button
        onClick={onStart}
        style={{
          padding: "11px 20px",
          borderRadius: "8px",
          border: "none",
          background: "#185FA5",
          color: "#fff",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#0e3d6e";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#185FA5";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        Start practicing →
      </button>
    </div>
  );
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 768;
  });

  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  return mobile;
}

export default function UserDashboardPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const [summary, setSummary] = useState(() => normalizeSummary(null));
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [summaryRes, historyRes] = await Promise.all([
        api.get("/api/results/me/summary", { _tokenType: "user" }),
        api.get("/api/results/me", { _tokenType: "user" }),
      ]);

      setSummary(normalizeSummary(summaryRes.data));
      setResults(safeArray(historyRes.data));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setSummary(normalizeSummary(null));
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    navigate("/user-login");
  };

  const resultList = safeArray(results);
  const subjectEntries = Object.values(summary?.bySubject || {}).sort(
    (a, b) => Number(b.attempts || 0) - Number(a.attempts || 0),
  );
  const encouragement = getEncouragement(summary);

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
           from  { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dashboard-content { animation: fadeInUp 0.4s ease-out; }
        * { box-sizing: border-box; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#f8f9fb",
          paddingBottom: isMobile ? "100px" : 0,
        }}
      >
        {/* Header */}
        <header
          style={{
            background: "#fff",
            borderBottom: "0.5px solid rgba(0,0,0,0.08)",
            padding: isMobile ? "1rem 1.25rem" : "1.25rem 1.5rem",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {/* Left: User Info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                minWidth: 0,
              }}
            >
              <button
                onClick={() => navigate("/")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  background: "#fff",
                  border: "0.5px solid rgba(0,0,0,0.12)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#334155",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M10 2L4 8l6 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "#E6F1FB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#185FA5",
                    flexShrink: 0,
                  }}
                >
                  {(userInfo.fullName || "S")
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                {!isMobile && (
                  <div>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      {userInfo.fullName || "Student"}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        margin: "2px 0 0",
                      }}
                    >
                      {userInfo.course?.name || "Course"} ·{" "}
                      {userInfo.level ? `${userInfo.level}L` : "Level"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {!isMobile && (
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => setTab("overview")}
                    style={{
                      padding: "7px 14px",
                      borderRadius: "8px",
                      border:
                        tab === "overview"
                          ? "none"
                          : "0.5px solid rgba(0,0,0,0.12)",
                      background: tab === "overview" ? "#185FA5" : "#fff",
                      color: tab === "overview" ? "#fff" : "#334155",
                      fontSize: "13px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setTab("history")}
                    style={{
                      padding: "7px 14px",
                      borderRadius: "8px",
                      border:
                        tab === "history"
                          ? "none"
                          : "0.5px solid rgba(0,0,0,0.12)",
                      background: tab === "history" ? "#185FA5" : "#fff",
                      color: tab === "history" ? "#fff" : "#334155",
                      fontSize: "13px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    History
                  </button>
                </div>
              )}

              <button
                onClick={() => navigate("/user")}
                style={{
                  padding: "9px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#185FA5",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0e3d6e";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#185FA5";
                }}
              >
                + Practice
              </button>

              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  background: "#fff",
                  border: "0.5px solid rgba(0,0,0,0.12)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#334155",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 2H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2m8-4l3-3-3-3m3 3H5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main
          className="dashboard-content"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: isMobile ? "1.25rem 1.25rem 2rem" : "2rem 1.5rem 3rem",
          }}
        >
          {/* Mobile Tab Selector */}
          {isMobile && (
            <div
              style={{ display: "flex", gap: "6px", marginBottom: "1.5rem" }}
            >
              {["overview", "history"].map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background: tab === item ? "#185FA5" : "#fff",
                    color: tab === item ? "#fff" : "#334155",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    textTransform: "capitalize",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {/* Stats Grid */}
          <div style={{ marginBottom: "2rem" }}>
            <SectionLabel>Your stats</SectionLabel>
            {isLoading ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "repeat(2, 1fr)"
                    : "repeat(4, 1fr)",
                  gap: "1rem",
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: "100px",
                      borderRadius: "12px",
                      background: "#e8e8e8",
                      animation: "pulse 2s infinite",
                    }}
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "repeat(2, 1fr)"
                    : "repeat(4, 1fr)",
                  gap: "1rem",
                }}
              >
                <StatCard value={`${summary.avgScore}%`} label="Avg Score" />
                <StatCard value={summary.totalTests} label="Tests Taken" />
                <StatCard value={`${summary.best}%`} label="Best Score" />
                <StatCard value={summary.streak} label="Day Streak" />
              </div>
            )}
          </div>

          {/* Overview Tab */}
          {tab === "overview" && (
            <>
              {/* Performance & Recent Tests */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                {/* Performance by Subject */}
                <div
                  style={{
                    background: "#fff",
                    border: "0.5px solid rgba(0,0,0,0.08)",
                    borderRadius: "14px",
                    padding: "1.5rem",
                  }}
                >
                  <SectionLabel>Performance by subject</SectionLabel>
                  {isLoading ? (
                    <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                      Loading...
                    </p>
                  ) : subjectEntries.length === 0 ? (
                    <EmptyState onStart={() => navigate("/user")} />
                  ) : (
                    subjectEntries.map((subj, i) => {
                      const p = pct(subj.correct, subj.total);
                      return (
                        <SubjectRow
                          key={`${subj.name}-${i}`}
                          name={subj.name || "Unknown"}
                          percent={p}
                        />
                      );
                    })
                  )}
                </div>

                {/* Recent Tests */}
                <div
                  style={{
                    background: "#fff",
                    border: "0.5px solid rgba(0,0,0,0.08)",
                    borderRadius: "14px",
                    padding: "1.5rem",
                  }}
                >
                  <SectionLabel>Recent tests</SectionLabel>
                  {isLoading ? (
                    <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                      Loading...
                    </p>
                  ) : resultList.length === 0 ? (
                    <EmptyState onStart={() => navigate("/user")} />
                  ) : (
                    <>
                      {resultList.slice(0, 5).map((r, i) => (
                        <HistRow
                          key={r._id || i}
                          title={r.subjectId?.name || "Unknown"}
                          topic={r.topicId?.name}
                          date={fmtDate(r.createdAt)}
                          time={fmtTime(r.timeTaken)}
                          percent={pct(r.score, r.total)}
                        />
                      ))}
                      <button
                        onClick={() => setTab("history")}
                        style={{
                          marginTop: "12px",
                          padding: 0,
                          border: "none",
                          background: "none",
                          fontSize: "13px",
                          color: "#185FA5",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        View all history →
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Chart */}
              <div style={{ marginBottom: "1.5rem" }}>
                <ProgressChart results={resultList} />
              </div>

              {/* CTA Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr 1fr",
                  gap: "1rem",
                }}
              >
                {/* Main CTA */}
                <div
                  onClick={() => navigate("/user")}
                  style={{
                    background:
                      "linear-gradient(135deg, #185FA5 0%, #0e3d6e 100%)",
                    borderRadius: "14px",
                    padding: "1.5rem",
                    cursor: "pointer",
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "140px",
                    transition: "all 0.2s",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(24, 95, 165, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        margin: "0 0 0.5rem",
                      }}
                    >
                      Start practicing
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.8)",
                        margin: 0,
                      }}
                    >
                      {summary.totalTests === 0
                        ? "Take your first test"
                        : `${summary.totalTests} test${summary.totalTests !== 1 ? "s" : ""} completed`}
                    </p>
                  </div>
                  <span style={{ fontSize: "20px" }}>→</span>
                </div>

                {/* Request Subject CTA */}
                <div
                  onClick={() => navigate("/request-subject")}
                  style={{
                    background: "#fff",
                    border: "0.5px solid rgba(0,0,0,0.08)",
                    borderRadius: "14px",
                    padding: "1.5rem",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "140px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8f9fb";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "#E6F1FB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#185FA5",
                        marginBottom: "0.75rem",
                      }}
                    >
                      +
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Request subject
                    </p>
                  </div>
                </div>

                {/* Insight Card */}
                <div
                  style={{
                    background: "#f8f9fb",
                    border: "0.5px solid rgba(0,0,0,0.08)",
                    borderRadius: "14px",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "140px",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "28px", margin: "0 0 0.5rem" }}>
                      {encouragement.icon}
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#0f172a",
                        margin: "0 0 6px",
                      }}
                    >
                      {encouragement.title}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        margin: 0,
                        lineHeight: "1.5",
                      }}
                    >
                      {encouragement.text}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* History Tab */}
          {tab === "history" && (
            <div
              style={{
                background: "#fff",
                border: "0.5px solid rgba(0,0,0,0.08)",
                borderRadius: "14px",
                padding: "1.5rem",
              }}
            >
              <SectionLabel>All test history</SectionLabel>

              {isLoading ? (
                <p style={{ fontSize: "13px", color: "#94a3b8" }}>Loading...</p>
              ) : resultList.length === 0 ? (
                <EmptyState onStart={() => navigate("/user")} />
              ) : (
                resultList.map((r, i) => {
                  const p = pct(r.score, r.total);
                  const subject = r.subjectId?.name || "Unknown";
                  const topic = r.topicId?.name;

                  return (
                    <HistRow
                      key={r._id || i}
                      title={subject}
                      topic={topic}
                      date={fmtDate(r.createdAt)}
                      time={fmtTime(r.timeTaken)}
                      percent={p}
                    />
                  );
                })
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#fff",
            borderTop: "0.5px solid rgba(0,0,0,0.08)",
            padding: "12px 0 18px",
            zIndex: 200,
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <button
            onClick={() => setTab("overview")}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 12px",
              color: tab === "overview" ? "#185FA5" : "#94a3b8",
              fontSize: "11px",
              fontWeight: "500",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="3"
                width="8"
                height="8"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="13"
                y="3"
                width="8"
                height="8"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="3"
                y="13"
                width="8"
                height="8"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="13"
                y="13"
                width="8"
                height="8"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            Overview
          </button>

          <button
            onClick={() => setTab("history")}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 12px",
              color: tab === "history" ? "#185FA5" : "#94a3b8",
              fontSize: "11px",
              fontWeight: "500",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            History
          </button>

          <button
            onClick={() => navigate("/user")}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 12px",
              color: "#94a3b8",
              fontSize: "11px",
              fontWeight: "500",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 3l14 9-14 9V3z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            Practice
          </button>
        </nav>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
