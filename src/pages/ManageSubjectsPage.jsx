import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

function ManageSubjectsPage() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDuration, setEditDuration] = useState(300);

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/api/subjects");
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await api.get("/api/topics");
      setTopics(response.data);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await api.get("/api/questions");
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchTopics();
    fetchQuestions();
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
    setEditDuration(subject.duration || 300);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDuration(300);
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/api/subjects/${id}`, {
        name: editName,
        duration: Number(editDuration),
      });

      alert("Subject updated successfully");
      cancelEdit();
      fetchSubjects();
    } catch (error) {
      console.error("Error updating subject:", error);
      alert("Error updating subject");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subject? All related questions under this subject will also be deleted.",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/subjects/${id}`);
      alert("Subject deleted successfully");
      fetchSubjects();
      fetchTopics();
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting subject:", error);
      alert("Error deleting subject");
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor((seconds || 300) / 60);
    return `${mins} min`;
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
      <div style={{ maxWidth: "950px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Admin / Manage subjects
          </p>
          <h1
            style={{
              margin: "10px 0 8px",
              fontSize: "36px",
              color: "#0f172a",
            }}
          >
            Edit and delete subjects
          </h1>
          <p
            style={{
              margin: 0,
              color: "#475569",
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            Review the structure of each subject, including duration, topic
            count, and total question count.
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
                <div
                  key={subject._id}
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    padding: "18px 0",
                  }}
                >
                  {editingId === subject._id ? (
                    <>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          marginBottom: "10px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          boxSizing: "border-box",
                        }}
                      />

                      <input
                        type="number"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          marginBottom: "10px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          boxSizing: "border-box",
                        }}
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
                          style={{
                            padding: "10px 18px",
                            border: "none",
                            borderRadius: "8px",
                            backgroundColor: "#185FA5",
                            color: "white",
                            cursor: "pointer",
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{
                            padding: "10px 18px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            backgroundColor: "white",
                            cursor: "pointer",
                          }}
                        >
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
                        <h3
                          style={{
                            margin: "0 0 8px",
                            textTransform: "capitalize",
                            color: "#0f172a",
                          }}
                        >
                          {subject.name}
                        </h3>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              padding: "7px 12px",
                              borderRadius: "999px",
                              backgroundColor: "#f8fafc",
                              color: "#475569",
                              fontSize: "13px",
                              fontWeight: "600",
                            }}
                          >
                            {formatDuration(subject.duration)}
                          </span>

                          <span
                            style={{
                              padding: "7px 12px",
                              borderRadius: "999px",
                              backgroundColor: "#f8fafc",
                              color: "#475569",
                              fontSize: "13px",
                              fontWeight: "600",
                            }}
                          >
                            {topicCount} topic{topicCount === 1 ? "" : "s"}
                          </span>

                          <span
                            style={{
                              padding: "7px 12px",
                              borderRadius: "999px",
                              backgroundColor: "#f8fafc",
                              color: "#475569",
                              fontSize: "13px",
                              fontWeight: "600",
                            }}
                          >
                            {questionCount} question
                            {questionCount === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexShrink: 0,
                        }}
                      >
                        <button
                          onClick={() => startEdit(subject)}
                          style={{
                            padding: "10px 18px",
                            border: "none",
                            borderRadius: "8px",
                            backgroundColor: "#185FA5",
                            color: "white",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(subject._id)}
                          style={{
                            padding: "10px 18px",
                            border: "none",
                            borderRadius: "8px",
                            backgroundColor: "#dc2626",
                            color: "white",
                            cursor: "pointer",
                          }}
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
            <button
              onClick={() => navigate("/admin")}
              style={{
                padding: "12px 20px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              Back to Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageSubjectsPage;
