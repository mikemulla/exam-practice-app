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

function AddQuestionPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  const [courseId, setCourseId] = useState("");
  const [level, setLevel] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");

  const [questionText, setQuestionText] = useState("");
  const [optionCount, setOptionCount] = useState(4);
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
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
        console.error("Error loading data:", error);
        alert(error.message || "Failed to load courses and subjects");
      }
    };

    fetchInitialData();
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
          {
            _tokenType: "admin",
          },
        );

        setTopics(apiArray(response.data, "topics"));
        setTopicId("");
      } catch (error) {
        console.error("Error fetching topics:", error);
        alert(error.message || "Failed to load topics");
      }
    };

    fetchTopics();
  }, [subjectId]);

  const handleOptionCountChange = (e) => {
    const count = Number(e.target.value);
    setOptionCount(count);

    const newOptions = [...options];

    if (count > newOptions.length) {
      while (newOptions.length < count) newOptions.push("");
    } else {
      newOptions.length = count;
    }

    setOptions(newOptions);

    if (!newOptions.map((o) => o.trim()).includes(correctAnswer)) {
      setCorrectAnswer("");
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);

    const cleaned = updatedOptions.map((option) => option.trim());
    if (correctAnswer && !cleaned.includes(correctAnswer)) {
      setCorrectAnswer("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedOptions = options
      .map((option) => option.trim())
      .filter(Boolean);

    if (!courseId) return alert("Please select a course");
    if (!level) return alert("Please select a level");
    if (!subjectId) return alert("Please select a subject");
    if (!topicId) return alert("Please select a topic");
    if (cleanedOptions.length < 2)
      return alert("Please enter at least 2 options");
    if (!correctAnswer) return alert("Please select the correct answer");

    try {
      await api.post(
        "/api/questions",
        {
          subjectId,
          topicId,
          questionText: questionText.trim(),
          options: cleanedOptions,
          correctAnswer,
          explanation: explanation.trim(),
        },
        {
          _tokenType: "admin",
        },
      );

      alert("Question saved successfully");

      setQuestionText("");
      setOptionCount(4);
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
      setExplanation("");
    } catch (error) {
      console.error("Error saving question:", error);
      alert(error.message || "Error saving question");
    }
  };

  const validOptions = options.map((option) => option.trim()).filter(Boolean);

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <p style={eyebrowStyle}>Admin / Question builder</p>
          <h1 style={headingStyle}>Add a new question</h1>
          <p style={subheadingStyle}>
            Select course, level, subject, and topic before creating the
            question.
          </p>
        </div>

        <div style={cardStyle}>
          <form onSubmit={handleSubmit}>
            <div style={gridStyle}>
              <Field label="Course">
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Level">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">Select Level</option>
                  {levels.map((item) => (
                    <option key={item} value={item}>
                      {item} Level
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Subject">
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  style={inputStyle}
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
              </Field>

              <Field label="Topic">
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  style={inputStyle}
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
              </Field>
            </div>

            <Field label="Question Text">
              <textarea
                placeholder="Enter the question here"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows="4"
                style={textareaStyle}
                required
              />
            </Field>

            <Field label="Number of Options">
              <select
                value={optionCount}
                onChange={handleOptionCountChange}
                style={inputStyle}
              >
                {[2, 3, 4, 5, 6].map((count) => (
                  <option key={count} value={count}>
                    {count} Options
                  </option>
                ))}
              </select>
            </Field>

            <div style={gridStyle}>
              {options.map((option, index) => (
                <Field key={index} label={`Option ${index + 1}`}>
                  <input
                    type="text"
                    placeholder={`Enter option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    style={inputStyle}
                    required
                  />
                </Field>
              ))}
            </div>

            <Field label="Correct Answer">
              <select
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                style={inputStyle}
                required
              >
                <option value="">Select Correct Answer</option>
                {validOptions.map((option, index) => (
                  <option key={`${option}-${index}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Explanation">
              <textarea
                placeholder="Explain why the answer is correct"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows="4"
                style={textareaStyle}
                required
              />
            </Field>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button type="submit" style={primaryButton}>
                Save Question
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin")}
                style={secondaryButton}
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

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={labelStyle}>{label}</label>
      {children}
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
  fontWeight: "600",
};

const headingStyle = {
  margin: "10px 0 8px",
  fontSize: "36px",
  color: "#0f172a",
};

const subheadingStyle = {
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

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
  color: "#0f172a",
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
  backgroundColor: "white",
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
};

const primaryButton = {
  padding: "14px 22px",
  border: "none",
  borderRadius: "10px",
  backgroundColor: "#185FA5",
  color: "white",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
};

const secondaryButton = {
  padding: "14px 22px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  backgroundColor: "white",
  color: "#0f172a",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
};

export default AddQuestionPage;
