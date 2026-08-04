import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";
import PublicFooter from "../components/PublicFooter";
import ProductPreviewSection from "../components/ProductPreviewSection";
import PublicNavbar from "../components/PublicNavbar";

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

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M13 8a5 5 0 0 1-5 5 5 5 0 1 1 5-5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
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
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [showAlert, setShowAlert] = useState(true);

  const colors = {
    bg: isDarkMode ? "#0f172a" : "#f8f9fb",
    surface: isDarkMode ? "#1e293b" : "#ffffff",
    surfaceAlt: isDarkMode ? "#334155" : "#f8fafc",
    text: isDarkMode ? "#f1f5f9" : "#0f172a",
    textSecondary: isDarkMode ? "#cbd5e1" : "#64748b",
    textTertiary: isDarkMode ? "#94a3b8" : "#94a3b8",
    border: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    accentLight: isDarkMode ? "rgba(24, 95, 165, 0.15)" : "#E6F1FB",
  };

  return (
    <>
      <PublicNavbar />
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
              from     { opacity: 0; }
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

        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
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

        .dark-mode-alert {
          animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .alert-close-btn:hover {
          transform: rotate(90deg);
        }
        .blob-field {
          position      : absolute;
          inset         : 0;
          z-index       : 0;
          overflow      : hidden;
          pointer-events: none;
          isolation     : isolate;
        }

        .blob-field::before {
          content   : "";
          position  : absolute;
          inset     : -18% -12%;
          background: ${
            isDarkMode
              ? "radial-gradient(circle at 78% 20%, rgba(56, 189, 248, 0.22), transparent 32%), radial-gradient(circle at 8% 40%, rgba(45, 212, 191, 0.14), transparent 28%), radial-gradient(circle at 84% 88%, rgba(59, 130, 246, 0.18), transparent 34%)"
              : "radial-gradient(circle at 78% 20%, rgba(45, 169, 255, 0.24), transparent 32%), radial-gradient(circle at 8% 40%, rgba(45, 212, 191, 0.16), transparent 28%), radial-gradient(circle at 84% 88%, rgba(24, 95, 165, 0.15), transparent 34%)"
          };
          filter   : blur(48px);
          opacity  : ${isDarkMode ? 0.58 : 0.82};
          transform: translateZ(0);
        }

        .ambient-blob {
          position   : absolute;
          display    : block;
          transform  : translateZ(0);
          will-change: transform;
          box-shadow : var(--blob-edge);
          transition : opacity 0.3s ease, filter 0.3s ease, box-shadow 0.3s ease;
        }

        .ambient-blob::before,
        .ambient-blob::after {
          content      : "";
          position     : absolute;
          inset        : 0;
          border-radius: inherit;
        }

        .ambient-blob::before {
          background: inherit;
          filter    : blur(var(--blob-blur));
          opacity   : var(--blob-glow);
          transform : scale(1.08);
        }

        .ambient-blob::after {
          background: ${
            isDarkMode
              ? "radial-gradient(circle at 28% 24%, rgba(241,245,249,0.2), transparent 22%), radial-gradient(circle at 50% 50%, transparent 54%, rgba(125,211,252,0.2) 70%, transparent 78%), radial-gradient(circle at 72% 70%, rgba(125,211,252,0.12), transparent 32%)"
              : "radial-gradient(circle at 28% 24%, rgba(255,255,255,0.72), transparent 24%), radial-gradient(circle at 72% 70%, rgba(255,255,255,0.12), transparent 32%)"
          };
          opacity       : ${isDarkMode ? 0.42 : 0.34};
          mix-blend-mode: screen;
        }

        .ambient-blob--hero {
          top          : clamp(-180px, -10vw, -92px);
          right        : clamp(-210px, -12vw, -100px);
          width        : clamp(420px, 43vw, 680px);
          height       : clamp(390px, 40vw, 640px);
          border-radius: 54% 46% 62% 38% / 42% 54% 46% 58%;
          background   : ${
            isDarkMode
              ? "radial-gradient(circle at 28% 24%, rgba(125, 211, 252, 0.5), transparent 26%), radial-gradient(circle at 68% 34%, rgba(59, 130, 246, 0.52), transparent 38%), radial-gradient(circle at 58% 78%, rgba(45, 212, 191, 0.3), transparent 46%), linear-gradient(135deg, rgba(30, 64, 175, 0.5), rgba(14, 165, 233, 0.26))"
              : "radial-gradient(circle at 30% 28%, rgba(173, 238, 255, 0.95), transparent 24%), radial-gradient(circle at 66% 34%, rgba(62, 139, 255, 0.72), transparent 34%), radial-gradient(circle at 56% 78%, rgba(45, 212, 191, 0.62), transparent 44%), linear-gradient(135deg, rgba(24, 95, 165, 0.5), rgba(96, 165, 250, 0.34))"
          };
          --blob-blur: 28px;
          --blob-glow: ${isDarkMode ? 0.44 : 0.48};
          --blob-edge: ${
            isDarkMode
              ? "0 0 0 1px rgba(125, 211, 252, 0.22), 0 0 46px rgba(56, 189, 248, 0.22), inset 0 0 42px rgba(125, 211, 252, 0.18)"
              : "0 60px 110px -25px rgba(15, 90, 166, 0.22)"
          };
          opacity    : ${isDarkMode ? 0.58 : 0.7};
          animation  : blobDriftHero 22s ease-in-out infinite;
        }

        .ambient-blob--copy {
          top          : clamp(118px, 18vw, 230px);
          left         : clamp(-170px, -10vw, -92px);
          width        : clamp(260px, 27vw, 430px);
          height       : clamp(260px, 26vw, 420px);
          border-radius: 44% 56% 48% 52% / 58% 42% 58% 42%;
          background   : ${
            isDarkMode
              ? "radial-gradient(circle at 34% 30%, rgba(153, 246, 228, 0.36), transparent 28%), radial-gradient(circle at 62% 70%, rgba(20, 184, 166, 0.34), transparent 48%), linear-gradient(140deg, rgba(16, 185, 129, 0.18), rgba(56, 189, 248, 0.22))"
              : "radial-gradient(circle at 36% 32%, rgba(178, 255, 235, 0.8), transparent 26%), radial-gradient(circle at 62% 70%, rgba(20, 184, 166, 0.52), transparent 46%), linear-gradient(140deg, rgba(34, 197, 94, 0.26), rgba(56, 189, 248, 0.34))"
          };
          --blob-blur: 34px;
          --blob-glow: ${isDarkMode ? 0.3 : 0.36};
          --blob-edge: ${
            isDarkMode
              ? "0 0 0 1px rgba(45, 212, 191, 0.18), 0 0 38px rgba(45, 212, 191, 0.16), inset 0 0 34px rgba(153, 246, 228, 0.12)"
              : "0 40px 84px -26px rgba(20, 184, 166, 0.2)"
          };
          opacity    : ${isDarkMode ? 0.36 : 0.45};
          animation  : blobDriftCopy 26s ease-in-out infinite;
        }

        .ambient-blob--preview {
          right        : clamp(-190px, -8vw, -80px);
          bottom       : clamp(-230px, -14vw, -120px);
          width        : clamp(360px, 36vw, 560px);
          height       : clamp(330px, 34vw, 520px);
          border-radius: 61% 39% 47% 53% / 46% 58% 42% 54%;
          background   : ${
            isDarkMode
              ? "radial-gradient(circle at 30% 24%, rgba(147, 197, 253, 0.32), transparent 26%), radial-gradient(circle at 68% 64%, rgba(59, 130, 246, 0.38), transparent 44%), linear-gradient(140deg, rgba(14, 165, 233, 0.24), rgba(129, 140, 248, 0.2))"
              : "radial-gradient(circle at 30% 24%, rgba(219, 234, 254, 0.95), transparent 24%), radial-gradient(circle at 68% 64%, rgba(59, 130, 246, 0.56), transparent 42%), linear-gradient(140deg, rgba(14, 165, 233, 0.34), rgba(99, 102, 241, 0.2))"
          };
          --blob-blur: 38px;
          --blob-glow: ${isDarkMode ? 0.34 : 0.38};
          --blob-edge: ${
            isDarkMode
              ? "0 0 0 1px rgba(96, 165, 250, 0.16), 0 0 50px rgba(59, 130, 246, 0.2), inset 0 0 44px rgba(129, 140, 248, 0.12)"
              : "0 46px 96px -28px rgba(59, 130, 246, 0.18)"
          };
          opacity    : ${isDarkMode ? 0.42 : 0.5};
          animation  : blobDriftPreview 24s ease-in-out infinite;
        }

        @media (max-width: 820px) {
          .blob-field::before {
            inset  : -12% -28%;
            filter : blur(54px);
            opacity: ${isDarkMode ? 0.48 : 0.68};
          }

          .ambient-blob--hero {
            top        : -150px;
            right      : -190px;
            width      : min(118vw, 470px);
            height     : min(104vw, 420px);
            --blob-blur: 24px;
            opacity    : ${isDarkMode ? 0.5 : 0.62};
          }

          .ambient-blob--copy {
            top        : 150px;
            left       : -210px;
            width      : min(92vw, 360px);
            height     : min(82vw, 330px);
            --blob-blur: 32px;
            opacity    : ${isDarkMode ? 0.3 : 0.34};
          }

          .ambient-blob--preview {
            right      : -210px;
            bottom     : -190px;
            width      : min(115vw, 430px);
            height     : min(105vw, 400px);
            --blob-blur: 34px;
            opacity    : ${isDarkMode ? 0.36 : 0.42};
          }
        }

        @media (max-width: 480px) {
          .blob-field::before {
            opacity: ${isDarkMode ? 0.4 : 0.5};
          }

          .ambient-blob--hero {
            top    : -128px;
            right  : -210px;
            width  : 430px;
            height : 380px;
            opacity: ${isDarkMode ? 0.44 : 0.54};
          }

          .ambient-blob--copy {
            top    : 178px;
            left   : -250px;
            width  : 350px;
            height : 330px;
            opacity: ${isDarkMode ? 0.26 : 0.3};
          }

          .ambient-blob--preview {
            right  : -230px;
            bottom : -170px;
            width  : 420px;
            height : 390px;
            opacity: ${isDarkMode ? 0.32 : 0.38};
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ambient-blob {
            animation: none !important;
          }
        }
      `}</style>

      {/* Dark Mode Feature Alert */}
      {showAlert && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            backdropFilter: "blur(4px)",
            animation: "fadeIn 0.3s ease-out",
          }}
          onClick={() => setShowAlert(false)}
        >
          <div
            className="dark-mode-alert"
            style={{
              background: colors.surface,
              borderRadius: "16px",
              padding: "2rem",
              maxWidth: "420px",
              width: "calc(100% - 2rem)",
              border: `1px solid ${colors.border}`,
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowAlert(false)}
              className="alert-close-btn"
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                border: "none",
                background: colors.surfaceAlt,
                color: colors.text,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                padding: 0,
              }}
              title="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 3l10 10M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Icon */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #185FA5 0%, #0e3d6e 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            >
              <MoonIcon />
            </div>

            {/* Content */}
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: colors.text,
                margin: "0 0 0.5rem",
                letterSpacing: "-0.01em",
              }}
            >
              ✨ Dark Mode is Here!
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: colors.textSecondary,
                margin: "0 0 1.5rem",
                lineHeight: "1.6",
              }}
            >
              A new feature is ready for you! Click the moon icon in the bottom
              right corner to toggle dark mode and enjoy a more comfortable
              viewing experience.
            </p>

            {/* Feature highlights */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "1.5rem",
              }}
            >
              {[
                "🌙 Smooth light/dark transitions",
                "👁️ Easier on the eyes at night",
                "💾 Your preference is saved",
              ].map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "13px",
                    color: colors.textSecondary,
                  }}
                >
                  <div
                    style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: "#185FA5",
                      flexShrink: 0,
                    }}
                  />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  toggleDarkMode();
                  setShowAlert(false);
                }}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#185FA5",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#0e3d6e";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(24, 95, 165, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#185FA5";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Try Dark Mode
              </button>
              <button
                onClick={() => setShowAlert(false)}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  borderRadius: "8px",
                  border: `1px solid ${colors.border}`,
                  background: "transparent",
                  color: colors.text,
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.surfaceAlt;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          minHeight: "100vh",
          background: colors.bg,
          position: "relative",
          overflow: "hidden",
          transition: "background 0.3s ease",
        }}
      >
        {/* Dark Mode Toggle */}
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 900,
          }}
        >
          <button
            onClick={toggleDarkMode}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              border: `1px solid ${colors.border}`,
              background: colors.surface,
              color: colors.text,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.16)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.surfaceAlt;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.surface;
            }}
          >
            {isDarkMode ? <MoonIcon /> : <SparkIcon />}
          </button>
        </div>

        {/* Responsive ambient background blobs */}
        <div className="blob-field" aria-hidden="true">
          <span className="ambient-blob ambient-blob--hero" />
          <span className="ambient-blob ambient-blob--copy" />
          <span className="ambient-blob ambient-blob--preview" />
        </div>

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            paddingTop: "clamp(1.25rem, 3vw, 2rem)",
            paddingBottom: "clamp(3rem, 8vw, 5rem)",
            paddingLeft: "clamp(1.25rem, 5vw, 3rem)",
            paddingRight: "clamp(1.25rem, 5vw, 3rem)",
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
                  background: colors.accentLight,
                  color: "#185FA5",
                  fontSize: "13px",
                  fontWeight: "500",
                  marginBottom: "1.5rem",
                  border: `1px solid ${colors.border}`,
                  transition: "all 0.3s ease",
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
                  color: colors.text,
                  margin: "0 0 1.25rem",
                  letterSpacing: "-0.03em",
                  transition: "color 0.3s ease",
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
                  color: colors.textSecondary,
                  marginBottom: "2rem",
                  maxWidth: "520px",
                  transition: "color 0.3s ease",
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
                      transition: "color 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: colors.accentLight,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#185FA5",
                        flexShrink: 0,
                        transition: "background 0.3s ease",
                      }}
                    >
                      {icon}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: colors.text,
                          margin: "0 0 2px",
                          transition: "color 0.3s ease",
                        }}
                      >
                        {label}
                      </p>
                      <p
                        style={{
                          fontSize: "13px",
                          color: colors.textSecondary,
                          margin: 0,
                          transition: "color 0.3s ease",
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
              <ProductPreviewSection
                colors={colors}
                isDarkMode={isDarkMode}
                navigate={navigate}
              />
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />

      {/* Add pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes blobDriftHero {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          50% { transform: translate3d(22px, -18px, 0) rotate(4deg) scale(1.04); }
        }

        @keyframes blobDriftCopy {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          50% { transform: translate3d(-18px, 18px, 0) rotate(-5deg) scale(1.03); }
        }

        @keyframes blobDriftPreview {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          50% { transform: translate3d(18px, 20px, 0) rotate(3deg) scale(1.035); }
        }
      `}</style>
    </>
  );
}

export default HomePage;
