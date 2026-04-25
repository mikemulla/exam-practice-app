import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

function SubjectRequestPage() {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [timer, setTimer] = useState(10);
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("topic", topic);
    formData.append("timer", timer);

    if (file) {
      formData.append("file", file);
    }

    try {
      setIsSubmitting(true);

      await api.post("/api/requests/subject-request", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Subject request sent successfully");

      setSubject("");
      setTopic("");
      setTimer(10);
      setFile(null);
    } catch (error) {
      console.error("Error sending request:", error);
      alert("Failed to send request");
    } finally {
      setIsSubmitting(false);
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
      <div style={{ maxWidth: "750px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <p style={{ margin: 0, color: "#64748b", fontWeight: "600" }}>
            User / Subject request
          </p>

          <h1 style={{ margin: "10px 0 8px", color: "#0f172a" }}>
            Request a Subject
          </h1>

          <p style={{ margin: 0, color: "#475569", lineHeight: "1.6" }}>
            Upload a file and tell the admin the subject, topic, and preferred
            test timer.
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
            <label style={{ fontWeight: "600" }}>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Example: Anatomy"
              required
              style={inputStyle}
            />

            <label style={{ fontWeight: "600" }}>Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Example: Upper limb"
              required
              style={inputStyle}
            />

            <label style={{ fontWeight: "600" }}>Timer in Minutes</label>
            <input
              type="number"
              value={timer}
              onChange={(e) => setTimer(e.target.value)}
              min="1"
              required
              style={inputStyle}
            />

            <label style={{ fontWeight: "600" }}>Upload File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={inputStyle}
            />

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: "14px 22px",
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor: "#185FA5",
                  color: "white",
                  fontWeight: "600",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? "Sending..." : "Send Request"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/user")}
                style={{
                  padding: "14px 22px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  backgroundColor: "white",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Back to User Page
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  fontSize: "15px",
  boxSizing: "border-box",
  marginTop: "8px",
  marginBottom: "18px",
};

export default SubjectRequestPage;
