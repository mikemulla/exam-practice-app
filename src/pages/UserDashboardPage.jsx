import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const pct = (score, total) => (total ? Math.round((Number(score || 0) / Number(total || 0)) * 100) : 0);

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

const gradeColor = (p) => (p >= 80 ? "#3B6D11" : p >= 50 ? "#185FA5" : "#A32D2D");
const gradeBg = (p) => (p >= 80 ? "#EAF3DE" : p >= 50 ? "#E6F1FB" : "#FCEBEB");
const gradeMid = (p) => (p >= 80 ? "#3B6D11" : p >= 50 ? "#378ADD" : "#E24B4A");

const getEncouragement = (summary) => {
  const avg = summary?.avgScore || 0;
  const totalTests = summary?.totalTests || 0;

  if (totalTests === 0) {
    return {
      title: "Start your progress record",
      text: "Take your first test so your dashboard can begin showing performance trends.",
    };
  }

  if (avg >= 80) {
    return {
      title: "Strong performance",
      text: "Your average score is high. Keep practising to maintain consistency.",
    };
  }

  if (avg >= 50) {
    return {
      title: "Good foundation",
      text: "You are building momentum. Focus on weaker topics to raise your average.",
    };
  }

  return {
    title: "Keep building",
    text: "Your dashboard is showing where to improve. Review missed questions and try again.",
  };
};

const t = {
  navy: "#042C53",
  blue: "#185FA5",
  blueMid: "#378ADD",
  blueLight: "#E6F1FB",
  bluePale: "#B5D4F4",
  green: "#3B6D11",
  greenLight: "#EAF3DE",
  red: "#A32D2D",
  redLight: "#FCEBEB",
  text: "#0f172a",
  textSec: "#64748b",
  textTert: "#94a3b8",
  border: "#e2e8f0",
  borderFaint: "#f1f5f9",
  bg: "#f4f6f9",
  surface: "#ffffff",
  surface2: "#f8fafc",
};

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: t.textTert,
        fontWeight: 600,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function Delta({ children, color, bg }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 500,
        padding: "2px 7px",
        borderRadius: 999,
        background: bg,
        color,
      }}
    >
      {children}
    </span>
  );
}

function StatCard({ value, label, color, delta, deltaBg, deltaColor }) {
  return (
    <div
      style={{
        background: t.surface,
        border: `0.5px solid ${t.border}`,
        borderRadius: 12,
        padding: "16px 14px",
        flex: 1,
        minWidth: 100,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          fontSize: 26,
          fontWeight: 600,
          lineHeight: 1,
          color: color || t.text,
          fontFamily: "'DM Serif Display', serif",
          fontStyle: "italic",
        }}
      >
        {value}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 10,
            color: t.textTert,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight: 500,
          }}
        >
          {label}
        </span>
        {delta && (
          <Delta color={deltaColor} bg={deltaBg}>
            {delta}
          </Delta>
        )}
      </div>
    </div>
  );
}

function SubjectRow({ name, percent }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "7px 0",
        borderBottom: `0.5px solid ${t.borderFaint}`,
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: t.text,
          width: 90,
          flexShrink: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textTransform: "capitalize",
        }}
      >
        {name}
      </span>
      <div style={{ flex: 1, height: 5, background: t.borderFaint, borderRadius: 999, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            background: gradeMid(percent),
            borderRadius: 999,
            transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          width: 32,
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
        padding: "9px 0",
        borderBottom: `0.5px solid ${t.borderFaint}`,
      }}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: t.text, textTransform: "capitalize" }}>{title}</div>
        {topic && <div style={{ fontSize: 11, color: t.textTert, marginTop: 2 }}>{topic}</div>}
        <div style={{ fontSize: 11, color: t.textTert, marginTop: 2 }}>
          {date} · {time}
        </div>
      </div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          padding: "3px 9px",
          borderRadius: 999,
          background: gradeBg(percent),
          color: gradeColor(percent),
          whiteSpace: "nowrap",
          marginLeft: 12,
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
      <div style={{ background: t.surface, border: `0.5px solid ${t.border}`, borderRadius: 12, padding: 18 }}>
        <SectionLabel>Progress trend</SectionLabel>
        <div style={{ fontSize: 12, color: t.textSec }}>Your score trend will appear here after you complete a test.</div>
      </div>
    );
  }

  const W = 560;
  const H = 160;
  const PX = 30;
  const PY = 20;
  const xStep = chartData.length === 1 ? 0 : (W - PX * 2) / (chartData.length - 1);
  const pts = chartData.map((d, i) => ({
    ...d,
    x: PX + i * xStep,
    y: H - PY - (d.score / 100) * (H - PY * 2),
  }));
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pts.map((p) => `${p.x},${p.y}`).join(" ")} ${pts[pts.length - 1].x},${H} ${pts[0].x},${H}`;

  return (
    <div style={{ background: t.surface, border: `0.5px solid ${t.border}`, borderRadius: 12, padding: 18 }}>
      <SectionLabel>Progress trend</SectionLabel>
      <div style={{ fontSize: 12, color: t.textSec, marginBottom: 14 }}>
        Last {chartData.length} test{chartData.length !== 1 ? "s" : ""} by score percentage
      </div>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 320 }}>
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = H - PY - (tick / 100) * (H - PY * 2);
            return (
              <g key={tick}>
                <line x1={PX} x2={W - PX} y1={y} y2={y} stroke={t.borderFaint} strokeWidth="1" />
                <text x="2" y={y + 4} fontSize="9" fill={t.textTert}>
                  {tick}%
                </text>
              </g>
            );
          })}
          <polygon points={area} fill="#185FA5" fillOpacity="0.06" />
          {pts.length > 1 && (
            <polyline points={polyline} fill="none" stroke="#185FA5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill={gradeColor(p.score)} />
              <text x={p.x} y={p.y - 8} fontSize="9" fill={t.text} textAnchor="middle">
                {p.score}%
              </text>
              <text x={p.x} y={H - 4} fontSize="9" fill={t.textTert} textAnchor="middle">
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
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>🎯</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: t.text, marginBottom: 6 }}>No test results yet</div>
      <p style={{ fontSize: 12, color: t.textSec, marginBottom: 16 }}>Complete your first test to start tracking your progress.</p>
      <button
        onClick={onStart}
        style={{
          padding: "9px 20px",
          borderRadius: 8,
          border: "none",
          background: t.blue,
          color: "#fff",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Start practising →
      </button>
    </div>
  );
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 720;
  });

  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 720);
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
  const subjectEntries = Object.values(summary?.bySubject || {}).sort((a, b) => Number(b.attempts || 0) - Number(a.attempts || 0));
  const encouragement = getEncouragement(summary);

  const s = {
    page: {
      fontFamily: "'Sora', sans-serif",
      background: t.bg,
      minHeight: "100vh",
      paddingBottom: isMobile ? 88 : 0,
    },
    topbar: {
      background: t.surface,
      borderBottom: `0.5px solid ${t.border}`,
      padding: isMobile ? "12px 16px" : "14px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "sticky",
      top: 0,
      zIndex: 100,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: "50%",
      background: t.blueLight,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      fontWeight: 600,
      color: t.blue,
      flexShrink: 0,
    },
    navPill: (active) => ({
      fontSize: 12,
      fontWeight: 500,
      padding: "6px 14px",
      borderRadius: 999,
      border: `0.5px solid ${active ? t.navy : t.border}`,
      background: active ? t.navy : t.surface,
      color: active ? t.bluePale : t.textSec,
      cursor: "pointer",
      whiteSpace: "nowrap",
    }),
    ctaPill: {
      fontSize: 12,
      fontWeight: 500,
      padding: "6px 14px",
      borderRadius: 999,
      border: `0.5px solid ${t.blue}`,
      background: t.blue,
      color: "#fff",
      cursor: "pointer",
    },
    main: {
      maxWidth: 960,
      margin: "0 auto",
      padding: isMobile ? "16px 14px 24px" : "24px 20px 40px",
      display: "flex",
      flexDirection: "column",
      gap: 20,
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
      gap: 10,
    },
    contentGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: 14,
    },
    card: {
      background: t.surface,
      border: `0.5px solid ${t.border}`,
      borderRadius: 12,
      padding: 18,
    },
    ctaRow: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr",
      gap: 12,
    },
    ctaMain: {
      background: t.navy,
      borderRadius: 12,
      padding: 20,
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
    },
    ctaSec: {
      background: t.surface,
      border: `0.5px solid ${t.border}`,
      borderRadius: 12,
      padding: 18,
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
    },
    insightCard: {
      background: t.surface2,
      border: `0.5px solid ${t.border}`,
      borderRadius: 12,
      padding: 18,
      display: "flex",
      flexDirection: "column",
    },
    histTableHead: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr auto auto" : "1fr auto auto auto",
      gap: 12,
      padding: "8px 0",
      borderBottom: `0.5px solid ${t.border}`,
      marginBottom: 4,
    },
    histTableRow: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr auto auto" : "1fr auto auto auto",
      gap: 12,
      padding: "10px 0",
      alignItems: "center",
      borderBottom: `0.5px solid ${t.borderFaint}`,
    },
  };

  const skeletonCards = [1, 2, 3, 4].map((i) => (
    <div key={i} style={{ flex: 1, minWidth: 100, height: 72, borderRadius: 12, background: "#e8e8e4" }} />
  ));

  return (
    <div style={s.page}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      <header style={s.topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: `0.5px solid ${t.border}`,
              borderRadius: 20,
              padding: "6px 10px",
              fontSize: 11,
              color: t.textSec,
              cursor: "pointer",
              fontFamily: "'Sora', sans-serif",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {!isMobile && "Home"}
          </button>

          <div style={s.avatar}>
            {(userInfo.fullName || "S")
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{userInfo.fullName || "Student"}</div>
            <div style={{ fontSize: 11, color: t.textSec, marginTop: 1 }}>
              {userInfo.course?.name || "Course"} · {userInfo.level ? `${userInfo.level}L` : "Level"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!isMobile && (
            <>
              <button style={s.navPill(tab === "overview")} onClick={() => setTab("overview")}>
                Overview
              </button>
              <button style={s.navPill(tab === "history")} onClick={() => setTab("history")}>
                History
              </button>
            </>
          )}
          <button style={s.ctaPill} onClick={() => navigate("/user")}>
            + Practice
          </button>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: `0.5px solid ${t.border}`,
              borderRadius: 20,
              padding: "7px 12px",
              fontSize: 12,
              fontFamily: "'Sora', sans-serif",
              color: t.textSec,
              cursor: "pointer",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {!isMobile && "Sign out"}
          </button>
        </div>
      </header>

      <main style={s.main}>
        {isMobile && (
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
            {["overview", "history"].map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: `0.5px solid ${tab === item ? t.navy : t.border}`,
                  background: tab === item ? t.navy : t.surface,
                  color: tab === item ? t.bluePale : t.textSec,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
        )}

        <div>
          <SectionLabel>Your stats</SectionLabel>
          {isLoading ? (
            <div style={{ display: "flex", gap: 10 }}>{skeletonCards}</div>
          ) : (
            <div style={s.statsGrid}>
              <StatCard value={`${summary.avgScore}%`} label="Avg score" color={gradeColor(summary.avgScore)} />
              <StatCard value={summary.totalTests} label="Tests taken" />
              <StatCard value={`${summary.best}%`} label="Best score" color={t.blue} />
              <StatCard value={summary.streak} label="Day streak" delta={summary.streak > 0 ? "Active" : "Start"} deltaBg={t.greenLight} deltaColor={t.green} />
            </div>
          )}
        </div>

        {tab === "overview" && (
          <>
            <div style={s.contentGrid}>
              <div style={s.card}>
                <SectionLabel>Performance by subject</SectionLabel>
                {isLoading ? (
                  <div style={{ color: t.textTert, fontSize: 13 }}>Loading...</div>
                ) : subjectEntries.length === 0 ? (
                  <EmptyState onStart={() => navigate("/user")} />
                ) : (
                  subjectEntries.map((subj, i) => {
                    const p = pct(subj.correct, subj.total);
                    return <SubjectRow key={`${subj.name}-${i}`} name={subj.name || "Unknown"} percent={p} />;
                  })
                )}
              </div>

              <div style={s.card}>
                <SectionLabel>Recent tests</SectionLabel>
                {isLoading ? (
                  <div style={{ color: t.textTert, fontSize: 13 }}>Loading...</div>
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
                    <span
                      onClick={() => setTab("history")}
                      style={{ fontSize: 12, color: t.blue, cursor: "pointer", marginTop: 10, display: "inline-block", fontWeight: 500 }}
                    >
                      View all history →
                    </span>
                  </>
                )}
              </div>
            </div>

            <ProgressChart results={resultList} />

            <div style={s.ctaRow}>
              <div
                style={s.ctaMain}
                onClick={() => navigate("/user")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#0C447C";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = t.navy;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ position: "absolute", top: 18, right: 18, fontSize: 16, color: "rgba(255,255,255,0.3)" }}>→</div>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 3l14 9-14 9V3z" fill="white" />
                  </svg>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 4 }}>Start practising</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                  {summary.totalTests === 0 ? "You have not taken any tests yet. Start now." : `${summary.totalTests} test${summary.totalTests !== 1 ? "s" : ""} completed. Keep going.`}
                </div>
                <span style={{ fontSize: 12, color: t.bluePale, marginTop: 12, display: "block", fontWeight: 500 }}>Pick a subject →</span>
              </div>

              <div
                style={s.ctaSec}
                onClick={() => navigate("/request-subject")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = t.surface2;
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = t.surface;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ width: 30, height: 30, borderRadius: 8, background: t.blueLight, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke={t.blue} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 4 }}>Request subject</div>
                <div style={{ fontSize: 11, color: t.textSec, lineHeight: 1.4 }}>Add a new topic to the library.</div>
              </div>

              <div style={s.insightCard}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.blue, marginBottom: 10 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 5 }}>{encouragement.title}</div>
                <div style={{ fontSize: 12, color: t.textSec, lineHeight: 1.5 }}>{encouragement.text}</div>
              </div>
            </div>
          </>
        )}

        {tab === "history" && (
          <div style={s.card}>
            <SectionLabel>All test history</SectionLabel>

            <div style={s.histTableHead}>
              {(isMobile ? ["Subject", "Date", "Score"] : ["Subject / Topic", "Date", "Time", "Score"]).map((h) => (
                <span key={h} style={{ fontSize: 10, fontWeight: 600, color: t.textTert, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {h}
                </span>
              ))}
            </div>

            {isLoading ? (
              <div style={{ padding: "32px 0", color: t.textTert, fontSize: 13 }}>Loading...</div>
            ) : resultList.length === 0 ? (
              <EmptyState onStart={() => navigate("/user")} />
            ) : (
              resultList.map((r, i) => {
                const p = pct(r.score, r.total);
                const subject = r.subjectId?.name || "Unknown";
                const topic = r.topicId?.name;

                return (
                  <div key={r._id || i} style={s.histTableRow}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: t.text, textTransform: "capitalize" }}>{subject}</div>
                      {topic && <div style={{ fontSize: 11, color: t.textTert, marginTop: 1 }}>{topic}</div>}
                    </div>
                    <span style={{ fontSize: 11, color: t.textTert }}>{fmtDate(r.createdAt)}</span>
                    {!isMobile && <span style={{ fontSize: 11, color: t.textSec }}>{fmtTime(r.timeTaken)}</span>}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 9px",
                        borderRadius: 999,
                        background: gradeBg(p),
                        color: gradeColor(p),
                        textAlign: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p}%
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {isMobile && (
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: t.surface,
            borderTop: `0.5px solid ${t.border}`,
            padding: "10px 0 18px",
            zIndex: 200,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {[
              {
                label: "Overview",
                key: "overview",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="13" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ),
              },
              {
                label: "History",
                key: "history",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6h16M4 12h10M4 18h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                label: "Practice",
                key: "practice",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 3l14 9-14 9V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                ),
                action: () => navigate("/user"),
              },
            ].map(({ label, key, icon, action }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  onClick={action || (() => setTab(key))}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 12px",
                    color: active ? t.blue : t.textTert,
                  }}
                >
                  {icon}
                  <span style={{ fontSize: 10, fontWeight: 500 }}>{label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
