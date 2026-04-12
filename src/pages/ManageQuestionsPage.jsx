import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

function ManageQuestionsPage() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [filterSubjectId, setFilterSubjectId] = useState("");
  const [filterTopicId, setFilterTopicId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");

  const [editTopics, setEditTopics] = useState([]);

  const fetchQuestions = async () => {
    try {
      const response = await api.get("/api/questions");
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/api/subjects");
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchFilterTopics = async () => {
      if (!filterSubjectId) {
        setTopics([]);
        setFilterTopicId("");
        return;
      }

      try {
        const response = await api.get(
          `/api/topics/subject/${filterSubjectId}`,
        );
        setTopics(response.data);
        setFilterTopicId("");
      } catch (error) {
        console.error("Error fetching filter topics:", error);
      }
    };

    fetchFilterTopics();
  }, [filterSubjectId]);

  useEffect(() => {
    const fetchEditTopics = async () => {
      if (!editingId || !subjectId) {
        setEditTopics([]);
        return;
      }

      try {
        const response = await api.get(`/api/topics/subject/${subjectId}`);
        setEditTopics(response.data);
      } catch (error) {
        console.error("Error fetching edit topics:", error);
      }
    };

    fetchEditTopics();
  }, [editingId, subjectId]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const currentSubjectId = question.subjectId?._id || question.subjectId;
      const currentTopicId = question.topicId?._id || question.topicId;

      const matchesSubject =
        !filterSubjectId || currentSubjectId === filterSubjectId;

      const matchesTopic = !filterTopicId || currentTopicId === filterTopicId;

      const lowerSearch = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !lowerSearch ||
        question.questionText.toLowerCase().includes(lowerSearch) ||
        question.correctAnswer.toLowerCase().includes(lowerSearch) ||
        question.explanation.toLowerCase().includes(lowerSearch) ||
        question.options.some((option) =>
          option.toLowerCase().includes(lowerSearch),
        );

      return matchesSubject && matchesTopic && matchesSearch;
    });
  }, [questions, filterSubjectId, filterTopicId, searchTerm]);

  const startEdit = async (question) => {
    const currentSubjectId =
      question.subjectId?._id || question.subjectId || "";
    const currentTopicId = question.topicId?._id || question.topicId || "";

    setEditingId(question._id);
    setSubjectId(currentSubjectId);
    setTopicId(currentTopicId);
    setQuestionText(question.questionText);
    setOptions(question.options.length ? question.options : ["", "", "", ""]);
    setCorrectAnswer(question.correctAnswer);
    setExplanation(question.explanation);

    try {
      const response = await api.get(`/api/topics/subject/${currentSubjectId}`);
      setEditTopics(response.data);
    } catch (error) {
      console.error("Error loading topics for editing:", error);
      setEditTopics([]);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSubjectId("");
    setTopicId("");
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
    setExplanation("");
    setEditTopics([]);
  };

  const handleEditSubjectChange = async (newSubjectId) => {
    setSubjectId(newSubjectId);
    setTopicId("");

    if (!newSubjectId) {
      setEditTopics([]);
      return;
    }

    try {
      const response = await api.get(`/api/topics/subject/${newSubjectId}`);
      setEditTopics(response.data);
    } catch (error) {
      console.error("Error fetching topics for selected subject:", error);
      setEditTopics([]);
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);

    const cleanedOptions = updatedOptions
      .map((option) => option.trim())
      .filter((option) => option !== "");

    if (correctAnswer && !cleanedOptions.includes(correctAnswer)) {
      setCorrectAnswer("");
    }
  };

  const addOptionField = () => {
    if (options.length >= 6) return;
    setOptions((prev) => [...prev, ""]);
  };

  const removeOptionField = (indexToRemove) => {
    if (options.length <= 2) return;

    const updatedOptions = options.filter(
      (_, index) => index !== indexToRemove,
    );
    setOptions(updatedOptions);

    const cleanedOptions = updatedOptions
      .map((option) => option.trim())
      .filter((option) => option !== "");

    if (correctAnswer && !cleanedOptions.includes(correctAnswer)) {
      setCorrectAnswer("");
    }
  };

  const handleUpdate = async (id) => {
    const cleanedOptions = options
      .map((option) => option.trim())
      .filter((option) => option !== "");

    if (!subjectId) {
      alert("Please select a subject.");
      return;
    }

    if (!topicId) {
      alert("Please select a topic.");
      return;
    }

    if (!questionText.trim()) {
      alert("Please enter the question text.");
      return;
    }

    if (cleanedOptions.length < 2) {
      alert("Please provide at least two options.");
      return;
    }

    if (!correctAnswer) {
      alert("Please select the correct answer.");
      return;
    }

    if (!cleanedOptions.includes(correctAnswer)) {
      alert("Correct answer must match one of the options.");
      return;
    }

    if (!explanation.trim()) {
      alert("Please enter the explanation.");
      return;
    }

    try {
      await api.put(`/api/questions/${id}`, {
        subjectId,
        topicId,
        questionText: questionText.trim(),
        options: cleanedOptions,
        correctAnswer,
        explanation: explanation.trim(),
      });

      alert("Question updated successfully");
      cancelEdit();
      fetchQuestions();
    } catch (error) {
      console.error("Error updating question:", error);
      alert("Error updating question");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/questions/${id}`);
      alert("Question deleted successfully");
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Error deleting question");
    }
  };

  const currentValidOptions = options
    .map((option) => option.trim())
    .filter((option) => option !== "");

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fbff 0%, #eef4ff 50%, #f7f9fc 100%)",
        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Admin / Manage questions
          </p>
          <h1
            style={{
              margin: "10px 0 8px",
              fontSize: "36px",
              color: "#0f172a",
            }}
          >
            Edit and delete questions
          </h1>
          <p
            style={{
              margin: 0,
              color: "#475569",
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            Filter by subject, topic, and keyword to manage large question banks
            more easily.
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
              marginBottom: "24px",
            }}
          >
            <div>
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
                  boxSizing: "border-box",
                  backgroundColor: "white",
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

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#0f172a",
                }}
              >
                Filter by Topic
              </label>
              <select
                value={filterTopicId}
                onChange={(e) => setFilterTopicId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  boxSizing: "border-box",
                  backgroundColor: "white",
                }}
                disabled={!filterSubjectId}
              >
                <option value="">
                  {filterSubjectId ? "All Topics" : "Select subject first"}
                </option>
                {topics.map((topic) => (
                  <option key={topic._id} value={topic._id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#0f172a",
                }}
              >
                Search
              </label>
              <input
                type="text"
                placeholder="Search question, option, answer, explanation"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <p style={{ color: "#64748b", marginBottom: "18px" }}>
            Showing {filteredQuestions.length} question
            {filteredQuestions.length === 1 ? "" : "s"}
          </p>

          {filteredQuestions.length === 0 ? (
            <p>No matching questions found.</p>
          ) : (
            filteredQuestions.map((question, index) => (
              <div
                key={question._id}
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  padding: "18px 0",
                }}
              >
                {editingId === question._id ? (
                  <>
                    <select
                      value={subjectId}
                      onChange={(e) => handleEditSubjectChange(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom: "10px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        boxSizing: "border-box",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={topicId}
                      onChange={(e) => setTopicId(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom: "10px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        boxSizing: "border-box",
                        backgroundColor: "white",
                      }}
                      disabled={!subjectId}
                    >
                      <option value="">
                        {subjectId ? "Select Topic" : "Select subject first"}
                      </option>
                      {editTopics.map((topic) => (
                        <option key={topic._id} value={topic._id}>
                          {topic.name}
                        </option>
                      ))}
                    </select>

                    <textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      rows="3"
                      placeholder="Question text"
                      style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom: "10px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        boxSizing: "border-box",
                        resize: "vertical",
                      }}
                    />

                    {options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                          marginBottom: "10px",
                        }}
                      >
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(optionIndex, e.target.value)
                          }
                          placeholder={`Option ${optionIndex + 1}`}
                          style={{
                            flex: 1,
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            boxSizing: "border-box",
                          }}
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOptionField(optionIndex)}
                            style={{
                              padding: "10px 14px",
                              border: "1px solid #fecaca",
                              borderRadius: "8px",
                              backgroundColor: "#fff5f5",
                              color: "#dc2626",
                              cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}

                    <div style={{ marginBottom: "10px" }}>
                      <button
                        type="button"
                        onClick={addOptionField}
                        disabled={options.length >= 6}
                        style={{
                          padding: "10px 16px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          backgroundColor: "white",
                          cursor:
                            options.length >= 6 ? "not-allowed" : "pointer",
                          opacity: options.length >= 6 ? 0.5 : 1,
                        }}
                      >
                        Add Option
                      </button>
                    </div>

                    <select
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom: "10px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        boxSizing: "border-box",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="">Select Correct Answer</option>
                      {currentValidOptions.map((option, optionIndex) => (
                        <option key={optionIndex} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <textarea
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      rows="3"
                      placeholder="Explanation"
                      style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom: "10px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        boxSizing: "border-box",
                        resize: "vertical",
                      }}
                    />

                    <div
                      style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                    >
                      <button
                        onClick={() => handleUpdate(question._id)}
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
                  <div>
                    <p style={{ margin: "0 0 6px", color: "#64748b" }}>
                      Subject: {question.subjectId?.name || "Unknown"}
                    </p>
                    <p style={{ margin: "0 0 8px", color: "#64748b" }}>
                      Topic: {question.topicId?.name || "Unknown"}
                    </p>
                    <h3 style={{ margin: "0 0 10px", color: "#0f172a" }}>
                      {index + 1}. {question.questionText}
                    </h3>
                    <p style={{ margin: "0 0 10px", color: "#64748b" }}>
                      Correct Answer: {question.correctAnswer}
                    </p>

                    <div
                      style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                    >
                      <button
                        onClick={() => startEdit(question)}
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
                        onClick={() => handleDelete(question._id)}
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
            ))
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

export default ManageQuestionsPage;
