import { useEffect, useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

function BulkImportQuestionsPage() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await api.get("/api/subjects");
        setSubjects(response.data);
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
        const response = await api.get(`/api/topics/subject/${subjectId}`);
        setTopics(response.data);
        setTopicId("");
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, [subjectId]);

  const sampleJson = `[
  {
    "questionText": "What is 2 + 2?",
    "options": ["2", "3", "4", "5"],
    "correctAnswer": "4",
    "explanation": "2 + 2 equals 4."
  },
  {
    "questionText": "What is the capital of France?",
    "options": ["Berlin", "Madrid", "Paris", "Rome"],
    "correctAnswer": "Paris",
    "explanation": "Paris is the capital of France."
  }
]`;

  const sanitizeJsonInput = (input) => {
    return input
      .replace(/\[span_\d+\]\(start_span\)/g, "")
      .replace(/\[span_\d+\]\(end_span\)/g, "")
      .replace(/\[span_\d+\]/g, "")
      .replace(/\(start_span\)/g, "")
      .replace(/\(end_span\)/g, "")
      .replace(/\u00A0/g, " ")
      .trim();
  };

  const handleImport = async (e) => {
    e.preventDefault();

    if (!subjectId) {
      alert("Please select a subject");
      return;
    }

    if (!topicId) {
      alert("Please select a topic");
      return;
    }

    let parsedQuestions;

    try {
      const cleanedInput = sanitizeJsonInput(jsonInput);
      parsedQuestions = JSON.parse(cleanedInput);
    } catch (error) {
      console.error("JSON parse error:", error);
      alert("Invalid JSON format");
      return;
    }

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      alert("JSON must be a non-empty array");
      return;
    }

    const normalizedQuestions = parsedQuestions.map((question) => ({
      questionText: (question.questionText || "").trim(),
      options: Array.isArray(question.options)
        ? question.options
            .map((option) => String(option).trim())
            .filter((option) => option !== "")
        : [],
      correctAnswer: (question.correctAnswer || "").trim(),
      explanation: (question.explanation || "").trim(),
      topicId,
    }));

    for (const question of normalizedQuestions) {
      if (!question.questionText) {
        alert("Each question must have questionText");
        return;
      }

      if (!Array.isArray(question.options) || question.options.length < 2) {
        alert("Each question must have at least 2 options");
        return;
      }

      if (!question.correctAnswer) {
        alert("Each question must have a correctAnswer");
        return;
      }

      if (!question.options.includes(question.correctAnswer)) {
        alert("Each correct answer must match one of its options");
        return;
      }

      if (!question.explanation) {
        alert("Each question must have an explanation");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const response = await api.post("/api/questions/bulk", {
        subjectId,
        questions: normalizedQuestions,
      });

      alert(response.data.message || "Questions imported successfully");
      setJsonInput("");
      setTopicId("");
    } catch (error) {
      console.error("Error importing questions:", error);
      alert("Error importing questions");
    } finally {
      setIsSubmitting(false);
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
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Admin / Bulk question import
          </p>
          <h1
            style={{
              margin: "10px 0 8px",
              fontSize: "36px",
              color: "#0f172a",
            }}
          >
            Import many questions at once
          </h1>
          <p
            style={{
              margin: 0,
              color: "#475569",
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            Select a subject, choose a topic, then paste a JSON array of
            questions to import them all in one step.
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
          <form onSubmit={handleImport}>
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
                    backgroundColor: "white",
                    boxSizing: "border-box",
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
                    backgroundColor: "white",
                    boxSizing: "border-box",
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

            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#0f172a",
                }}
              >
                JSON Array
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste your JSON array here"
                rows="18"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  fontFamily: "monospace",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
                required
              />
            </div>

            <details style={{ marginBottom: "20px" }}>
              <summary
                style={{
                  cursor: "pointer",
                  color: "#185FA5",
                  fontWeight: "600",
                }}
              >
                Show sample JSON format
              </summary>
              <pre
                style={{
                  marginTop: "12px",
                  backgroundColor: "#f8fafc",
                  padding: "16px",
                  borderRadius: "10px",
                  overflowX: "auto",
                  fontSize: "13px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {sampleJson}
              </pre>
            </details>

            <p
              style={{
                marginTop: 0,
                marginBottom: "20px",
                color: "#64748b",
                fontSize: "13px",
                lineHeight: "1.6",
              }}
            >
              The importer automatically cleans copied markers like
              <code> [span_0](start_span) </code> before parsing.
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: "14px 22px",
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor: "#185FA5",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? "Importing..." : "Import Questions"}
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

export default BulkImportQuestionsPage;