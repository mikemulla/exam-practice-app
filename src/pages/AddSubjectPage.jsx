import { useEffect, useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

const apiArray = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

function AddSubjectPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [subjectName, setSubjectName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [courseId, setCourseId] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/api/courses", { _tokenType: "admin" });
        setCourses(apiArray(response.data, "courses"));
      } catch (error) {
        console.error("Error fetching courses:", error);
        alert(error.message || "Error loading courses");
      }
    };

    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      alert("Your admin session has expired. Please log in again.");
      navigate("/admin-login");
      return;
    }

    try {
      await api.post(
        "/api/subjects",
        {
          name: subjectName.trim(),
          duration: Number(durationMinutes) * 60,
          courseId,
          level: Number(level),
        },
        {
          _tokenType: "admin",
        },
      );

      alert("Subject saved successfully");
      setSubjectName("");
      setDurationMinutes(5);
      setCourseId("");
      setLevel("");
    } catch (error) {
      console.error("Error saving subject:", error);
      alert(error.message || "Error saving subject");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <h1>Create a new subject</h1>
        <p style={{ color: "#64748b" }}>
          Add subject name, course, level, and timer.
        </p>

        <div style={cardStyle}>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Subject name"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              style={inputStyle}
              required
            />

            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              style={inputStyle}
              required
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name}
                </option>
              ))}
            </select>

            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              style={inputStyle}
              required
            >
              <option value="">Select level</option>
              {[100, 200, 300, 400, 500, 600].map((item) => (
                <option key={item} value={item}>
                  {item} Level
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Duration in minutes"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              min="1"
              style={inputStyle}
              required
            />

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button type="submit" style={primaryButton}>
                Save Subject
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin")}
                style={secondaryButton}
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

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #f8fbff 0%, #eef4ff 50%, #f7f9fc 100%)",
  padding: "32px 20px",
};

const cardStyle = {
  backgroundColor: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "20px",
  padding: "28px",
  boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
  marginBottom: "14px",
  backgroundColor: "white",
};

const primaryButton = {
  padding: "14px 22px",
  border: "none",
  borderRadius: "10px",
  backgroundColor: "#185FA5",
  color: "white",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
};

const secondaryButton = {
  padding: "14px 22px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  backgroundColor: "white",
  color: "#0f172a",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
};

export default AddSubjectPage;
