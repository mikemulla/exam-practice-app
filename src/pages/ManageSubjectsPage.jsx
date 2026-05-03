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

const getCourseName = (subject) =>
  typeof subject?.courseId === "object" ? subject.courseId?.name : "Not available";

function ManageSubjectsPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courseFilter, setCourseFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", courseId: "", level: "", durationMinutes: 5 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [coursesRes, subjectsRes] = await Promise.all([
        api.get("/api/courses"),
        api.get("/api/subjects/admin/all?limit=100", { _tokenType: "admin" }),
      ]);
      setCourses(apiArray(coursesRes.data, "courses"));
      setSubjects(apiArray(subjectsRes.data, "subjects"));
    } catch (error) {
      console.error("Error loading subjects:", error);
      alert(error.message || "Error loading subjects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const matchesCourse = courseFilter ? getCourseId(subject) === courseFilter : true;
      const matchesLevel = levelFilter ? Number(subject.level) === Number(levelFilter) : true;
      return matchesCourse && matchesLevel;
    });
  }, [subjects, courseFilter, levelFilter]);

  const startEdit = (subject) => {
    setEditingId(subject._id);
    setEditForm({
      name: subject.name || "",
      courseId: getCourseId(subject) || "",
      level: subject.level || "",
      durationMinutes: Math.round((subject.duration || 300) / 60),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", courseId: "", level: "", durationMinutes: 5 });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(
        `/api/subjects/${id}`,
        {
          name: editForm.name.trim(),
          courseId: editForm.courseId,
          level: Number(editForm.level),
          duration: Number(editForm.durationMinutes) * 60,
        },
        { _tokenType: "admin" },
      );
      cancelEdit();
      fetchData();
    } catch (error) {
      console.error("Error updating subject:", error);
      alert(error.message || "Error updating subject");
    }
  };

  const deleteSubject = async (id) => {
    if (!window.confirm("Delete this subject? Related topics and questions will also be deleted.")) return;

    try {
      await api.delete(`/api/subjects/${id}`, { _tokenType: "admin" });
      fetchData();
    } catch (error) {
      console.error("Error deleting subject:", error);
      alert(error.message || "Error deleting subject");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "1050px", margin: "0 auto" }}>
        <p style={eyebrowStyle}>Admin / Subjects</p>
        <h1 style={headingStyle}>Manage subjects</h1>
        <p style={subheadingStyle}>Filter subjects by course and level, then edit or delete them.</p>

        <div style={filterCardStyle}>
          <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} style={inputStyle}>
            <option value="">All courses</option>
            {courses.map((course) => <option key={course._id} value={course._id}>{course.name}</option>)}
          </select>

          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} style={inputStyle}>
            <option value="">All levels</option>
            {LEVELS.map((level) => <option key={level} value={level}>{level} Level</option>)}
          </select>

          <button onClick={() => navigate("/admin")} style={secondaryButton}>Back to Admin</button>
        </div>

        <div style={cardStyle}>
          {isLoading ? (
            <p style={emptyStyle}>Loading subjects...</p>
          ) : filteredSubjects.length === 0 ? (
            <p style={emptyStyle}>No subjects found.</p>
          ) : (
            filteredSubjects.map((subject) => (
              <div key={subject._id} style={rowStyle}>
                {editingId === subject._id ? (
                  <div style={{ width: "100%" }}>
                    <div style={gridStyle}>
                      <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} />
                      <select value={editForm.courseId} onChange={(e) => setEditForm({ ...editForm, courseId: e.target.value })} style={inputStyle}>
                        <option value="">Select course</option>
                        {courses.map((course) => <option key={course._id} value={course._id}>{course.name}</option>)}
                      </select>
                      <select value={editForm.level} onChange={(e) => setEditForm({ ...editForm, level: e.target.value })} style={inputStyle}>
                        <option value="">Select level</option>
                        {LEVELS.map((level) => <option key={level} value={level}>{level} Level</option>)}
                      </select>
                      <input type="number" min="1" value={editForm.durationMinutes} onChange={(e) => setEditForm({ ...editForm, durationMinutes: e.target.value })} style={inputStyle} />
                    </div>
                    <div style={buttonRowStyle}>
                      <button onClick={() => saveEdit(subject._id)} style={primaryButton}>Save</button>
                      <button onClick={cancelEdit} style={secondaryButton}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 style={itemTitleStyle}>{subject.name}</h3>
                      <p style={itemMetaStyle}>Course: {getCourseName(subject)} | Level: {subject.level} | Duration: {Math.round((subject.duration || 0) / 60)} min</p>
                    </div>
                    <div style={buttonRowStyle}>
                      <button onClick={() => startEdit(subject)} style={primaryButton}>Edit</button>
                      <button onClick={() => deleteSubject(subject._id)} style={dangerButton}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const pageStyle = { minHeight: "100vh", background: "linear-gradient(135deg, #f8fbff 0%, #eef4ff 50%, #f7f9fc 100%)", padding: "32px 20px" };
const eyebrowStyle = { margin: 0, color: "#64748b", fontSize: "14px", fontWeight: 600 };
const headingStyle = { margin: "10px 0 8px", fontSize: "36px", color: "#0f172a" };
const subheadingStyle = { margin: "0 0 24px", color: "#475569", fontSize: "16px", lineHeight: 1.6 };
const filterCardStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px", marginBottom: "18px" };
const cardStyle = { backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "20px", boxShadow: "0 12px 30px rgba(15,23,42,0.06)" };
const rowStyle = { display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", padding: "16px 0", borderBottom: "1px solid #e2e8f0" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" };
const inputStyle = { width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", boxSizing: "border-box", backgroundColor: "white" };
const buttonRowStyle = { display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" };
const primaryButton = { padding: "10px 14px", border: "none", borderRadius: "8px", backgroundColor: "#185FA5", color: "white", fontWeight: 700, cursor: "pointer" };
const secondaryButton = { padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", backgroundColor: "white", color: "#0f172a", fontWeight: 700, cursor: "pointer" };
const dangerButton = { padding: "10px 14px", border: "none", borderRadius: "8px", backgroundColor: "#dc2626", color: "white", fontWeight: 700, cursor: "pointer" };
const emptyStyle = { color: "#64748b", textAlign: "center" };
const itemTitleStyle = { margin: "0 0 6px", color: "#0f172a" };
const itemMetaStyle = { margin: 0, color: "#64748b" };

export default ManageSubjectsPage;
