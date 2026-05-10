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
        <p style={subheadingStyle}>
          Add subject name, course, level, and timer.
        </p>

        <div style={cardStyle}>
          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Subject name</label>
            <input
              type="text"
              placeholder="For example: Anatomy"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#185fa5";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(24, 95, 165, 0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
              }}
              required
            />

            <label style={labelStyle}>Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#185fa5";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(24, 95, 165, 0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
              }}
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
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#185fa5";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(24, 95, 165, 0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
              }}
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
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#185fa5";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(24, 95, 165, 0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
              }}
              required
            />

            <div style={buttonRowStyle}>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  ...primaryButton,
                  opacity: isSaving ? 0.7 : 1,
                  cursor: isSaving ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = "#0e3d6e";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(24, 95, 165, 0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#185fa5";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {isSaving ? "Saving..." : "Save Subject"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin")}
                style={secondaryButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
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

const pageStyle = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: "40px 20px",
};
const eyebrowStyle = {
  margin: "0 0 0.75rem",
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};
const headingStyle = {
  margin: "0 0 0.5rem",
  fontSize: "32px",
  color: "#0f172a",
  fontWeight: "700",
};
const subheadingStyle = {
  margin: "0 0 24px",
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "1.6",
};
const cardStyle = {
  backgroundColor: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "28px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};
const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
  color: "#0f172a",
  fontSize: "14px",
};
const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  marginBottom: "16px",
  backgroundColor: "white",
  color: "#0f172a",
  transition: "all 0.2s",
};
const buttonRowStyle = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "1rem",
};
const primaryButton = {
  padding: "11px 20px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#185fa5",
  color: "white",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s",
};
const secondaryButton = {
  padding: "11px 20px",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  backgroundColor: "white",
  color: "#0f172a",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s",
};

export default AddSubjectPage;
