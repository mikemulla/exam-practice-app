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

async function fetchAllPages(url, key, config = {}) {
  let page = 1;
  let totalPages = 1;
  const allItems = [];

  do {
    const separator = url.includes("?") ? "&" : "?";

    const response = await api.get(
      `${url}${separator}page=${page}&limit=50`,
      config,
    );

    const items = apiArray(response.data, key);

    allItems.push(...items);
    totalPages = Number(response.data?.totalPages || 1);
    page += 1;
  } while (page <= totalPages);

  return allItems;
}

const subjectOf = (topic) => topic?.subjectId || {};
const getCourseId = (subject) =>
  typeof subject?.courseId === "object"
    ? subject.courseId?._id
    : subject?.courseId;
const getCourseName = (subject) =>
  typeof subject?.courseId === "object"
    ? subject.courseId?.name
    : "Not available";

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
  const [hasLoadedTopics, setHasLoadedTopics] = useState(false);
  const [isLoadingSetup, setIsLoadingSetup] = useState(true);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoadingSetup(true);

      const [coursesRes, allSubjects] = await Promise.all([
        api.get("/api/courses?limit=100"),
        fetchAllPages("/api/subjects/admin/all", "subjects", {
          _tokenType: "admin",
        }),
      ]);

      setCourses(apiArray(coursesRes.data, "courses"));
      setSubjects(allSubjects);
      setTopics([]);
      setHasLoadedTopics(false);
    } catch (error) {
      console.error("Error loading topic filter data:", error);
      alert(error.message || "Error loading filter data");
    } finally {
      setIsLoadingSetup(false);
    }
  };

  const cancelEdit = () => {
    if (isSavingEdit) return;

    setEditingId(null);
    setEditForm({ name: "", subjectId: "" });
  };

  const loadTopics = async () => {
    if (isSavingEdit) return;

    if (!subjectFilter) {
      alert("Please select a subject first.");
      return;
    }

    try {
      setIsLoadingTopics(true);
      cancelEdit();

      const params = new URLSearchParams();
      params.set("subjectId", subjectFilter);

      const allTopics = await fetchAllPages(
        `/api/topics/admin/all?${params.toString()}`,
        "topics",
        { _tokenType: "admin" },
      );

      setTopics(allTopics);
      setHasLoadedTopics(true);
    } catch (error) {
      console.error("Error loading topics:", error);
      alert(error.message || "Error loading topics");
    } finally {
      setIsLoadingTopics(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const matchesCourse = courseFilter
        ? getCourseId(subject) === courseFilter
        : true;
      const matchesLevel = levelFilter
        ? Number(subject.level) === Number(levelFilter)
        : true;
      return matchesCourse && matchesLevel;
    });
  }, [subjects, courseFilter, levelFilter]);

  useEffect(() => {
    setTopics([]);
    setHasLoadedTopics(false);
    cancelEdit();

    if (
      subjectFilter &&
      !filteredSubjects.some((subject) => subject._id === subjectFilter)
    ) {
      setSubjectFilter("");
    }
  }, [courseFilter, levelFilter]);

  useEffect(() => {
    setTopics([]);
    setHasLoadedTopics(false);
    cancelEdit();
  }, [subjectFilter]);

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const subject = subjectOf(topic);
      const matchesCourse = courseFilter
        ? getCourseId(subject) === courseFilter
        : true;
      const matchesLevel = levelFilter
        ? Number(subject.level) === Number(levelFilter)
        : true;
      const matchesSubject = subjectFilter
        ? subject?._id === subjectFilter
        : true;
      return matchesCourse && matchesLevel && matchesSubject;
    });
  }, [topics, courseFilter, levelFilter, subjectFilter]);

  const startEdit = (topic) => {
    if (isSavingEdit) return;

    setEditingId(topic._id);
    setEditForm({
      name: topic.name || "",
      subjectId: subjectOf(topic)?._id || "",
    });
  };

  const saveEdit = async (id) => {
    if (isSavingEdit) return;

    if (!editForm.name.trim() || !editForm.subjectId) {
      alert("Please enter topic name and select a subject.");
      return;
    }

    try {
      setIsSavingEdit(true);

      await api.put(
        `/api/topics/${id}`,
        { name: editForm.name.trim(), subjectId: editForm.subjectId },
        { _tokenType: "admin" },
      );

      cancelEdit();
      await loadTopics();
    } catch (error) {
      console.error("Error updating topic:", error);
      alert(error.message || "Error updating topic");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const deleteTopic = async (id) => {
    if (isSavingEdit) return;

    if (
      !window.confirm(
        "Delete this topic? Related questions will also be deleted.",
      )
    ) {
      return;
    }

    try {
      await api.delete(`/api/topics/${id}`, { _tokenType: "admin" });
      setTopics((previousTopics) =>
        previousTopics.filter((topic) => topic._id !== id),
      );
    } catch (error) {
      console.error("Error deleting topic:", error);
      alert(error.message || "Error deleting topic");
    }
  };

  const deleteTopicQuestions = async (topic) => {
    const count = topic.questionCount || 0;

    if (count === 0) {
      alert("This topic has no questions to delete.");
      return;
    }

    const confirmed = window.confirm(
      `Delete all ${count} question${count !== 1 ? "s" : ""} under "${topic.name}"? The topic itself will remain.`,
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/questions/admin/topic/${topic._id}/questions`, {
        _tokenType: "admin",
      });

      alert("Questions deleted successfully.");

      setTopics((previousTopics) =>
        previousTopics.map((item) =>
          item._id === topic._id ? { ...item, questionCount: 0 } : item,
        ),
      );
    } catch (error) {
      console.error("Error deleting topic questions:", error);
      alert(error.message || "Error deleting questions under this topic");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "1050px", margin: "0 auto" }}>
        <p style={eyebrowStyle}>Admin / Topics</p>
        <h1 style={headingStyle}>Manage topics</h1>
        <p style={subheadingStyle}>
          Select course, level, and subject, then load only the topics you want
          to manage.
        </p>

        <div style={filterCardStyle}>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            style={inputStyle}
            disabled={isLoadingSetup || isSavingEdit}
          >
            <option value="">All courses</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            style={inputStyle}
            disabled={isLoadingSetup || isSavingEdit}
          >
            <option value="">All levels</option>
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level} Level
              </option>
            ))}
          </select>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            style={inputStyle}
            disabled={isLoadingSetup || isSavingEdit}
          >
            <option value="">Select subject</option>
            {filteredSubjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>

          <button
            onClick={loadTopics}
            style={{
              ...primaryButton,
              opacity:
                isLoadingSetup || isLoadingTopics || isSavingEdit ? 0.6 : 1,
              cursor:
                isLoadingSetup || isLoadingTopics || isSavingEdit
                  ? "not-allowed"
                  : "pointer",
            }}
            disabled={isLoadingSetup || isLoadingTopics || isSavingEdit}
          >
            {isLoadingTopics ? "Loading..." : "Load Topics"}
          </button>

          <button onClick={() => navigate("/admin")} style={secondaryButton}>
            Back to Admin
          </button>
        </div>

        <p
          style={{
            marginBottom: "1.5rem",
            color: "#64748b",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          {hasLoadedTopics
            ? `📋 Showing ${filteredTopics.length} topic(s)`
            : "Select filters, then click Load Topics."}
        </p>

        <div style={cardStyle}>
          {isLoadingSetup ? (
            <p style={emptyStyle}>Loading filters...</p>
          ) : isLoadingTopics ? (
            <p style={emptyStyle}>Loading topics...</p>
          ) : !hasLoadedTopics ? (
            <p style={emptyStyle}>
              Select course, level, and subject, then click Load Topics.
            </p>
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
                        <input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          style={inputStyle}
                        />
                        <select
                          value={editForm.subjectId}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              subjectId: e.target.value,
                            })
                          }
                          style={inputStyle}
                        >
                          <option value="">Select subject</option>
                          {filteredSubjects.map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={buttonRowStyle}>
                        <button
                          onClick={() => saveEdit(topic._id)}
                          style={primaryButton}
                        >
                          Save
                        </button>
                        <button onClick={cancelEdit} style={secondaryButton}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 style={itemTitleStyle}>{topic.name}</h3>
                        <p style={itemMetaStyle}>
                          Subject: {subject?.name || "Deleted subject"} | Course
                          : {getCourseName(subject)} | Level:{" "}
                          {subject?.level || "N/A"}
                        </p>

                        <div style={questionCountStyle}>
                          {topic.questionCount || 0} Question
                          {(topic.questionCount || 0) !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <div style={buttonRowStyle}>
                        <button
                          onClick={() => startEdit(topic)}
                          style={primaryButton}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTopicQuestions(topic)}
                          style={{
                            ...warningButton,
                            opacity:
                              (topic.questionCount || 0) === 0 ? 0.55 : 1,
                            cursor:
                              (topic.questionCount || 0) === 0
                                ? "not-allowed"
                                : "pointer",
                          }}
                          disabled={(topic.questionCount || 0) === 0}
                        >
                          Delete Questions
                        </button>

                        <button
                          onClick={() => deleteTopic(topic._id)}
                          style={dangerButton}
                        >
                          Delete Topic
                        </button>
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

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #f8fbff 0%, #eef4ff 50%, #f7f9fc 100%)",
  padding: "32px 20px",
};
const eyebrowStyle = {
  margin: 0,
  color: "#64748b",
  fontSize: "14px",
  fontWeight: 600,
};
const headingStyle = {
  margin: "10px 0 8px",
  fontSize: "36px",
  color: "#0f172a",
};
const subheadingStyle = {
  margin: "0 0 24px",
  color: "#475569",
  fontSize: "16px",
  lineHeight: 1.6,
};
const filterCardStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "12px",
  marginBottom: "18px",
};
const cardStyle = {
  backgroundColor: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "20px",
  padding: "20px",
  boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
};
const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  flexWrap: "wrap",
  padding: "16px 0",
  borderBottom: "1px solid #e2e8f0",
};
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "10px",
};
const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  boxSizing: "border-box",
  backgroundColor: "white",
};
const buttonRowStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  alignItems: "center",
};
const primaryButton = {
  padding: "10px 14px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#185FA5",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};
const secondaryButton = {
  padding: "10px 14px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  backgroundColor: "white",
  color: "#0f172a",
  fontWeight: 700,
  cursor: "pointer",
};
const dangerButton = {
  padding: "10px 14px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#dc2626",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};
const warningButton = {
  padding: "10px 14px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#f59e0b",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};
const questionCountStyle = {
  fontSize: "13px",
  color: "var(--text-secondary)",
  marginTop: "6px",
  fontWeight: "600",
};
const emptyStyle = { color: "#64748b", textAlign: "center" };
const itemTitleStyle = { margin: "0 0 6px", color: "#0f172a" };
const itemMetaStyle = { margin: 0, color: "#64748b" };

export default ManageTopicsPage;
