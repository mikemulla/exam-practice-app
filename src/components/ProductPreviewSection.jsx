import { useState } from "react";

function PlayIconSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 4l6 4-6 4V4z" fill="currentColor" />
      <path
        d="M10 4v8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NotebookIconSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path
        d="M4 3.5h8.5A2.5 2.5 0 0 1 15 6v10.5H6.5A2.5 2.5 0 0 0 4 19V3.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 7h5M7 10h5M7 13h3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProductPreviewSection({ colors, isDarkMode, navigate }) {
  const [activeTab, setActiveTab] = useState("test");

  const accent = "#185FA5";
  const accentLight = colors.accentLight;

  const tabBtnStyle = (key) => ({
    padding: "9px 18px",
    borderRadius: "8px",
    border: `1px solid ${activeTab === key ? accent : colors.border}`,
    background: activeTab === key ? accentLight : "transparent",
    color: activeTab === key ? accent : colors.textSecondary,
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    transition: "all 0.2s",
  });

  return (
    <section
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "4rem 1.5rem",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: "700",
            color: accent,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: "0 0 8px",
          }}
        >
          See it in action
        </p>
        <h2
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: colors.text,
            margin: "0 0 10px",
            letterSpacing: "-0.01em",
          }}
        >
          A look inside before you sign up
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: colors.textSecondary,
            maxWidth: "520px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Real screens from the practice test and quick review experience.
        </p>
      </div>

      {/* Tab switcher */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <button
          style={tabBtnStyle("test")}
          onClick={() => setActiveTab("test")}
        >
          <PlayIconSmall /> Practice test
        </button>
        <button
          style={tabBtnStyle("review")}
          onClick={() => setActiveTab("review")}
        >
          <NotebookIconSmall /> Quick review
        </button>
      </div>

      {/* Preview frame */}
      <div
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: "18px",
          padding: "1.5rem",
          boxShadow: isDarkMode
            ? "0 20px 50px rgba(0,0,0,0.35)"
            : "0 20px 50px rgba(15,23,42,0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Fake browser chrome to signal "this is a preview" */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "1.25rem",
          }}
        >
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <span
              key={c}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: c,
                opacity: 0.85,
              }}
            />
          ))}
        </div>

        {activeTab === "test" ? (
          <div style={{ pointerEvents: "none", userSelect: "none" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                color: colors.textSecondary,
                marginBottom: "8px",
              }}
            >
              <span>Question 4 of 12</span>
              <span>12: 45</span>
            </div>
            <div
              style={{
                height: "6px",
                borderRadius: "999px",
                background: colors.surfaceAlt,
                overflow: "hidden",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  width: "33%",
                  height: "100%",
                  background: accent,
                  borderRadius: "999px",
                }}
              />
            </div>

            <div
              style={{
                background: colors.surfaceAlt,
                border: `1px solid ${colors.border}`,
                borderRadius: "14px",
                padding: "1.25rem",
              }}
            >
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.7,
                  color: colors.text,
                  margin: "0 0 1.1rem",
                }}
              >
                Which bone forms the upper part of the hip joint and articulates
                with the femur?
              </p>
              {["Ilium", "Femur", "Tibia"].map((opt, i) => (
                <div
                  key={opt}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "11px 14px",
                    borderRadius: "8px",
                    border: `1px solid ${i === 0 ? accent : colors.border}`,
                    background: i === 0 ? accentLight : "transparent",
                    color: i === 0 ? accent : colors.text,
                    fontSize: "13px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      border: `1.5px solid ${i === 0 ? accent : colors.border}`,
                      background: i === 0 ? accent : "transparent",
                    }}
                  />
                  {opt}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ pointerEvents: "none", userSelect: "none" }}>
            <div
              style={{
                background: colors.surfaceAlt,
                border: `1px solid ${colors.border}`,
                borderRadius: "14px",
                padding: "1.25rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    minWidth: "42px",
                    borderRadius: "11px",
                    background: accentLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: accent,
                  }}
                >
                  <NotebookIconSmall />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: colors.textSecondary,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      margin: "0 0 4px",
                    }}
                  >
                    Quick review
                  </p>
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: colors.text,
                      margin: "0 0 4px",
                    }}
                  >
                    Bones and joints
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: accent,
                      fontWeight: "700",
                      margin: 0,
                    }}
                  >
                    Anatomy · Bones and joints
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "12px",
              }}
            >
              {[
                {
                  title: "Key terms",
                  count: "4 points",
                  body: "Ilium, ischium and pubis fuse to form the acetabulum...",
                },
                {
                  title: "Exam tips",
                  count: "3 points",
                  body: "Watch for trick questions on hinge vs ball-and-socket...",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  style={{
                    background: colors.surfaceAlt,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "14px",
                    padding: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        fontSize: "13px",
                        fontWeight: "700",
                        color: colors.text,
                      }}
                    >
                      {card.title}
                    </span>
                    <span
                      style={{
                        background: accentLight,
                        color: accent,
                        fontSize: "10px",
                        fontWeight: "700",
                        padding: "3px 8px",
                        borderRadius: "999px",
                      }}
                    >
                      {card.count}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: colors.textSecondary,
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overlay CTA so the preview can't be confused with the live app */}
      </div>
    </section>
  );
}

export default ProductPreviewSection;
