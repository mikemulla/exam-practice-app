import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

const apiArray = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};


function ManageSubjectsPage() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDurationMinutes, setEditDurationMinutes] = useState(5);
  const [editCourseId, setEditCourseId] = useState("");
  const [editLevel, setEditLevel] = useState("");

  const fetchData = async () => {
    try {
      const [subjectsRes, topicsRes, questionsRes, coursesRes] =
        await Promise.all([
          api.get("/api/subjects/admin/all", {
            _tokenType: "admin",
          }),
          api.get("/api/topics/admin/all", {
            _tokenType: "admin",
          }),
          api.get("/api/questions/admin/all", {
            _tokenType: "admin",
          }),
          api.get("/api/courses"),
        ]);

      setSubjects(apiArray(subjectsRes.data, "subjects"));
      setTopics(apiArray(topicsRes.data, "topics"));
      setQuestions(apiArray(questionsRes.data, "questions"));
      setCourses(apiArray(coursesRes.data, "courses"));
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load subjects");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const topicCountsBySubject = useMemo(() => {
    const counts = {};

    topics.forEach((topic) => {
      const currentSubjectId = topic.subjectId?._id || topic.subjectId;
      if (currentSubjectId) {
        counts[currentSubjectId] = (counts[currentSubjectId] || 0) + 1;
      }
    });

    return counts;
  }, [topics]);

  const questionCountsBySubject = useMemo(() => {
    const counts = {};

    questions.forEach((question) => {
      const currentSubjectId = question.subjectId?._id || question.subjectId;
      if (currentSubjectId) {
        counts[currentSubjectId] = (counts[currentSubjectId] || 0) + 1;
      }
    });

    return counts;
  }, [questions]);

  const startEdit = (subject) => {
    setEditingId(subject._id);
    setEditName(subject.name);
    setEditDurationMinutes(
      Math.max(1, Math.floor((subject.duration || 300) / 60)),
    );
    setEditCourseId(subject.courseId?._id || subject.courseId || "");
    setEditLevel(subject.level || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDurationMinutes(5);
    setEditCourseId("");
    setEditLevel("");
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) {
      alert("Subject name is required");
      return;
    }

    if (!editCourseId) {
      alert("Please select a course");
      return;
    }

    if (!editLevel) {
      alert("Please select a level");
      return;
    }

    try {
      await api.put(
        `/api/subjects/${id}`,
        {
          name: editName.trim(),
          duration: Number(editDurationMinutes) * 60,
          courseId: editCourseId,
          level: Number(editLevel),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );

      alert("Subject updated successfully");
      cancelEdit();
      fetchData();
    } catch (error) {
      console.error("Error updating subject:", error);
      alert(error.response?.data?.message || "Error updating subject");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subject? Related topics and questions may also be affected.",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/subjects/${id}`, {
        _tokenType: "admin",
      });
      alert("Subject deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting subject:", error);
      alert(error.response?.data?.message || "Error deleting subject");
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor((seconds || 300) / 60);
    return `${mins} min`;
  };

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <p style={topLabel}>Admin / Manage subjects</p>
          <h1 style={titleStyle}>Edit and delete subjects</h1>
          <p style={subtitleStyle}>
            Assign each subject to a course and level so users only see subjects
            that apply to them.
          </p>
        </div>

        <div style={cardStyle}>
          <p style={{ color: "#64748b", marginBottom: "18px" }}>
            Showing {subjects.length} subject{subjects.length === 1 ? "" : "s"}
          </p>

          {subjects.length === 0 ? (
            <p>No subjects found.</p>
          ) : (
            subjects.map((subject) => {
              const topicCount = topicCountsBySubject[subject._id] || 0;
              const questionCount = questionCountsBySubject[subject._id] || 0;

              return (
                <div key={subject._id} style={subjectRowStyle}>
                  {editingId === subject._id ? (
                    <>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Subject name"
                        style={inputStyle}
                      />

                      <select
                        value={editCourseId}
                        onChange={(e) => setEditCourseId(e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">Select course</option>
                        {courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={editLevel}
                        onChange={(e) => setEditLevel(e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">Select level</option>
                        {[100, 200, 300, 400, 500, 600].map((level) => (
                          <option key={level} value={level}>
                            {level} Level
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        value={editDurationMinutes}
                        onChange={(e) => setEditDurationMinutes(e.target.value)}
                        min="1"
                        placeholder="Duration in minutes"
                        style={inputStyle}
                      />

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={() => handleUpdate(subject._id)}
                          style={primaryButton}
                        >
                          Save
                        </button>

                        <button onClick={cancelEdit} style={secondaryButton}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: "240px" }}>
                        <h3 style={subjectTitleStyle}>{subject.name}</h3>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span style={pillStyle}>
                            {subject.courseId?.name || "No course assigned"}
                          </span>

                          <span style={pillStyle}>
                            {subject.level
                              ? `${subject.level} Level`
                              : "No level assigned"}
                          </span>

                          <span style={pillStyle}>
                            {formatDuration(subject.duration)}
                          </span>

                          <span style={pillStyle}>
                            {topicCount} topic{topicCount === 1 ? "" : "s"}
                          </span>

                          <span style={pillStyle}>
                            {questionCount} question
                            {questionCount === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => startEdit(subject)}
                          style={primaryButton}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(subject._id)}
                          style={dangerButton}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          <div style={{ marginTop: "24px" }}>
            <button onClick={() => navigate("/admin")} style={secondaryButton}>
              Back to Admin
            </button>
          </div>
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

const topLabel = {
  margin: 0,
  color: "#64748b",
  fontSize: "14px",
  fontWeight: "600",
};

const titleStyle = {
  margin: "10px 0 8px",
  fontSize: "36px",
  color: "#0f172a",
};

const subtitleStyle = {
  margin: 0,
  color: "#475569",
  fontSize: "16px",
  lineHeight: "1.6",
};

const cardStyle = {
  backgroundColor: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "20px",
  padding: "28px",
  boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
};

const subjectRowStyle = {
  borderBottom: "1px solid #e2e8f0",
  padding: "18px 0",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
  backgroundColor: "white",
};

const subjectTitleStyle = {
  margin: "0 0 8px",
  textTransform: "capitalize",
  color: "#0f172a",
};

const pillStyle = {
  padding: "7px 12px",
  borderRadius: "999px",
  backgroundColor: "#f8fafc",
  color: "#475569",
  fontSize: "13px",
  fontWeight: "600",
};

const primaryButton = {
  padding: "10px 18px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#185FA5",
  color: "white",
  cursor: "pointer",
  fontWeight: "600",
};

const secondaryButton = {
  padding: "10px 18px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  backgroundColor: "white",
  cursor: "pointer",
  fontWeight: "600",
};

const dangerButton = {
  padding: "10px 18px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#dc2626",
  color: "white",
  cursor: "pointer",
  fontWeight: "600",
};

export default ManageSubjectsPage;
