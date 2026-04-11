import { useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

function AddSubjectPage() {
  const navigate = useNavigate();
  const [subjectName, setSubjectName] = useState("");
  const [duration, setDuration] = useState(300);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/api/subjects", {
        name: subjectName,
        duration: Number(duration),
      });

      alert("Subject saved successfully");
      setSubjectName("");
      setDuration(300);
    } catch (error) {
      console.error("Error saving subject:", error);
      alert("Error saving subject");
    }
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
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Admin / Subject setup
          </p>
          <h1
            style={{
              margin: "10px 0 8px",
              fontSize: "36px",
              color: "#0f172a",
            }}
          >
            Create a new subject
          </h1>
          <p
            style={{
              margin: 0,
              color: "#475569",
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            Add a subject name and set the default duration for tests under that
            subject.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
            padding: "28px",
            boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#0f172a",
                }}
              >
                Subject Name
              </label>
              <input
                type="text"
                placeholder="For example: Biology"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#0f172a",
                }}
              >
                Duration in Seconds
              </label>
              <input
                type="number"
                placeholder="For example: 600"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                min="30"
                required
              />
              <p
                style={{
                  marginTop: "8px",
                  marginBottom: 0,
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Example: 300 = 5 minutes, 600 = 10 minutes.
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="submit"
                style={{
                  padding: "14px 22px",
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor: "#185FA5",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Save Subject
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin")}
                style={{
                  padding: "14px 22px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  backgroundColor: "white",
                  color: "#0f172a",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Back to Admin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddSubjectPage;
