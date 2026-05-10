import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const LEVELS = [100, 200, 300, 400, 500, 600];

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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await api.get("/api/courses");
        setCourses(apiArray(data, "courses"));
      } catch (error) {
        console.error("Error fetching courses:", error);
        alert(error.message || "Error loading courses");
      }
    };

    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subjectName.trim() || !courseId || !level) {
      alert("Please complete subject name, course, and level.");
      return;
    }

    try {
      setIsSaving(true);
      await api.post(
        "/api/subjects",
        {
          name: subjectName.trim(),
          duration: Number(durationMinutes) * 60,
          courseId,
          level: Number(level),
        },
        { _tokenType: "admin" },
      );

      alert("Subject saved successfully");
      setSubjectName("");
      setDurationMinutes(5);
      setCourseId("");
      setLevel("");
    } catch (error) {
      console.error("Error saving subject:", error);
      alert(error.message || "Error saving subject");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <p style={eyebrowStyle}>Admin / Subject setup</p>
        <h1 style={headingStyle}>Create a new subject</h1>
        <p style={subheadingStyle}>Add subject name, course, level, and timer.</p>

        <div style={cardStyle}>
          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Subject name</label>
            <input
              type="text"
              placeholder="For example: Anatomy"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              style={inputStyle}
              required
            />

            <label style={labelStyle}>Course</label>
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

            <label style={labelStyle}>Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              style={inputStyle}
              required
            >
              <option value="">Select level</option>
              {LEVELS.map((item) => (
                <option key={item} value={item}>
                  {item} Level
                </option>
              ))}
            </select>

            <label style={labelStyle}>Duration in minutes</label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              min="1"
              max="120"
              style={inputStyle}
              required
            />

            <div style={buttonRowStyle}>
              <button type="submit" disabled={isSaving} style={primaryButton}>
                {isSaving ? "Saving..." : "Save Subject"}
              </button>

              <button type="button" onClick={() => navigate("/admin")} style={secondaryButton}>
                Back to Admin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const pageStyle = { minHeight: "100vh", background: "linear-gradient(135deg, #f8fbff 0%, #eef4ff 50%, #f7f9fc 100%)", padding: "32px 20px" };
const eyebrowStyle = { margin: 0, color: "var(--text-secondary)", fontSize: "14px", fontWeight: 600 };
const headingStyle = { margin: "10px 0 8px", fontSize: "36px", color: "var(--text-primary)" };
const subheadingStyle = { margin: "0 0 24px", color: "var(--text-secondary)", fontSize: "16px", lineHeight: 1.6 };
const cardStyle = { backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 12px 30px rgba(15,23,42,0.06)" };
const labelStyle = { display: "block", marginBottom: "8px", fontWeight: 600, color: "var(--text-primary)" };
const inputStyle = { width: "100%", padding: "14px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "15px", outline: "none", boxSizing: "border-box", marginBottom: "14px", backgroundColor: "white" };
const buttonRowStyle = { display: "flex", gap: "12px", flexWrap: "wrap" };
const primaryButton = { padding: "14px 22px", border: "none", borderRadius: "10px", backgroundColor: "var(--button-primary)", color: "white", fontSize: "15px", fontWeight: 600, cursor: "pointer" };
const secondaryButton = { padding: "14px 22px", border: "1px solid #cbd5e1", borderRadius: "10px", backgroundColor: "white", color: "var(--text-primary)", fontSize: "15px", fontWeight: 600, cursor: "pointer" };

export default AddSubjectPage;
