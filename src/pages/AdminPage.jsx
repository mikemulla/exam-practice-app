import { useNavigate } from "react-router-dom";

function AdminPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");

    navigate("/admin-login");
  };

  const cardStyle = {
    backgroundColor: "white",

    border: "1px solid #e2e8f0",

    borderRadius: "18px",

    padding: "22px",

    boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
  };

  const buttonStyle = {
    width: "100%",

    padding: "14px 20px",

    border: "none",

    borderRadius: "10px",

    backgroundColor: "#185FA5",

    color: "white",

    fontSize: "15px",

    fontWeight: "600",

    cursor: "pointer",
  };

  return (
    <div
      style={{
        minHeight: "100vh",

        background:
          "linear-gradient(135deg, #f8fbff 0%, #eef4ff 50%, #f7f9fc 100%)",

        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: "1050px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",

            justifyContent: "space-between",

            gap: "16px",

            alignItems: "center",

            flexWrap: "wrap",

            marginBottom: "28px",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,

                color: "#64748b",

                fontSize: "14px",

                fontWeight: "600",
              }}
            >
              Admin dashboard
            </p>

            <h1
              style={{
                margin: "10px 0 8px",

                fontSize: "40px",

                color: "#0f172a",
              }}
            >
              Manage exam content
            </h1>

            <p
              style={{
                margin: 0,

                color: "#475569",

                lineHeight: "1.6",
              }}
            >
              Create subjects, topics, questions, and manage your question bank.
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "12px 18px",

              borderRadius: "10px",

              border: "1px solid #fecaca",

              backgroundColor: "#fff5f5",

              color: "#b91c1c",

              fontWeight: "700",

              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        <div
          style={{
            display: "grid",

            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",

            gap: "18px",
          }}
        >
          <div style={cardStyle}>
            <h2>Add Subject</h2>

            <p style={{ color: "#64748b" }}>Create a subject and set timer.</p>

            <button
              onClick={() => navigate("/add-subject")}
              style={buttonStyle}
            >
              Add Subject
            </button>
          </div>

          <div style={cardStyle}>
            <h2>Add Topic</h2>

            <p style={{ color: "#64748b" }}>Create topics under subjects.</p>

            <button onClick={() => navigate("/add-topic")} style={buttonStyle}>
              Add Topic
            </button>
          </div>

          <div style={cardStyle}>
            <h2>Add Question</h2>

            <p style={{ color: "#64748b" }}>Add one question manually.</p>

            <button
              onClick={() => navigate("/add-question")}
              style={buttonStyle}
            >
              Add Question
            </button>
          </div>

          <div style={cardStyle}>
            <h2>Bulk Import</h2>

            <p style={{ color: "#64748b" }}>Import many questions at once.</p>

            <button
              onClick={() => navigate("/bulk-import")}
              style={buttonStyle}
            >
              Bulk Import
            </button>
          </div>

          <div style={cardStyle}>
            <h2>Manage Subjects</h2>

            <p style={{ color: "#64748b" }}>Edit or delete subjects.</p>

            <button
              onClick={() => navigate("/manage-subjects")}
              style={buttonStyle}
            >
              Manage Subjects
            </button>
          </div>

          <div style={cardStyle}>
            <h2>Manage Topics</h2>

            <p style={{ color: "#64748b" }}>Edit or delete topics.</p>

            <button
              onClick={() => navigate("/manage-topics")}
              style={buttonStyle}
            >
              Manage Topics
            </button>
          </div>

          <div style={cardStyle}>
            <h2>Manage Questions</h2>

            <p style={{ color: "#64748b" }}>
              Edit, delete, or bulk delete questions.
            </p>

            <button
              onClick={() => navigate("/manage-questions")}
              style={buttonStyle}
            >
              Manage Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
