import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #f8fbff 0%, #eef4ff 50%, #f7f9fc 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1100px",
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "24px",
            alignItems: "center",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-block",
                padding: "8px 14px",
                borderRadius: "999px",
                backgroundColor: "#e7f0ff",
                color: "#185FA5",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "18px",
              }}
            >
              Smart exam practice platform
            </span>

            <h1
              style={{
                fontSize: "52px",
                lineHeight: "1.1",
                margin: "0 0 16px",
                color: "#0f172a",
              }}
            >
              Practice smarter,
              <br />
              perform better.
            </h1>

            <p
              style={{
                fontSize: "18px",
                lineHeight: "1.7",
                color: "#475569",
                maxWidth: "620px",
                marginBottom: "28px",
              }}
            >
              Create subjects, manage timed questions, track progress, and take
              realistic tests in a clean and modern exam environment.
            </p>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/user")}
                style={{
                  padding: "14px 24px",
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor: "#185FA5",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 10px 24px rgba(24,95,165,0.18)",
                }}
              >
                Start Practicing
              </button>

              <button
                onClick={() => navigate("/admin")}
                style={{
                  padding: "14px 24px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "white",
                  color: "#0f172a",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Go to Admin
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: "28px",
                flexWrap: "wrap",
                marginTop: "34px",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "24px", color: "#0f172a" }}>
                  Timed Tests
                </h3>
                <p style={{ marginTop: "6px", color: "#64748b" }}>
                  Real exam pressure
                </p>
              </div>

              <div>
                <h3 style={{ margin: 0, fontSize: "24px", color: "#0f172a" }}>
                  Instant Review
                </h3>
                <p style={{ marginTop: "6px", color: "#64748b" }}>
                  Explanations after each test
                </p>
              </div>

              <div>
                <h3 style={{ margin: 0, fontSize: "24px", color: "#0f172a" }}>
                  Admin Control
                </h3>
                <p style={{ marginTop: "6px", color: "#64748b" }}>
                  Manage subjects and questions
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "22px",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#64748b",
                    fontWeight: "600",
                  }}
                >
                  Today’s focus
                </p>
                <h2
                  style={{
                    margin: "6px 0 0",
                    fontSize: "24px",
                    color: "#0f172a",
                  }}
                >
                  Exam Dashboard
                </h2>
              </div>

              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "999px",
                  backgroundColor: "#ecfdf3",
                  color: "#15803d",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Ready
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "16px",
                padding: "18px",
                marginBottom: "16px",
              }}
            >
              <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                Active session
              </p>
              <h3 style={{ margin: "8px 0", color: "#0f172a" }}>
                English Practice Test
              </h3>
              <div
                style={{
                  width: "100%",
                  height: "8px",
                  backgroundColor: "#e2e8f0",
                  borderRadius: "999px",
                  overflow: "hidden",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    width: "68%",
                    height: "100%",
                    backgroundColor: "#185FA5",
                  }}
                />
              </div>
              <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                68% completed
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "14px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "14px",
                  padding: "16px",
                }}
              >
                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                  Questions
                </p>
                <h3 style={{ margin: "8px 0 0", color: "#0f172a" }}>120+</h3>
              </div>

              <div
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "14px",
                  padding: "16px",
                }}
              >
                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                  Subjects
                </p>
                <h3 style={{ margin: "8px 0 0", color: "#0f172a" }}>
                  Multiple
                </h3>
              </div>

              <div
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "14px",
                  padding: "16px",
                }}
              >
                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                  Timer mode
                </p>
                <h3 style={{ margin: "8px 0 0", color: "#0f172a" }}>Enabled</h3>
              </div>

              <div
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "14px",
                  padding: "16px",
                }}
              >
                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                  Review
                </p>
                <h3 style={{ margin: "8px 0 0", color: "#0f172a" }}>Instant</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
