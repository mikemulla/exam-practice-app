import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";

const styles = {
  page: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "2rem 1rem",
    fontFamily: "system-ui, sans-serif",
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "1.25rem 1.5rem",
  },
  btnBase: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    border: "1px solid rgba(0,0,0,0.15)",
    background: "transparent",
    color: "inherit",
  },
  btnPrimary: {
    background: "#185FA5",
    color: "#fff",
    border: "1px solid #185FA5",
  },
};

const shuffleArray = (array) => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M10 12L6 8l4-4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="9" r="6" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M8 6v3l2 1.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M6 1h4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckCircle() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path
        d="M8 16l5 5 11-11"
        stroke="#185FA5"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SubjectTestPage() {
  const { subjectId, topicId } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);

  const isTopicMode = Boolean(topicId);
  const defaultDuration = subject?.duration || 300;

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        if (isTopicMode) {
          const [topicResponse, questionsResponse] = await Promise.all([
            api.get("/api/topics"),
            api.get(`/api/questions/topic/${topicId}`),
          ]);

          const selectedTopic = topicResponse.data.find(
            (t) => t._id === topicId,
          );

          if (!selectedTopic) {
            throw new Error("Topic not found");
          }

          const resolvedSubjectId =
            selectedTopic.subjectId?._id || selectedTopic.subjectId;

          const subjectResponse = await api.get(
            `/api/subjects/${resolvedSubjectId}`,
          );

          const uniqueQuestions = Array.from(
            new Map(questionsResponse.data.map((q) => [q._id, q])).values(),
          );

          const randomizedQuestions = shuffleArray(
            uniqueQuestions.map((question) => ({
              ...question,
              options: shuffleArray(question.options),
            })),
          );

          setTopic(selectedTopic);
          setSubject(subjectResponse.data);
          setQuestions(randomizedQuestions);
        } else {
          const [subjectResponse, questionsResponse] = await Promise.all([
            api.get(`/api/subjects/${subjectId}`),
            api.get(`/api/questions/subject/${subjectId}`),
          ]);

          const uniqueQuestions = Array.from(
            new Map(questionsResponse.data.map((q) => [q._id, q])).values(),
          );

          const randomizedQuestions = shuffleArray(
            uniqueQuestions.map((question) => ({
              ...question,
              options: shuffleArray(question.options),
            })),
          );

          setTopic(null);
          setSubject(subjectResponse.data);
          setQuestions(randomizedQuestions);
        }

        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
      } catch (error) {
        console.error("Error loading test page:", error);
        setErrorMessage("Unable to load this test right now.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [subjectId, topicId, isTopicMode]);

  useEffect(() => {
    if (!subject) return;
    setTimeLeft(subject.duration || 300);
  }, [subject]);

  useEffect(() => {
    if (isLoading || showResults || questions.length === 0) return;

    if (timeLeft <= 0) {
      setShowResults(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isLoading, showResults, questions.length]);

  const score = useMemo(() => {
    return questions.reduce((total, question) => {
      return selectedAnswers[question._id] === question.correctAnswer
        ? total + 1
        : total;
    }, 0);
  }, [questions, selectedAnswers]);

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = questions.length
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getPerformanceMessage = () => {
    if (questions.length === 0) return "";
    if (score === questions.length) return "Excellent performance";
    if (score === 0) return "You need to review this topic carefully";
    if (score >= questions.length / 2) return "Good job, keep improving";
    return "Keep practicing";
  };

  const handleOptionSelect = (questionId, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (answeredCount !== questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setShowResults(true);
  };

  const handleRetakeTest = () => {
    const reshuffledQuestions = shuffleArray(
      questions.map((question) => ({
        ...question,
        options: shuffleArray(question.options),
      })),
    );

    setQuestions(reshuffledQuestions);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setTimeLeft(defaultDuration);
  };

  if (isLoading) {
    return (
      <div style={{ ...styles.page, textAlign: "center", paddingTop: "6rem" }}>
        <p>Loading test...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={{ marginBottom: "1rem", color: "#64748b" }}>
            {errorMessage}
          </p>
          <button onClick={() => navigate("/user")} style={styles.btnBase}>
            Back to subjects
          </button>
        </div>
      </div>
    );
  }

  if (!subject) return null;

  if (questions.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
            {isTopicMode
              ? `${subject.name} / ${topic?.name || ""}`
              : subject.name}
          </p>
          <p style={{ color: "#64748b" }}>
            No questions available for this test yet.
          </p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const timeUsed = defaultDuration - timeLeft;
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div style={styles.page}>
        <div
          style={{
            ...styles.card,
            textAlign: "center",
            marginBottom: "1.25rem",
            padding: "2rem",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "#E6F1FB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <CheckCircle />
          </div>

          <h2
            style={{ fontSize: "28px", marginBottom: "8px", color: "#0f172a" }}
          >
            Result
          </h2>

          <p
            style={{
              fontSize: "14px",
              color: "#64748b",
              marginBottom: "18px",
            }}
          >
            {isTopicMode
              ? `${subject.name} / ${topic?.name || ""}`
              : subject.name}
          </p>

          <h3
            style={{
              fontSize: "20px",
              marginBottom: "10px",
              color: "#0f172a",
            }}
          >
            Score: {score} / {questions.length} ({percentage}%)
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "600",
              color: "#0f172a",
            }}
          >
            {getPerformanceMessage()}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px",
              marginTop: "1.5rem",
            }}
          >
            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#185FA5",
                }}
              >
                {percentage}%
              </div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>Score</div>
            </div>

            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#0f172a",
                }}
              >
                {score}/{questions.length}
              </div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>Correct</div>
            </div>

            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#0f172a",
                }}
              >
                {formatTime(timeUsed)}
              </div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>
                Time used
              </div>
            </div>
          </div>
        </div>

        {questions.map((question, index) => {
          const userAnswer = selectedAnswers[question._id];

          return (
            <div
              key={question._id}
              style={{
                ...styles.card,
                marginBottom: "1rem",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: "12px",
                  color: "#0f172a",
                  lineHeight: "1.5",
                }}
              >
                {index + 1}. {question.questionText}
              </h3>

              <div>
                {question.options.map((option, optionIndex) => {
                  const isCorrect = option === question.correctAnswer;
                  const isUserAnswer = option === userAnswer;
                  const isWrongSelected = isUserAnswer && !isCorrect;

                  let color = "#111827";
                  let fontWeight = "400";
                  let extraText = "";

                  if (isCorrect && isUserAnswer) {
                    color = "green";
                    fontWeight = "700";
                    extraText = " (Your Answer ✓)";
                  } else if (isCorrect) {
                    color = "green";
                    fontWeight = "700";
                    extraText = " (Correct Answer)";
                  } else if (isWrongSelected) {
                    color = "red";
                    fontWeight = "700";
                    extraText = " (Your Answer)";
                  }

                  return (
                    <p
                      key={optionIndex}
                      style={{
                        margin: "0 0 6px",
                        color,
                        fontWeight,
                      }}
                    >
                      {option}
                      {extraText}
                    </p>
                  );
                })}
              </div>

              <details style={{ marginTop: "12px" }}>
                <summary
                  style={{
                    cursor: "pointer",
                    fontWeight: "600",
                    color: "#0f172a",
                  }}
                >
                  Show Explanation
                </summary>
                <p
                  style={{
                    marginTop: "12px",
                    color: "#334155",
                    lineHeight: "1.7",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {question.explanation}
                </p>
              </details>
            </div>
          );
        })}

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "1.5rem",
          }}
        >
          <button
            onClick={handleRetakeTest}
            style={{ ...styles.btnBase, ...styles.btnPrimary }}
          >
            Retake Test
          </button>

          <button
            onClick={() => navigate(`/subject/${subject._id}/topics`)}
            style={styles.btnBase}
          >
            Back to Topics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "0.25rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "13px",
              color: "#64748b",
              marginBottom: "2px",
            }}
          >
            {isTopicMode
              ? `${subject.name} / ${topic?.name || ""}`
              : subject.name}
          </p>
          <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#0f172a" }}>
            {isTopicMode ? "Topic Test" : "Subject Test"}
          </h2>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "8px",
            background: "#f5f5f5",
            border: "1px solid rgba(0,0,0,0.12)",
            fontSize: "14px",
            fontWeight: "600",
            color: timeLeft <= 30 ? "#A32D2D" : "#0f172a",
          }}
        >
          <ClockIcon />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div style={{ margin: "1.25rem 0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "13px",
            color: "#64748b",
            marginBottom: "8px",
          }}
        >
          <span>
            Question <strong>{currentQuestionIndex + 1}</strong> of{" "}
            {questions.length}
          </span>
          <span>
            Answered:{" "}
            <strong>
              {answeredCount} / {questions.length}
            </strong>
          </span>
        </div>

        <div
          style={{
            height: "4px",
            background: "#e9ecef",
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: "#185FA5",
              borderRadius: "999px",
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>

      <div style={styles.card}>
        <p
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "0.75rem",
          }}
        >
          Question {currentQuestionIndex + 1}
        </p>

        <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#0f172a" }}>
          {currentQuestion.questionText}
        </p>

        <div style={{ marginTop: "1.25rem" }}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion._id] === option;

            return (
              <label
                key={index}
                onClick={() => handleOptionSelect(currentQuestion._id, option)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  marginBottom: "8px",
                  border: isSelected
                    ? "1px solid #185FA5"
                    : "1px solid rgba(0,0,0,0.12)",
                  background: isSelected ? "#E6F1FB" : "transparent",
                  color: isSelected ? "#0C447C" : "#0f172a",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    border: isSelected ? "none" : "1px solid rgba(0,0,0,0.2)",
                    background: isSelected ? "#185FA5" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSelected && (
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        background: "#E6F1FB",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </div>
                {option}
              </label>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "1rem",
          gap: "10px",
        }}
      >
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          style={{
            ...styles.btnBase,
            opacity: currentQuestionIndex === 0 ? 0.4 : 1,
            cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer",
          }}
        >
          <ChevronLeft /> Back
        </button>

        <div style={{ display: "flex", gap: "4px" }}>
          {questions.slice(0, Math.min(questions.length, 10)).map((q, i) => {
            const answered = !!selectedAnswers[q._id];
            const isCurrent = i === currentQuestionIndex;

            return (
              <div
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: isCurrent
                    ? "#185FA5"
                    : answered
                      ? "rgba(24,95,165,0.4)"
                      : "rgba(0,0,0,0.12)",
                }}
              />
            );
          })}
        </div>

        {currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={handleNextQuestion}
            disabled={!selectedAnswers[currentQuestion._id]}
            style={{
              ...styles.btnBase,
              ...styles.btnPrimary,
              opacity: !selectedAnswers[currentQuestion._id] ? 0.4 : 1,
              cursor: !selectedAnswers[currentQuestion._id]
                ? "not-allowed"
                : "pointer",
            }}
          >
            Next <ChevronRight />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswers[currentQuestion._id]}
            style={{
              ...styles.btnBase,
              ...styles.btnPrimary,
              opacity: !selectedAnswers[currentQuestion._id] ? 0.4 : 1,
              cursor: !selectedAnswers[currentQuestion._id]
                ? "not-allowed"
                : "pointer",
            }}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}

export default SubjectTestPage;
