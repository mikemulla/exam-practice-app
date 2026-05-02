import { useEffect, useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

const apiArray = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};


function AddQuestionPage() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [optionCount, setOptionCount] = useState(4);
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const adminToken = localStorage.getItem("adminToken");
        const response = await api.get("/api/subjects/admin/all", { _tokenType: "admin" });
        setSubjects(apiArray(response.data, "subjects"));
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!subjectId) {
        setTopics([]);
        setTopicId("");
        return;
      }

      try {
        const adminToken = localStorage.getItem("adminToken");
        const response = await api.get(`/api/topics/subject/${subjectId}`, { _tokenType: "admin" });
        setTopics(apiArray(response.data, "topics"));
        setTopicId("");
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, [subjectId]);

  const handleOptionCountChange = (e) => {
    const count = Number(e.target.value);
    setOptionCount(count);

    const newOptions = [...options];

    if (count > newOptions.length) {
      while (newOptions.length < count) {
        newOptions.push("");
      }
    } else {
      newOptions.length = count;
    }

    setOptions(newOptions);

    if (!newOptions.includes(correctAnswer)) {
      setCorrectAnswer("");
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);

    if (
      correctAnswer &&
      updatedOptions[index] !== correctAnswer &&
      !updatedOptions.includes(correctAnswer)
    ) {
      setCorrectAnswer("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedOptions = options
      .map((option) => option.trim())
      .filter((option) => option !== "");

    if (!subjectId) {
      alert("Please select a subject");
      return;
    }

    if (!topicId) {
      alert("Please select a topic");
      return;
    }

    if (cleanedOptions.length < 2) {
      alert("Please enter at least 2 options");
      return;
    }

    if (!correctAnswer) {
      alert("Please select the correct answer");
      return;
    }

    try {
      const adminToken = localStorage.getItem("adminToken");

      await api.post(
        "/api/questions",
        {
          subjectId,
          topicId,
          questionText,
          options: cleanedOptions,
          correctAnswer,
          explanation,
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );

      alert("Question saved successfully");

      setSubjectId("");
      setTopicId("");
      setTopics([]);
      setQuestionText("");
      setOptionCount(4);
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
      setExplanation("");
    } catch (error) {
      console.error("Error saving question:", error);
      alert("Error saving question");
    }
  };

  const validOptions = options
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
      <div style={{ maxWidth: "850px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Admin / Question builder
          </p>
          <h1
            style={{
              margin: "10px 0 8px",
              fontSize: "36px",
              color: "#0f172a",
            }}
          >
            Add a new question
          </h1>
          <p
            style={{
              margin: 0,
              color: "#475569",
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            Select a subject, choose a topic under it, then create your
            question.
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
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
                marginBottom: "20px",
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
                  Subject
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "15px",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "white",
                  }}
                  required
                >
                  <option value="">Select Subject</option>
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
                  Topic
                </label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "15px",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "white",
                  }}
                  required
                  disabled={!subjectId}
                >
                  <option value="">
                    {subjectId ? "Select Topic" : "Select subject first"}
                  </option>
                  {topics.map((topic) => (
                    <option key={topic._id} value={topic._id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#0f172a",
                }}
              >
                Question Text
              </label>
              <textarea
                placeholder="Enter the question here"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows="4"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
                required
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#0f172a",
                }}
              >
                Number of Options
              </label>
              <select
                value={optionCount}
                onChange={handleOptionCountChange}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                  backgroundColor: "white",
                }}
              >
                <option value={2}>2 Options</option>
                <option value={3}>3 Options</option>
                <option value={4}>4 Options</option>
                <option value={5}>5 Options</option>
                <option value={6}>6 Options</option>
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              {options.map((option, index) => (
                <div key={index}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: "#0f172a",
                    }}
                  >
                    Option {index + 1}
                  </label>
                  <input
                    type="text"
                    placeholder={`Enter option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "15px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    required
                  />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#0f172a",
                }}
              >
                Correct Answer
              </label>
              <select
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                  backgroundColor: "white",
                }}
                required
              >
                <option value="">Select Correct Answer</option>
                {validOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#0f172a",
                }}
              >
                Explanation
              </label>
              <textarea
                placeholder="Explain why the answer is correct"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows="4"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
                required
              />
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="submit"
                style={{
                  padding: "14px 22px",
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor: "#185FA5",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Save Question
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin")}
                style={{
                  padding: "14px 22px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  backgroundColor: "white",
                  color: "#0f172a",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
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

export default AddQuestionPage;
