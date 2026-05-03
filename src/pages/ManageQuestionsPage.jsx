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

const subjectOfQuestion = (question) => question?.subjectId || {};
const topicOfQuestion = (question) => question?.topicId || {};
const getCourseId = (subject) => typeof subject?.courseId === "object" ? subject.courseId?._id : subject?.courseId;
const getCourseName = (subject) => typeof subject?.courseId === "object" ? subject.courseId?.name : "Not available";

function ManageQuestionsPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [courseFilter, setCourseFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    subjectId: "",
    topicId: "",
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [coursesRes, subjectsRes, topicsRes, questionsRes] = await Promise.all([
        api.get("/api/courses"),
        api.get("/api/subjects/admin/all?limit=100", { _tokenType: "admin" }),
        api.get("/api/topics/admin/all?limit=100", { _tokenType: "admin" }),
        api.get("/api/questions/admin/all?limit=100", { _tokenType: "admin" }),
      ]);
      setCourses(apiArray(coursesRes.data, "courses"));
      setSubjects(apiArray(subjectsRes.data, "subjects"));
      setTopics(apiArray(topicsRes.data, "topics"));
      setQuestions(apiArray(questionsRes.data, "questions"));
    } catch (error) {
      console.error("Error loading questions:", error);
      alert(error.message || "Error loading questions");
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

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const subject = topic.subjectId || {};
      const matchesCourse = courseFilter ? getCourseId(subject) === courseFilter : true;
      const matchesLevel = levelFilter ? Number(subject.level) === Number(levelFilter) : true;
      const matchesSubject = subjectFilter ? subject?._id === subjectFilter : true;
      return matchesCourse && matchesLevel && matchesSubject;
    });
  }, [topics, courseFilter, levelFilter, subjectFilter]);

  useEffect(() => {
    if (subjectFilter && !filteredSubjects.some((subject) => subject._id === subjectFilter)) {
      setSubjectFilter("");
      setTopicFilter("");
    }
  }, [filteredSubjects, subjectFilter]);

  useEffect(() => {
    if (topicFilter && !filteredTopics.some((topic) => topic._id === topicFilter)) {
      setTopicFilter("");
    }
  }, [filteredTopics, topicFilter]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const subject = subjectOfQuestion(question);
      const topic = topicOfQuestion(question);
      const matchesCourse = courseFilter ? getCourseId(subject) === courseFilter : true;
      const matchesLevel = levelFilter ? Number(subject.level) === Number(levelFilter) : true;
      const matchesSubject = subjectFilter ? subject?._id === subjectFilter : true;
      const matchesTopic = topicFilter ? topic?._id === topicFilter : true;
      return matchesCourse && matchesLevel && matchesSubject && matchesTopic;
    });
  }, [questions, courseFilter, levelFilter, subjectFilter, topicFilter]);

  const startEdit = (question) => {
    const options = Array.isArray(question.options) ? question.options : [];
    setEditingId(question._id);
    setEditForm({
      subjectId: subjectOfQuestion(question)?._id || "",
      topicId: topicOfQuestion(question)?._id || "",
      questionText: question.questionText || "",
      options: [...options, "", "", "", "", "", ""].slice(0, Math.max(4, options.length)),
      correctAnswer: question.correctAnswer || "",
      explanation: question.explanation || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ subjectId: "", topicId: "", questionText: "", options: ["", "", "", ""], correctAnswer: "", explanation: "" });
  };

  const editTopics = useMemo(() => {
    return topics.filter((topic) => {
      const subject = topic.subjectId || {};
      return editForm.subjectId ? subject?._id === editForm.subjectId : true;
    });
  }, [topics, editForm.subjectId]);

  const updateOption = (index, value) => {
    const next = [...editForm.options];
    next[index] = value;
    setEditForm({ ...editForm, options: next });
  };

  const saveEdit = async (id) => {
    const options = editForm.options.map((option) => option.trim()).filter(Boolean);

    if (!editForm.subjectId || !editForm.topicId || !editForm.questionText.trim() || options.length < 2 || !editForm.correctAnswer.trim() || !editForm.explanation.trim()) {
      alert("Please complete all question fields. At least two options are required.");
      return;
    }

    try {
      await api.put(
        `/api/questions/${id}`,
        {
          subjectId: editForm.subjectId,
          topicId: editForm.topicId,
          questionText: editForm.questionText.trim(),
          options,
          correctAnswer: editForm.correctAnswer.trim(),
          explanation: editForm.explanation.trim(),
        },
        { _tokenType: "admin" },
      );
      cancelEdit();
      fetchData();
    } catch (error) {
      console.error("Error updating question:", error);
      alert(error.message || "Error updating question");
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;

    try {
      await api.delete(`/api/questions/${id}`, { _tokenType: "admin" });
      fetchData();
    } catch (error) {
      console.error("Error deleting question:", error);
      alert(error.message || "Error deleting question");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <p style={eyebrowStyle}>Admin / Questions</p>
        <h1 style={headingStyle}>Manage questions</h1>
        <p style={subheadingStyle}>Filter questions by course, level, subject, and topic.</p>

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

          <select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)} style={inputStyle}>
            <option value="">All topics</option>
            {filteredTopics.map((topic) => <option key={topic._id} value={topic._id}>{topic.name}</option>)}
          </select>

          <button onClick={() => navigate("/admin")} style={secondaryButton}>Back to Admin</button>
        </div>

        <div style={countStyle}>Showing {filteredQuestions.length} question(s)</div>

        <div style={cardStyle}>
          {isLoading ? (
            <p style={emptyStyle}>Loading questions...</p>
          ) : filteredQuestions.length === 0 ? (
            <p style={emptyStyle}>No questions found.</p>
          ) : (
            filteredQuestions.map((question, index) => {
              const subject = subjectOfQuestion(question);
              const topic = topicOfQuestion(question);

              return (
                <div key={question._id} style={rowStyle}>
                  {editingId === question._id ? (
                    <div style={{ width: "100%" }}>
                      <div style={gridStyle}>
                        <select value={editForm.subjectId} onChange={(e) => setEditForm({ ...editForm, subjectId: e.target.value, topicId: "" })} style={inputStyle}>
                          <option value="">Select subject</option>
                          {subjects.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
                        </select>
                        <select value={editForm.topicId} onChange={(e) => setEditForm({ ...editForm, topicId: e.target.value })} style={inputStyle}>
                          <option value="">Select topic</option>
                          {editTopics.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
                        </select>
                      </div>

                      <textarea value={editForm.questionText} onChange={(e) => setEditForm({ ...editForm, questionText: e.target.value })} style={textareaStyle} placeholder="Question text" />

                      <div style={gridStyle}>
                        {editForm.options.map((option, optionIndex) => (
                          <input key={optionIndex} value={option} onChange={(e) => updateOption(optionIndex, e.target.value)} style={inputStyle} placeholder={`Option ${optionIndex + 1}`} />
                        ))}
                      </div>

                      <input value={editForm.correctAnswer} onChange={(e) => setEditForm({ ...editForm, correctAnswer: e.target.value })} style={inputStyle} placeholder="Correct answer, must match one option" />
                      <textarea value={editForm.explanation} onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })} style={textareaStyle} placeholder="Explanation" />

                      <div style={buttonRowStyle}>
                        <button onClick={() => saveEdit(question._id)} style={primaryButton}>Save</button>
                        <button onClick={cancelEdit} style={secondaryButton}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ flex: 1 }}>
                        <h3 style={itemTitleStyle}>Question {index + 1}</h3>
                        <p style={itemMetaStyle}>Course: {getCourseName(subject)} | Level: {subject?.level || "N/A"} | Subject: {subject?.name || "Deleted subject"} | Topic: {topic?.name || "Deleted topic"}</p>
                        <p style={questionTextStyle}>{question.questionText}</p>
                        <ol style={{ marginTop: "8px", color: "#475569" }}>
                          {(question.options || []).map((option) => <li key={option}>{option}</li>)}
                        </ol>
                        <p style={itemMetaStyle}><strong>Answer:</strong> {question.correctAnswer}</p>
                        <p style={itemMetaStyle}><strong>Explanation:</strong> {question.explanation}</p>
                      </div>
                      <div style={buttonRowStyle}>
                        <button onClick={() => startEdit(question)} style={primaryButton}>Edit</button>
                        <button onClick={() => deleteQuestion(question._id)} style={dangerButton}>Delete</button>
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
const filterCardStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "12px", marginBottom: "18px" };
const cardStyle = { backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "20px", boxShadow: "0 12px 30px rgba(15,23,42,0.06)" };
const rowStyle = { display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", padding: "18px 0", borderBottom: "1px solid #e2e8f0" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", marginBottom: "10px" };
const inputStyle = { width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", boxSizing: "border-box", backgroundColor: "white" };
const textareaStyle = { ...inputStyle, minHeight: "95px", resize: "vertical", marginBottom: "10px" };
const buttonRowStyle = { display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-start" };
const primaryButton = { padding: "10px 14px", border: "none", borderRadius: "8px", backgroundColor: "#185FA5", color: "white", fontWeight: 700, cursor: "pointer" };
const secondaryButton = { padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", backgroundColor: "white", color: "#0f172a", fontWeight: 700, cursor: "pointer" };
const dangerButton = { padding: "10px 14px", border: "none", borderRadius: "8px", backgroundColor: "#dc2626", color: "white", fontWeight: 700, cursor: "pointer" };
const countStyle = { marginBottom: "12px", color: "#475569", fontWeight: 700 };
const emptyStyle = { color: "#64748b", textAlign: "center" };
const itemTitleStyle = { margin: "0 0 6px", color: "#0f172a" };
const itemMetaStyle = { margin: "0 0 6px", color: "#64748b", lineHeight: 1.5 };
const questionTextStyle = { margin: "10px 0 0", color: "#0f172a", lineHeight: 1.6 };

export default ManageQuestionsPage;
