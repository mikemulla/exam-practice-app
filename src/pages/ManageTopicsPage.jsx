import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

const apiArray = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};


function ManageTopicsPage() {
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [filterSubjectId, setFilterSubjectId] = useState("");

  const [subjectId, setSubjectId] = useState("");
  const [topicName, setTopicName] = useState("");

  const fetchTopics = async () => {
    try {
      const response = await api.get("/api/topics/admin/all", {
        _tokenType: "admin",
      });
      setTopics(apiArray(response.data, "topics"));
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/api/subjects/admin/all", {
        _tokenType: "admin",
      });
      setSubjects(apiArray(response.data, "subjects"));
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await api.get("/api/questions/admin/all", {
        _tokenType: "admin",
      });
      setQuestions(apiArray(response.data, "questions"));
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    fetchTopics();
    fetchSubjects();
    fetchQuestions();
  }, []);

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      return (
        !filterSubjectId ||
        (topic.subjectId?._id || topic.subjectId) === filterSubjectId
      );
    });
  }, [topics, filterSubjectId]);

  const questionCountsByTopic = useMemo(() => {
    const counts = {};

    questions.forEach((question) => {
      const currentTopicId = question.topicId?._id || question.topicId;

      if (currentTopicId) {
        counts[currentTopicId] = (counts[currentTopicId] || 0) + 1;
      }
    });

    return counts;
  }, [questions]);

  const startEdit = (topic) => {
    setEditingId(topic._id);
    setSubjectId(topic.subjectId?._id || topic.subjectId || "");
    setTopicName(topic.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSubjectId("");
    setTopicName("");
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(
        `/api/topics/${id}`,
        {
          subjectId,
          name: topicName,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );

      alert("Topic updated successfully");
      cancelEdit();
      fetchTopics();
    } catch (error) {
      console.error("Error updating topic:", error);
      alert("Error updating topic");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this topic? All related questions under this topic will also be deleted.",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/topics/${id}`, {
        _tokenType: "admin",
      });
      alert("Topic deleted successfully");
      fetchTopics();
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting topic:", error);
      alert("Error deleting topic");
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
            Admin / Manage topics
          </p>
          <h1
            style={{
              margin: "10px 0 8px",
              fontSize: "36px",
              color: "#0f172a",
            }}
          >
            Edit and delete topics
          </h1>
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
          <div style={{ marginBottom: "24px", maxWidth: "320px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#0f172a",
              }}
            >
              Filter by Subject
            </label>
            <select
              value={filterSubjectId}
              onChange={(e) => setFilterSubjectId(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "white",
                boxSizing: "border-box",
              }}
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <p style={{ color: "#64748b", marginBottom: "18px" }}>
            Showing {filteredTopics.length} topic
            {filteredTopics.length === 1 ? "" : "s"}
          </p>

          {filteredTopics.length === 0 ? (
            <p>No topics found.</p>
          ) : (
            filteredTopics.map((topic) => {
              const topicQuestionCount = questionCountsByTopic[topic._id] || 0;

              return (
                <div
                  key={topic._id}
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    padding: "16px 0",
                  }}
                >
                  {editingId === topic._id ? (
                    <>
                      <select
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          marginBottom: "10px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: "white",
                          boxSizing: "border-box",
                        }}
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((subject) => (
                          <option key={subject._id} value={subject._id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={topicName}
                        onChange={(e) => setTopicName(e.target.value)}
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
                          onClick={() => handleUpdate(topic._id)}
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
                      <div style={{ flex: 1, minWidth: "220px" }}>
                        <h3
                          style={{
                            margin: "0 0 6px",
                            textTransform: "capitalize",
                            color: "#0f172a",
                          }}
                        >
                          {topic.name}
                        </h3>
                        <p style={{ margin: "0 0 6px", color: "#64748b" }}>
                          Subject: {topic.subjectId?.name || "Unknown"}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            color: "#185FA5",
                            fontWeight: "600",
                          }}
                        >
                          {topicQuestionCount} question
                          {topicQuestionCount === 1 ? "" : "s"}
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexShrink: 0,
                        }}
                      >
                        <button
                          onClick={() => startEdit(topic)}
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
                          onClick={() => handleDelete(topic._id)}
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

export default ManageTopicsPage;
