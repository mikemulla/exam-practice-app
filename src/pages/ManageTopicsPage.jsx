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

const subjectOf = (topic) => topic?.subjectId || {};
const getCourseId = (subject) => typeof subject?.courseId === "object" ? subject.courseId?._id : subject?.courseId;
const getCourseName = (subject) => typeof subject?.courseId === "object" ? subject.courseId?.name : "Not available";

function ManageTopicsPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [courseFilter, setCourseFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", subjectId: "" });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [coursesRes, subjectsRes, topicsRes] = await Promise.all([
        api.get("/api/courses"),
        api.get("/api/subjects/admin/all?limit=100", { _tokenType: "admin" }),
        api.get("/api/topics/admin/all?limit=100", { _tokenType: "admin" }),
      ]);
      setCourses(apiArray(coursesRes.data, "courses"));
      setSubjects(apiArray(subjectsRes.data, "subjects"));
      setTopics(apiArray(topicsRes.data, "topics"));
    } catch (error) {
      console.error("Error loading topics:", error);
      alert(error.message || "Error loading topics");
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

  useEffect(() => {
    if (subjectFilter && !filteredSubjects.some((subject) => subject._id === subjectFilter)) {
      setSubjectFilter("");
    }
  }, [filteredSubjects, subjectFilter]);

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const subject = subjectOf(topic);
      const matchesCourse = courseFilter ? getCourseId(subject) === courseFilter : true;
      const matchesLevel = levelFilter ? Number(subject.level) === Number(levelFilter) : true;
      const matchesSubject = subjectFilter ? subject?._id === subjectFilter : true;
      return matchesCourse && matchesLevel && matchesSubject;
    });
  }, [topics, courseFilter, levelFilter, subjectFilter]);

  const startEdit = (topic) => {
    setEditingId(topic._id);
    setEditForm({ name: topic.name || "", subjectId: subjectOf(topic)?._id || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", subjectId: "" });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(
        `/api/topics/${id}`,
        { name: editForm.name.trim(), subjectId: editForm.subjectId },
        { _tokenType: "admin" },
      );
      cancelEdit();
      fetchData();
    } catch (error) {
      console.error("Error updating topic:", error);
      alert(error.message || "Error updating topic");
    }
  };

  const deleteTopic = async (id) => {
    if (!window.confirm("Delete this topic? Related questions will also be deleted.")) return;

    try {
      await api.delete(`/api/topics/${id}`, { _tokenType: "admin" });
      fetchData();
    } catch (error) {
      console.error("Error deleting topic:", error);
      alert(error.message || "Error deleting topic");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "1050px", margin: "0 auto" }}>
        <p style={eyebrowStyle}>Admin / Topics</p>
        <h1 style={headingStyle}>Manage topics</h1>
        <p style={subheadingStyle}>Filter topics by course, level, and subject.</p>

        <div style={filterCardStyle}>
          <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} style={inputStyle}>
            <option value="">All courses</option>
            {courses.map((course) => <option key={course._id} value={course._id}>{course.name}</option>)}
          </select>

          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} style={inputStyle}>
            <option value="">All levels</option>
            {LEVELS.map((level) => <option key={level} value={level}>{level} Level</option>)}
          </select>

          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} style={inputStyle}>
            <option value="">All subjects</option>
            {filteredSubjects.map((subject) => <option key={subject._id} value={subject._id}>{subject.name}</option>)}
          </select>

          <button onClick={() => navigate("/admin")} style={secondaryButton}>Back to Admin</button>
        </div>

        <div style={cardStyle}>
          {isLoading ? (
            <p style={emptyStyle}>Loading topics...</p>
          ) : filteredTopics.length === 0 ? (
            <p style={emptyStyle}>No topics found.</p>
          ) : (
            filteredTopics.map((topic) => {
              const subject = subjectOf(topic);
              return (
                <div key={topic._id} style={rowStyle}>
                  {editingId === topic._id ? (
                    <div style={{ width: "100%" }}>
                      <div style={gridStyle}>
                        <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} />
                        <select value={editForm.subjectId} onChange={(e) => setEditForm({ ...editForm, subjectId: e.target.value })} style={inputStyle}>
                          <option value="">Select subject</option>
                          {filteredSubjects.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
                        </select>
                      </div>
                      <div style={buttonRowStyle}>
                        <button onClick={() => saveEdit(topic._id)} style={primaryButton}>Save</button>
                        <button onClick={cancelEdit} style={secondaryButton}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 style={itemTitleStyle}>{topic.name}</h3>
                        <p style={itemMetaStyle}>Subject: {subject?.name || "Deleted subject"} | Course: {getCourseName(subject)} | Level: {subject?.level || "N/A"}</p>
                      </div>
                      <div style={buttonRowStyle}>
                        <button onClick={() => startEdit(topic)} style={primaryButton}>Edit</button>
                        <button onClick={() => deleteTopic(topic._id)} style={dangerButton}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
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
const filterCardStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "18px" };
const cardStyle = { backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "20px", boxShadow: "0 12px 30px rgba(15,23,42,0.06)" };
const rowStyle = { display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", padding: "16px 0", borderBottom: "1px solid #e2e8f0" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" };
const inputStyle = { width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", boxSizing: "border-box", backgroundColor: "white" };
const buttonRowStyle = { display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" };
const primaryButton = { padding: "10px 14px", border: "none", borderRadius: "8px", backgroundColor: "#185FA5", color: "white", fontWeight: 700, cursor: "pointer" };
const secondaryButton = { padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", backgroundColor: "white", color: "#0f172a", fontWeight: 700, cursor: "pointer" };
const dangerButton = { padding: "10px 14px", border: "none", borderRadius: "8px", backgroundColor: "#dc2626", color: "white", fontWeight: 700, cursor: "pointer" };
const emptyStyle = { color: "#64748b", textAlign: "center" };
const itemTitleStyle = { margin: "0 0 6px", color: "#0f172a" };
const itemMetaStyle = { margin: 0, color: "#64748b" };

export default ManageTopicsPage;
