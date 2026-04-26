import { useNavigate } from "react-router-dom";

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect width="18" height="18" rx="5" fill="#185FA5" />
      <path
        d="M5 9h8M9 5v8"
        stroke="#E6F1FB"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      style={{ verticalAlign: "-1px", marginLeft: "5px" }}
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const features = [
  {
    label: "Timed tests",
    desc: "Real exam pressure",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="9" r="5.5" stroke="#64748b" strokeWidth="1.2" />
        <path
          d="M8 6.5v2.5l1.5 1"
          stroke="#64748b"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Instant review",
    desc: "Explanations after each test",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M3 8l3 3 7-7"
          stroke="#64748b"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Admin control",
    desc: "Manage subjects & questions",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect
          x="2"
          y="3"
          width="12"
          height="10"
          rx="2"
          stroke="#64748b"
          strokeWidth="1.2"
        />
        <path
          d="M5 7h6M5 10h4"
          stroke="#64748b"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const stats = [
  {
    label: "Questions",
    val: "120+",
    badge: "available",
    badgeBg: "#E6F1FB",
    badgeText: "#0C447C",
  },
  {
    label: "Subjects",
    val: "8",
    badge: "active",
    badgeBg: "#EAF3DE",
    badgeText: "#27500A",
  },
  {
    label: "Timer mode",
    val: "Enabled",
    badge: "on",
    badgeBg: "#EAF3DE",
    badgeText: "#27500A",
  },
  {
    label: "Review",
    val: "Instant",
    badge: "after test",
    badgeBg: "#E6F1FB",
    badgeText: "#0C447C",
  },
];

function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <div style={{ minHeight: "100vh", background: "#f8f9fb" }}>
        <div
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
            padding: "clamp(2rem, 5vw, 3rem) 1.25rem 2rem",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: "2.5rem",
            alignItems: "center",
          }}
        >
          {/* ── Left: copy ── */}
          <div>
            {/* pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "999px",
                background: "#E6F1FB",
                color: "#0C447C",
                fontSize: "12px",
                fontWeight: "500",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#185FA5",
                }}
              />
              Smart exam practice platform
            </div>

            {/* headline */}
            <h1
              style={{
                fontSize: "clamp(28px, 4.5vw, 50px)",
                lineHeight: "1.12",
                fontWeight: "500",
                color: "#0f172a",
                margin: "0 0 1rem",
              }}
            >
              Practice smarter,{" "}
              <span style={{ color: "#185FA5" }}>perform</span> better.
            </h1>

            {/* subhead */}
            <p
              style={{
                fontSize: "15px",
                lineHeight: "1.7",
                color: "#64748b",
                marginBottom: "1.75rem",
                maxWidth: "480px",
              }}
            >
              Create subjects, manage timed questions, and take realistic tests
              in a clean, focused environment built for serious learners.
            </p>

            {/* CTAs */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "2rem",
              }}
            >
              <button
                onClick={() => navigate("/user")}
                style={{
                  padding: "11px 22px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  background: "#185FA5",
                  color: "#E6F1FB",
                  border: "none",
                }}
              >
                Start practicing <ArrowRight />
              </button>
              <button
                onClick={() => navigate("/admin-login")}
                style={{
                  padding: "11px 22px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  background: "#fff",
                  color: "#0f172a",
                  border: "0.5px solid rgba(0,0,0,0.18)",
                }}
              >
                Go to admin
              </button>
            </div>

            {/* feature strip */}
            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
              {features.map(({ label, desc, icon }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "#fff",
                      border: "0.5px solid rgba(0,0,0,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "#0f172a",
                        marginBottom: "2px",
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: dashboard card ── */}
          <div
            style={{
              background: "#fff",
              border: "0.5px solid rgba(0,0,0,0.08)",
              borderRadius: "16px",
              padding: "1.5rem",
            }}
          >
            {/* card header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: "500",
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    margin: "0 0 4px",
                  }}
                >
                  Today's focus
                </p>
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: "500",
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  Exam dashboard
                </h2>
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: "#EAF3DE",
                  color: "#27500A",
                  fontSize: "11px",
                  fontWeight: "500",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#3B6D11",
                  }}
                />
                Ready
              </div>
            </div>

            {/* active session */}
            <div
              style={{
                background: "#f8f9fb",
                borderRadius: "10px",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  margin: "0 0 6px",
                }}
              >
                Active session
              </p>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#0f172a",
                  margin: "0 0 10px",
                }}
              >
                English practice test
              </p>
              <div
                style={{
                  height: "4px",
                  background: "rgba(0,0,0,0.08)",
                  borderRadius: "999px",
                  overflow: "hidden",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "68%",
                    height: "100%",
                    background: "#185FA5",
                    borderRadius: "999px",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                <span>Progress</span>
                <span>68%</span>
              </div>
            </div>

            {/* stats grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "10px",
              }}
            >
              {stats.map(({ label, val, badge, badgeBg, badgeText }) => (
                <div
                  key={label}
                  style={{
                    background: "#f8f9fb",
                    borderRadius: "10px",
                    padding: "0.875rem",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      margin: "0 0 4px",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontSize: val.length > 5 ? "14px" : "18px",
                      fontWeight: "500",
                      color: "#0f172a",
                      margin: "0 0 4px",
                    }}
                  >
                    {val}
                  </p>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: "11px",
                      fontWeight: "500",
                      padding: "2px 7px",
                      borderRadius: "999px",
                      background: badgeBg,
                      color: badgeText,
                    }}
                  >
                    {badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
