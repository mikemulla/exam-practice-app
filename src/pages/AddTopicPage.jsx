import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const LEVELS = [100, 200, 300, 400, 500, 600];

const apiArray = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const getCourseId = (subject) =>
  typeof subject?.courseId === "object" ? subject.courseId?._id : subject?.courseId;

function AddTopicPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [level, setLevel] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicName, setTopicName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, subjectsRes] = await Promise.all([
          api.get("/api/courses"),
          api.get("/api/subjects/admin/all?limit=100", { _tokenType: "admin" }),
        ]);
        setCourses(apiArray(coursesRes.data, "courses"));
        setSubjects(apiArray(subjectsRes.data, "subjects"));
      } catch (error) {
        console.error("Error fetching setup data:", error);
        alert(error.message || "Error loading setup data");
      }
    };

    fetchData();
  }, []);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const matchesCourse = courseId ? getCourseId(subject) === courseId : true;
      const matchesLevel = level ? Number(subject.level) === Number(level) : true;
      return matchesCourse && matchesLevel;
    });
  }, [subjects, courseId, level]);

  useEffect(() => {
    if (subjectId && !filteredSubjects.some((subject) => subject._id === subjectId)) {
      setSubjectId("");
    }
  }, [filteredSubjects, subjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseId || !level || !subjectId || !topicName.trim()) {
      alert("Please select course, level, subject, and enter a topic name.");
      return;
    }

    try {
      setIsSaving(true);
      await api.post(
        "/api/topics",
        { subjectId, name: topicName.trim() },
        { _tokenType: "admin" },
      );

      alert("Topic saved successfully");
      setTopicName("");
    } catch (error) {
      console.error("Error saving topic:", error);
      alert(error.message || "Error saving topic");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <p style={eyebrowStyle}>Admin / Topic setup</p>
        <h1 style={headingStyle}>Create a new topic</h1>
        <p style={subheadingStyle}>Filter by course and level, then create a topic under the selected subject.</p>

        <div style={cardStyle}>
          <form onSubmit={handleSubmit}>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Course</label>
                <select value={courseId} onChange={(e) => setCourseId(e.target.value)} style={inputStyle} required>
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>{course.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Level</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)} style={inputStyle} required>
                  <option value="">Select level</option>
                  {LEVELS.map((item) => (
                    <option key={item} value={item}>{item} Level</option>
                  ))}
                </select>
              </div>
            </div>

            <label style={labelStyle}>Subject</label>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} style={inputStyle} required>
              <option value="">Select subject</option>
              {filteredSubjects.map((subject) => (
                <option key={subject._id} value={subject._id}>{subject.name}</option>
              ))}
            </select>

            <label style={labelStyle}>Topic name</label>
            <input
              type="text"
              placeholder="For example: Genetics"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              style={inputStyle}
              required
            />

            <div style={buttonRowStyle}>
              <button type="submit" disabled={isSaving} style={primaryButton}>{isSaving ? "Saving..." : "Save Topic"}</button>
              <button type="button" onClick={() => navigate("/admin")} style={secondaryButton}>Back to Admin</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const pageStyle = { minHeight: "100vh", background: "linear-gradient(135deg, #f8fbff 0%, #eef4ff 50%, #f7f9fc 100%)", padding: "32px 20px" };
const eyebrowStyle = { margin: 0, color: "#64748b", fontSize: "14px", fontWeight: 600 };
const headingStyle = { margin: "10px 0 8px", fontSize: "36px", color: "#0f172a" };
const subheadingStyle = { margin: "0 0 24px", color: "#475569", fontSize: "16px", lineHeight: 1.6 };
const cardStyle = { backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 12px 30px rgba(15,23,42,0.06)" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" };
const labelStyle = { display: "block", marginBottom: "8px", fontWeight: 600, color: "#0f172a" };
const inputStyle = { width: "100%", padding: "14px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "15px", outline: "none", boxSizing: "border-box", marginBottom: "14px", backgroundColor: "white" };
const buttonRowStyle = { display: "flex", gap: "12px", flexWrap: "wrap" };
const primaryButton = { padding: "14px 22px", border: "none", borderRadius: "10px", backgroundColor: "#185FA5", color: "white", fontSize: "15px", fontWeight: 600, cursor: "pointer" };
const secondaryButton = { padding: "14px 22px", border: "1px solid #cbd5e1", borderRadius: "10px", backgroundColor: "white", color: "#0f172a", fontSize: "15px", fontWeight: 600, cursor: "pointer" };

export default AddTopicPage;
