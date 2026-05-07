import { useNavigate } from "react-router-dom";

function ArrowRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ verticalAlign: "-2px", marginLeft: "6px" }}
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

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M2 8l4 4 8-8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M8 5v3.5l2.5 1.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 2l2 4.5h4.5L10.5 10l2 4.5L8 12.5l-4.5 2 2-4.5L1.5 6.5H6L8 2Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const features = [
  {
    label: "Timed tests",
    desc: "Real exam pressure",
    icon: <ClockIcon />,
  },
  {
    label: "Instant review",
    desc: "Detailed explanations",
    icon: <CheckIcon />,
  },
  {
    label: "Smart tracking",
    desc: "Progress at a glance",
    icon: <SparkIcon />,
  },
];

const statsData = [
  {
    label: "Questions",
    val: "120+",
    accent: "#185FA5",
  },
  {
    label: "Subjects",
    val: "8",
    accent: "#16A34A",
  },
];

function HomePage() {
  const navigate = useNavigate();
  const userToken = localStorage.getItem("userToken");

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity  : 0;
            transform: translateY(20px);
          }
          to {
            opacity  : 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
           from  { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInRight {
          from {
            opacity  : 0;
            transform: translateX(40px);
          }
          to {
            opacity  : 1;
            transform: translateX(0);
          }
        }

        .hero-section {
          animation: fadeInUp 0.6s ease-out;
        }

        .feature-item {
          animation: fadeInUp 0.5s ease-out both;
        }

        .feature-item: nth-child(1) { animation-delay: 0.2s; }
        .feature-item: nth-child(2) { animation-delay: 0.3s; }
        .feature-item: nth-child(3) { animation-delay: 0.4s; }

        .dashboard-card {
          animation: slideInRight 0.7s ease-out;
        }

        .stat-item {
          animation: fadeInUp 0.5s ease-out both;
        }

        .stat-item: nth-child(1) { animation-delay: 0.5s; }
        .stat-item: nth-child(2) { animation-delay: 0.6s; }
        .stat-item: nth-child(3) { animation-delay: 0.7s; }
        .stat-item: nth-child(4) { animation-delay: 0.8s; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#f8f9fb",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle background accent */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(24, 95, 165, 0.04) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "clamp(3rem, 8vw, 5rem) clamp(1.25rem, 5vw, 3rem)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Main Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
              gap: "clamp(2rem, 5vw, 4rem)",
              alignItems: "center",
            }}
          >
            {/* ─────────────────────── Left Column: Copy ─────────────────────── */}
            <div className="hero-section">
              {/* Status Pill */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "999px",
                  background: "#E6F1FB",
                  color: "#0C447C",
                  fontSize: "13px",
                  fontWeight: "500",
                  marginBottom: "1.5rem",
                  border: "0.5px solid rgba(24, 95, 165, 0.1)",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#185FA5",
                    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  }}
                />
                Smart exam prep platform
              </div>

              {/* Main Headline */}
              <h1
                style={{
                  fontSize: "clamp(32px, 6vw, 56px)",
                  lineHeight: "1.15",
                  fontWeight: "600",
                  color: "#0f172a",
                  margin: "0 0 1.25rem",
                  letterSpacing: "-0.03em",
                }}
              >
                Master exams with{" "}
                <span style={{ color: "#185FA5", fontWeight: "700" }}>
                  focused practice
                </span>
              </h1>

              {/* Subheading */}
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: "1.75",
                  color: "#64748b",
                  marginBottom: "2rem",
                  maxWidth: "520px",
                }}
              >
                Create customized subjects, take timed tests with real exam
                pressure, and get instant detailed review. Built for serious
                learners.
              </p>

              {/* CTA Button */}
              <button
                onClick={() =>
                  navigate(userToken ? "/user-dashboard" : "/user-login")
                }
                style={{
                  padding: "13px 28px",
                  borderRadius: "9px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  background: "#185FA5",
                  color: "#fff",
                  border: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 12px rgba(24, 95, 165, 0.2)",
                  marginBottom: "3rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0e3d6e";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(24, 95, 165, 0.3)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#185FA5";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(24, 95, 165, 0.2)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Start practicing now
                <ArrowRight />
              </button>

              {/* Features List */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {features.map(({ label, desc, icon }, idx) => (
                  <div
                    key={idx}
                    className="feature-item"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: "#E6F1FB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#185FA5",
                        flexShrink: 0,
                      }}
                    >
                      {icon}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#0f172a",
                          margin: "0 0 2px",
                        }}
                      >
                        {label}
                      </p>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#64748b",
                          margin: 0,
                        }}
                      >
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ────────────────────── Right Column: Dashboard Card ────────────────────── */}
            <div className="dashboard-card">
              <div
                style={{
                  background: "linear-gradient(135deg, #fff 0%, #f8fafc 100%)",
                  border: "0.5px solid rgba(0,0,0,0.08)",
                  borderRadius: "18px",
                  padding: "2rem",
                  backdropFilter: "blur(10px)",
                }}
              >
                {/* Card Header */}
                <div style={{ marginBottom: "2rem" }}>
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      margin: "0 0 6px",
                    }}
                  >
                    Overview
                  </p>
                  <h2
                    style={{
                      fontSize: "22px",
                      fontWeight: "600",
                      color: "#0f172a",
                      margin: "0 0 8px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Exam Dashboard
                  </h2>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "5px 12px",
                      borderRadius: "999px",
                      background: "#DCFCE7",
                      color: "#166534",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#16A34A",
                      }}
                    />
                    Ready to use
                  </div>
                </div>

                {/* Progress Section */}
                <div
                  style={{
                    background: "#f8f9fb",
                    borderRadius: "12px",
                    padding: "1.25rem",
                    marginBottom: "1.75rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Active session
                    </p>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#185FA5",
                      }}
                    >
                      68%
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      margin: "0 0 12px",
                    }}
                  >
                    English practice test
                  </p>
                  <div
                    style={{
                      height: "6px",
                      background: "rgba(0,0,0,0.06)",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: "68%",
                        height: "100%",
                        background:
                          "linear-gradient(90deg, #185FA5 0%, #0e3d6e 100%)",
                        borderRadius: "999px",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "12px",
                  }}
                >
                  {statsData.map(({ label, val, accent }, idx) => (
                    <div
                      key={idx}
                      className="stat-item"
                      style={{
                        background: "#f8f9fb",
                        borderRadius: "12px",
                        padding: "1.125rem",
                        border: `0.5px solid rgba(0,0,0,0.04)`,
                      }}
                    >
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          fontWeight: "500",
                          margin: "0 0 6px",
                          textTransform: "capitalize",
                        }}
                      >
                        {label}
                      </p>
                      <p
                        style={{
                          fontSize: "24px",
                          fontWeight: "700",
                          color: accent,
                          margin: 0,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {val}
                      </p>
                    </div>
                  ))}
                  <div
                    className="stat-item"
                    style={{
                      background: "#f8f9fb",
                      borderRadius: "12px",
                      padding: "1.125rem",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        fontWeight: "500",
                        margin: "0 0 6px",
                      }}
                    >
                      Timer mode
                    </p>
                    <p
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#185FA5",
                        margin: 0,
                      }}
                    >
                      Active
                    </p>
                  </div>
                  <div
                    className="stat-item"
                    style={{
                      background: "#f8f9fb",
                      borderRadius: "12px",
                      padding: "1.125rem",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        fontWeight: "500",
                        margin: "0 0 6px",
                      }}
                    >
                      Review
                    </p>
                    <p
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#16A34A",
                        margin: 0,
                      }}
                    >
                      Instant
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}

export default HomePage;
