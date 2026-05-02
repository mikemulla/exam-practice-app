import { useEffect, useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

const apiArray = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};


function AddTopicPage() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [topicName, setTopicName] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const adminToken = localStorage.getItem("adminToken");
        const response = await api.get("/api/subjects/admin/all", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        setSubjects(apiArray(response.data, "subjects"));
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subjectId) {
      alert("Please select a subject.");
      return;
    }

    try {
      const adminToken = localStorage.getItem("adminToken");

      await api.post(
        "/api/topics",
        {
          subjectId,
          name: topicName,
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );

      alert("Topic saved successfully");
      setSubjectId("");
      setTopicName("");
    } catch (error) {
      console.error("Error saving topic:", error);
      alert("Error saving topic");
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
            Admin / Topic setup
          </p>
          <h1
            style={{
              margin: "10px 0 8px",
              fontSize: "36px",
              color: "#0f172a",
            }}
          >
            Create a new topic
          </h1>
          <p
            style={{
              margin: 0,
              color: "#475569",
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            Select a subject, then create a topic under it.
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
                Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "15px",
                  backgroundColor: "white",
                  boxSizing: "border-box",
                }}
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
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
                Topic Name
              </label>
              <input
                type="text"
                placeholder="For example: Genetics"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
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
                Save Topic
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

export default AddTopicPage;
