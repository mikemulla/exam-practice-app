import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

const apiArray = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const levels = [100, 200, 300, 400, 500, 600];

function BulkImportQuestionsPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  const [courseId, setCourseId] = useState("");
  const [level, setLevel] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, subjectRes] = await Promise.all([
          api.get("/api/courses"),
          api.get("/api/subjects/admin/all?limit=100", {
            _tokenType: "admin",
          }),
        ]);

        setCourses(apiArray(courseRes.data, "courses"));
        setSubjects(apiArray(subjectRes.data, "subjects"));
      } catch (error) {
        console.error("Error fetching data:", error);
        alert(error.message || "Error loading courses and subjects");
      }
    };

    fetchData();
  }, []);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const subjectCourseId =
        typeof subject.courseId === "object"
          ? subject.courseId?._id
          : subject.courseId;

      const courseMatches = courseId ? subjectCourseId === courseId : true;
      const levelMatches = level
        ? Number(subject.level) === Number(level)
        : true;

      return courseMatches && levelMatches;
    });
  }, [subjects, courseId, level]);

  useEffect(() => {
    setSubjectId("");
    setTopicId("");
    setTopics([]);
  }, [courseId, level]);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!subjectId) {
        setTopics([]);
        setTopicId("");
        return;
      }

      try {
        const response = await api.get(
          `/api/topics/admin/all?subjectId=${subjectId}&limit=100`,
          { _tokenType: "admin" },
        );

        setTopics(apiArray(response.data, "topics"));
        setTopicId("");
      } catch (error) {
        console.error("Error fetching topics:", error);
        alert(error.message || "Error loading topics");
      }
    };

    fetchTopics();
  }, [subjectId]);

  const sampleJson = `[
  {
    "questionText" : "What is 2 + 2?",
    "options"      : ["2", "3", "4", "5"],
    "correctAnswer": "4",
    "explanation"  : "2 + 2 equals 4."
  },
  {
    "questionText" : "What is the capital of France?",
    "options"      : ["Berlin", "Madrid", "Paris", "Rome"],
    "correctAnswer": "Paris",
    "explanation"  : "Paris is the capital of France."
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

    if (!courseId) {
      alert("Please select a course");
      return;
    }

    if (!level) {
      alert("Please select a level");
      return;
    }

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

      const response = await api.post(
        "/api/questions/bulk",
        {
          subjectId,
          questions: normalizedQuestions,
        },
        { _tokenType: "admin" },
      );

      alert(response.data.message || "Questions imported successfully");
      setJsonInput("");
      setTopicId("");
    } catch (error) {
      console.error("Error importing questions:", error);
      alert(error.message || "Error importing questions");
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
            Select a course, level, subject, and topic, then paste a JSON array
            of questions to import them all in one step.
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
                <label style={labelStyle}>Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  style={selectStyle}
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  style={selectStyle}
                  required
                >
                  <option value="">Select Level</option>
                  {levels.map((item) => (
                    <option key={item} value={item}>
                      {item} Level
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  style={selectStyle}
                  required
                  disabled={!courseId || !level}
                >
                  <option value="">
                    {!courseId || !level
                      ? "Select course and level first"
                      : "Select Subject"}
                  </option>
                  {filteredSubjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Topic</label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  style={selectStyle}
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
              <label style={labelStyle}>JSON Array</label>
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

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
  color: "#0f172a",
};

const selectStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  fontSize: "15px",
  backgroundColor: "white",
  boxSizing: "border-box",
};

export default BulkImportQuestionsPage;
