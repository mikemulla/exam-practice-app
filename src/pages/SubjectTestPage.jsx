import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";

const styles = {
  page: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "2rem 1rem",
    fontFamily: "var(--font-sans, system-ui, sans-serif)",
  },
  card: {
    background: "var(--color-background-primary, #fff)",
    border: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.12))",
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
    border: "0.5px solid rgba(0,0,0,0.2)",
    background: "transparent",
    color: "inherit",
    transition: "background 0.15s",
  },
  btnPrimary: {
    background: "#185FA5",
    color: "#E6F1FB",
    borderColor: "#185FA5",
  },
};

const shuffleArray = (array) => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
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

          const subjectResponse = await api.get(
            `/api/subjects/${selectedTopic.subjectId._id || selectedTopic.subjectId}`,
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
          setCurrentQuestionIndex(0);
          setSelectedAnswers({});
          setShowResults(false);
          setTimeLeft(subjectResponse.data.duration || 300);
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
          setCurrentQuestionIndex(0);
          setSelectedAnswers({});
          setShowResults(false);
          setTimeLeft(subjectResponse.data.duration || 300);
        }
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

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const score = useMemo(() => {
    return questions.reduce((total, q) => {
      return selectedAnswers[q._id] === q.correctAnswer ? total + 1 : total;
    }, 0);
  }, [questions, selectedAnswers]);

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = questions.length
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;

  const getPerformanceMessage = () => {
    if (score === questions.length) return "Excellent performance";
    if (score === 0) return "You need to review this topic carefully";
    if (score >= questions.length / 2) return "Good job, keep improving";
    return "Keep practicing";
  };

  const handleOptionSelect = (questionId, option) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: option }));
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
    setShowResults(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeft(defaultDuration);
  };

  if (isLoading) {
    return (
      <div style={{ ...styles.page, textAlign: "center", paddingTop: "6rem" }}>
        <p
          style={{
            color: "var(--color-text-secondary, #666)",
            fontSize: "14px",
          }}
        >
          Loading test...
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p
            style={{
              marginBottom: "1rem",
              color: "var(--color-text-secondary, #666)",
            }}
          >
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
          <p style={{ marginBottom: "0.5rem", fontWeight: 500 }}>
            {isTopicMode
              ? `${subject.name} / ${topic?.name || ""}`
              : subject.name}
          </p>
          <p
            style={{
              color: "var(--color-text-secondary, #666)",
              fontSize: "14px",
            }}
          >
            No questions available for this test yet.
          </p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const timeUsed = defaultDuration - timeLeft;

    return (
      <div style={styles.page}>
        <div
          style={{
            ...styles.card,
            textAlign: "center",
            marginBottom: "1rem",
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
            style={{ fontSize: "22px", fontWeight: "500", marginBottom: "4px" }}
          >
            {getPerformanceMessage()}
          </h2>

          <p
            style={{
              fontSize: "14px",
              color: "var(--color-text-secondary, #666)",
            }}
          >
            {isTopicMode
              ? `${subject.name} / ${topic?.name || ""}`
              : subject.name}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginTop: "1.5rem",
            }}
          >
            {[
              {
                value: `${Math.round((score / questions.length) * 100)}%`,
                label: "Score",
              },
              { value: `${score} / ${questions.length}`, label: "Correct" },
              { value: formatTime(timeUsed), label: "Time used" },
            ].map(({ value, label }) => (
              <div
                key={label}
                style={{
                  background: "var(--color-background-secondary, #f5f5f5)",
                  borderRadius: "8px",
                  padding: "1rem",
                }}
              >
                <p
                  style={{
                    fontSize: "22px",
                    fontWeight: "500",
                    color: label === "Score" ? "#185FA5" : "inherit",
                  }}
                >
                  {value}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary, #666)",
                    marginTop: "2px",
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginTop: "1.5rem",
          }}
        >
          <button
            onClick={handleRetakeTest}
            style={{ ...styles.btnBase, ...styles.btnPrimary }}
          >
            Retake test
          </button>
          <button
            onClick={() => navigate(`/subject/${subject._id}/topics`)}
            style={styles.btnBase}
          >
            Back to topics
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
          marginBottom: "0.25rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "13px",
              color: "var(--color-text-secondary, #666)",
              marginBottom: "2px",
            }}
          >
            {isTopicMode
              ? `${subject.name} / ${topic?.name || ""}`
              : subject.name}
          </p>
          <h2 style={{ fontSize: "20px", fontWeight: "500" }}>
            {isTopicMode ? "Topic test" : "Subject test"}
          </h2>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "8px",
            background: "var(--color-background-secondary, #f5f5f5)",
            border:
              "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.12))",
            fontSize: "14px",
            fontWeight: "500",
            color: timeLeft <= 30 ? "#A32D2D" : "inherit",
            transition: "color 0.3s",
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
            color: "var(--color-text-secondary, #666)",
            marginBottom: "8px",
          }}
        >
          <span>
            Question{" "}
            <strong style={{ color: "inherit", fontWeight: "500" }}>
              {currentQuestionIndex + 1}
            </strong>{" "}
            of {questions.length}
          </span>
          <span>
            Answered:{" "}
            <strong style={{ fontWeight: "500" }}>
              {answeredCount} / {questions.length}
            </strong>
          </span>
        </div>

        <div
          style={{
            height: "4px",
            background: "var(--color-background-secondary, #e9ecef)",
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
            fontWeight: "500",
            color: "var(--color-text-secondary, #666)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "0.75rem",
          }}
        >
          Question {currentQuestionIndex + 1}
        </p>

        <p style={{ fontSize: "16px", lineHeight: "1.6" }}>
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
                    ? "0.5px solid #185FA5"
                    : "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.12))",
                  background: isSelected ? "#E6F1FB" : "transparent",
                  color: isSelected ? "#0C447C" : "inherit",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    border: isSelected ? "none" : "0.5px solid rgba(0,0,0,0.2)",
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
                      : "var(--color-border-tertiary, rgba(0,0,0,0.12))",
                  transition: "background 0.2s",
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
