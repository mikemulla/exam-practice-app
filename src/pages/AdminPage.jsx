import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
function AdminPage() {
  const navigate = useNavigate();

  const cardStyle = {
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
  };

  const primaryButton = {
    padding: "14px 20px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#185FA5",
    color: "white",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  };

  const secondaryButton = {
    padding: "14px 20px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    backgroundColor: "white",
    color: "#0f172a",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  };

  return (
    <>
      <Header />
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
              Admin workspace
            </p>
            <h1
              style={{
                margin: "10px 0 8px",
                fontSize: "40px",
                color: "#0f172a",
              }}
            >
              Manage your exam platform
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
              Add subjects, create question banks, and control how each test is
              delivered to users.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            <div style={cardStyle}>
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
                📘
              </div>
              <h2 style={{ margin: "0 0 10px", color: "#0f172a" }}>
                Add Subject
              </h2>
              <p
                style={{
                  margin: "0 0 20px",
                  color: "#64748b",
                  lineHeight: "1.6",
                  fontSize: "15px",
                }}
              >
                Create a new subject and set the default duration for the test.
              </p>
              <button
                onClick={() => navigate("/add-subject")}
                style={primaryButton}
              >
                Open Subject Setup
              </button>
            </div>

            <div style={cardStyle}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  backgroundColor: "#eefbf3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  marginBottom: "16px",
                }}
              >
                ✍️
              </div>
              <h2 style={{ margin: "0 0 10px", color: "#0f172a" }}>
                Add Question
              </h2>
              <p
                style={{
                  margin: "0 0 20px",
                  color: "#64748b",
                  lineHeight: "1.6",
                  fontSize: "15px",
                }}
              >
                Add question text, multiple options, correct answers, and
                explanations for each subject.
              </p>
              <button
                onClick={() => navigate("/add-question")}
                style={secondaryButton}
              >
                Open Question Builder
              </button>
            </div>

            <div style={cardStyle}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  backgroundColor: "#f3e8ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  marginBottom: "16px",
                }}
              >
                📥
              </div>
              <h2 style={{ margin: "0 0 10px", color: "#0f172a" }}>
                Bulk Import
              </h2>
              <p
                style={{
                  margin: "0 0 20px",
                  color: "#64748b",
                  lineHeight: "1.6",
                  fontSize: "15px",
                }}
              >
                Paste a JSON array and import many questions into one subject at
                once.
              </p>
              <button
                onClick={() => navigate("/bulk-import-questions")}
                style={secondaryButton}
              >
                Open Bulk Import
              </button>
            </div>

            <div style={cardStyle}>
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
                🛠️
              </div>
              <h2 style={{ margin: "0 0 10px", color: "#0f172a" }}>
                Manage Subjects
              </h2>
              <p
                style={{
                  margin: "0 0 20px",
                  color: "#64748b",
                  lineHeight: "1.6",
                  fontSize: "15px",
                }}
              >
                Edit subject names, adjust timer duration, or delete subjects
                you no longer need.
              </p>
              <button
                onClick={() => navigate("/manage-subjects")}
                style={secondaryButton}
              >
                Open Subject Manager
              </button>
            </div>

            <div style={cardStyle}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  backgroundColor: "#eefbf3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  marginBottom: "16px",
                }}
              >
                🧾
              </div>
              <h2 style={{ margin: "0 0 10px", color: "#0f172a" }}>
                Manage Questions
              </h2>
              <p
                style={{
                  margin: "0 0 20px",
                  color: "#64748b",
                  lineHeight: "1.6",
                  fontSize: "15px",
                }}
              >
                Edit existing questions, update answers and explanations, or
                remove unwanted items.
              </p>
              <button
                onClick={() => navigate("/manage-questions")}
                style={secondaryButton}
              >
                Open Question Manager
              </button>
            </div>

            <div style={cardStyle}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  backgroundColor: "#f0fdf4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  marginBottom: "16px",
                }}
              >
                🗂️
              </div>
              <h2 style={{ margin: "0 0 10px", color: "#0f172a" }}>
                Add Topic
              </h2>
              <p
                style={{
                  margin: "0 0 20px",
                  color: "#64748b",
                  lineHeight: "1.6",
                  fontSize: "15px",
                }}
              >
                Create topic groups under a subject so questions can be
                organized better.
              </p>
              <button
                onClick={() => navigate("/add-topic")}
                style={secondaryButton}
              >
                Open Topic Setup
              </button>
            </div>

            <div style={cardStyle}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  backgroundColor: "#fff7ed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  marginBottom: "16px",
                }}
              >
                🧭
              </div>
              <h2 style={{ margin: "0 0 10px", color: "#0f172a" }}>
                Manage Topics
              </h2>
              <p
                style={{
                  margin: "0 0 20px",
                  color: "#64748b",
                  lineHeight: "1.6",
                  fontSize: "15px",
                }}
              >
                Edit topic names, move them between subjects, or remove topics
                you no longer need.
              </p>
              <button
                onClick={() => navigate("/manage-topics")}
                style={secondaryButton}
              >
                Open Topic Manager
              </button>
            </div>

            <div style={cardStyle}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  backgroundColor: "#fff6e8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  marginBottom: "16px",
                }}
              >
                ⚙️
              </div>
              <h2 style={{ margin: "0 0 10px", color: "#0f172a" }}>
                Platform Control
              </h2>
              <p
                style={{
                  margin: "0 0 20px",
                  color: "#64748b",
                  lineHeight: "1.6",
                  fontSize: "15px",
                }}
              >
                Expand later with analytics, user progress, question review, and
                timing controls.
              </p>
              <button onClick={() => navigate("/")} style={secondaryButton}>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminPage;
