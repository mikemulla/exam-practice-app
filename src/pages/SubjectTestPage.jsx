import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";

const S = {
  page: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "2rem 1rem 3rem",
    fontFamily: "system-ui, sans-serif",
  },
  card: {
    background: "#fff",
    border: "0.5px solid rgba(0,0,0,0.08)",
    borderRadius: "12px",
    padding: "1.25rem 1.5rem",
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    border: "0.5px solid rgba(0,0,0,0.18)",
    background: "transparent",
    color: "#0f172a",
  },
  btnPrimary: {
    background: "#185FA5",
    color: "#E6F1FB",
    border: "0.5px solid #185FA5",
  },
  btnDanger: {
    background: "#fff5f5",
    color: "#b91c1c",
    border: "0.5px solid #fecaca",
  },
};

const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

function Badge({ variant, children }) {
  const map = {
    correct: { bg: "#EAF3DE", color: "#27500A" },
    incorrect: { bg: "#FCEBEB", color: "#791F1F" },
    info: { bg: "#E6F1FB", color: "#0C447C" },
  };
  const c = map[variant] || map.info;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: "11px",
        fontWeight: "500",
        padding: "3px 9px",
        borderRadius: "999px",
        background: c.bg,
        color: c.color,
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

function ReviewOption({ option, isCorrect, isUserAnswer }) {
  if (!isCorrect && !isUserAnswer) return null;

  const st = isCorrect
    ? { bg: "#EAF3DE", border: "#C0DD97", color: "#27500A", dot: "#3B6D11" }
    : { bg: "#FCEBEB", border: "#F7C1C1", color: "#791F1F", dot: "#A32D2D" };

  const label =
    isCorrect && isUserAnswer
      ? "Your answer ✓"
      : isCorrect
        ? "Correct answer"
        : "Your answer";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "9px 14px",
        borderRadius: "8px",
        marginBottom: "6px",
        background: st.bg,
        border: `0.5px solid ${st.border}`,
        color: st.color,
      }}
    >
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          flexShrink: 0,
          background: st.dot,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isCorrect ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M1.5 5l2.5 2.5 4.5-4.5"
              stroke="#EAF3DE"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2.5 2.5l5 5M7.5 2.5l-5 5"
              stroke="#FCEBEB"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      <span style={{ fontSize: "13px", flex: 1 }}>{option}</span>
      <span style={{ fontSize: "11px", opacity: 0.8 }}>{label}</span>
    </div>
  );
}

function ExplanationToggle({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: "0.75rem" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          fontSize: "12px",
          color: "#64748b",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: "10px",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        >
          ▶
        </span>
        Show explanation
      </button>
      {open && (
        <p
          style={{
            fontSize: "13px",
            color: "#64748b",
            lineHeight: "1.65",
            marginTop: "0.625rem",
            whiteSpace: "pre-wrap",
          }}
        >
          {text}
        </p>
      )}
    </div>
  );
}

function QuestionReviewCard({ question, index, userAnswer }) {
  const isCorrect = userAnswer === question.correctAnswer;
  return (
    <div style={{ ...S.card, marginBottom: "0.75rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
          marginBottom: "0.875rem",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            lineHeight: "1.55",
            color: "#0f172a",
            flex: 1,
          }}
        >
          <span style={{ color: "#94a3b8", marginRight: "5px" }}>
            {index + 1}.
          </span>
          {question.questionText}
        </p>
        <Badge variant={isCorrect ? "correct" : "incorrect"}>
          {isCorrect ? "Correct" : "Incorrect"}
        </Badge>
      </div>
      {question.options.map((opt, i) => (
        <ReviewOption
          key={i}
          option={opt}
          isCorrect={opt === question.correctAnswer}
          isUserAnswer={opt === userAnswer}
        />
      ))}
      <ExplanationToggle text={question.explanation} />
    </div>
  );
}

function SubjectTestPage() {
  const { subjectId, topicId } = useParams();
  const navigate = useNavigate();
  const isTopicMode = Boolean(topicId);

  const [subject, setSubject] = useState(null);
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);

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
          if (!selectedTopic) throw new Error("Topic not found");
          const resolvedSubjectId =
            selectedTopic.subjectId?._id || selectedTopic.subjectId;
          const subjectResponse = await api.get(
            `/api/subjects/${resolvedSubjectId}`,
          );
          const unique = Array.from(
            new Map(questionsResponse.data.map((q) => [q._id, q])).values(),
          );
          setTopic(selectedTopic);
          setSubject(subjectResponse.data);
          setQuestions(
            shuffleArray(
              unique.map((q) => ({ ...q, options: shuffleArray(q.options) })),
            ),
          );
        } else {
          const [subjectResponse, questionsResponse] = await Promise.all([
            api.get(`/api/subjects/${subjectId}`),
            api.get(`/api/questions/subject/${subjectId}`),
          ]);
          const unique = Array.from(
            new Map(questionsResponse.data.map((q) => [q._id, q])).values(),
          );
          setTopic(null);
          setSubject(subjectResponse.data);
          setQuestions(
            shuffleArray(
              unique.map((q) => ({ ...q, options: shuffleArray(q.options) })),
            ),
          );
        }
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
      } catch (err) {
        console.error(err);
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
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, isLoading, showResults, questions.length]);

  const score = useMemo(
    () =>
      questions.reduce(
        (n, q) => (selectedAnswers[q._id] === q.correctAnswer ? n + 1 : n),
        0,
      ),
    [questions, selectedAnswers],
  );

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = questions.length
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;
  const breadcrumb = isTopicMode
    ? `${subject?.name} / ${topic?.name || ""}`
    : subject?.name || "";
  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const getPerformanceMessage = () => {
    if (!questions.length) return "";
    if (score === questions.length) return "Excellent performance";
    if (score === 0) return "You need to review this topic carefully";
    if (score >= questions.length / 2) return "Good job, keep improving";
    return "Keep practicing";
  };

  const handleRetakeTest = () => {
    setQuestions(
      shuffleArray(
        questions.map((q) => ({ ...q, options: shuffleArray(q.options) })),
      ),
    );
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setTimeLeft(defaultDuration);
  };

  const handleStopTest = () => {
    if (
      window.confirm(
        "Are you sure you want to stop? Unanswered questions will count as wrong.",
      )
    ) {
      setShowResults(true);
    }
  };

  const handleSubmit = () => {
    if (answeredCount !== questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setShowResults(true);
  };

  if (isLoading) {
    return (
      <div style={{ ...S.page, textAlign: "center", paddingTop: "6rem" }}>
        <p style={{ fontSize: "14px", color: "#64748b" }}>Loading test...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <p
            style={{ marginBottom: "1rem", color: "#64748b", fontSize: "14px" }}
          >
            {errorMessage}
          </p>
          <button onClick={() => navigate("/user")} style={S.btn}>
            Back to subjects
          </button>
        </div>
      </div>
    );
  }

  if (!subject) return null;

  if (questions.length === 0) {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <p style={{ marginBottom: "0.5rem", fontWeight: "500" }}>
            {breadcrumb}
          </p>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            No questions available for this test yet.
          </p>
        </div>
      </div>
    );
  }

  /* ── Results view ── */
  if (showResults) {
    const timeUsed = defaultDuration - timeLeft;
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div style={S.page}>
        {/* Score card */}
        <div
          style={{
            ...S.card,
            textAlign: "center",
            padding: "2rem",
            marginBottom: "1.25rem",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#E6F1FB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <path
                d="M8 16l5 5 11-11"
                stroke="#185FA5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p
            style={{
              fontSize: "11px",
              fontWeight: "500",
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "5px",
            }}
          >
            {breadcrumb}
          </p>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "500",
              color: "#0f172a",
              marginBottom: "4px",
            }}
          >
            {getPerformanceMessage()}
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b" }}>
            {isTopicMode ? "Topic test" : "Subject test"} complete
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "10px",
              marginTop: "1.5rem",
            }}
          >
            {[
              { val: `${percentage}%`, label: "Score", color: "#185FA5" },
              {
                val: `${score} / ${questions.length}`,
                label: "Correct",
                color: "#0f172a",
              },
              {
                val: formatTime(timeUsed),
                label: "Time used",
                color: "#0f172a",
              },
            ].map(({ val, label, color }) => (
              <div
                key={label}
                style={{
                  background: "#f8f9fb",
                  borderRadius: "8px",
                  padding: "0.875rem",
                }}
              >
                <div style={{ fontSize: "22px", fontWeight: "500", color }}>
                  {val}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    marginTop: "2px",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "1.25rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "#94a3b8",
                marginBottom: "6px",
              }}
            >
              <span>Performance</span>
              <span>{percentage}%</span>
            </div>
            <div
              style={{
                height: "6px",
                background: "#f1f5f9",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${percentage}%`,
                  height: "100%",
                  background: "#185FA5",
                  borderRadius: "999px",
                }}
              />
            </div>
          </div>
        </div>

        {/* Question overview dots */}
        <div
          style={{
            display: "flex",
            gap: "5px",
            flexWrap: "wrap",
            marginBottom: "1.25rem",
          }}
        >
          {questions.map((q, i) => {
            const correct = selectedAnswers[q._id] === q.correctAnswer;
            return (
              <span
                key={q._id}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "7px",
                  background: correct ? "#EAF3DE" : "#FCEBEB",
                  color: correct ? "#27500A" : "#791F1F",
                  fontSize: "12px",
                  fontWeight: "500",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </span>
            );
          })}
        </div>

        {/* Per-question review */}
        {questions.map((question, index) => (
          <QuestionReviewCard
            key={question._id}
            question={question}
            index={index}
            userAnswer={selectedAnswers[question._id]}
          />
        ))}

        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "1.5rem",
          }}
        >
          <button
            onClick={handleRetakeTest}
            style={{ ...S.btn, ...S.btnPrimary }}
          >
            Retake test
          </button>
          <button
            onClick={() => navigate(`/subject/${subject._id}/topics`)}
            style={S.btn}
          >
            Back to topics
          </button>
        </div>
      </div>
    );
  }

  /* ── Test view ── */
  return (
    <div style={S.page}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "0.25rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "12px",
              color: "#64748b",
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "3px",
            }}
          >
            {breadcrumb}
          </p>
          <h2 style={{ fontSize: "19px", fontWeight: "500", color: "#0f172a" }}>
            {isTopicMode ? "Topic test" : "Subject test"}
          </h2>
        </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "8px 14px",
              borderRadius: "8px",
              background: "#f8f9fb",
              border: "0.5px solid rgba(0,0,0,0.1)",
              fontSize: "14px",
              fontWeight: "500",
              color: timeLeft <= 30 ? "#A32D2D" : "#0f172a",
              transition: "color 0.3s",
            }}
          >
            <ClockIcon />
            {formatTime(timeLeft)}
          </div>
          <button onClick={handleStopTest} style={{ ...S.btn, ...S.btnDanger }}>
            Stop test
          </button>
        </div>
      </div>

      <div style={{ margin: "1.25rem 0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#64748b",
            marginBottom: "7px",
          }}
        >
          <span>
            Question{" "}
            <span style={{ fontWeight: "500", color: "#0f172a" }}>
              {currentQuestionIndex + 1}
            </span>{" "}
            of {questions.length}
          </span>
          <span>
            Answered{" "}
            <span style={{ fontWeight: "500", color: "#0f172a" }}>
              {answeredCount} / {questions.length}
            </span>
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

      <div style={S.card}>
        <Badge variant="info">Question {currentQuestionIndex + 1}</Badge>
        <p
          style={{
            fontSize: "15px",
            lineHeight: "1.65",
            color: "#0f172a",
            marginTop: "0.75rem",
          }}
        >
          {currentQuestion.questionText}
        </p>
        <div style={{ marginTop: "1.25rem" }}>
          {currentQuestion.options.map((option, i) => {
            const isSelected = selectedAnswers[currentQuestion._id] === option;
            return (
              <label
                key={i}
                onClick={() =>
                  setSelectedAnswers((prev) => ({
                    ...prev,
                    [currentQuestion._id]: option,
                  }))
                }
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
                    : "0.5px solid rgba(0,0,0,0.1)",
                  background: isSelected ? "#E6F1FB" : "transparent",
                  color: isSelected ? "#0C447C" : "#0f172a",
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
          gap: "10px",
        }}
      >
        <button
          onClick={() => setCurrentQuestionIndex((p) => p - 1)}
          disabled={currentQuestionIndex === 0}
          style={{
            ...S.btn,
            opacity: currentQuestionIndex === 0 ? 0.4 : 1,
            cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer",
          }}
        >
          <ChevronLeft /> Back
        </button>

        <div style={{ display: "flex", gap: "5px" }}>
          {questions.slice(0, Math.min(questions.length, 10)).map((q, i) => (
            <div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background:
                  i === currentQuestionIndex
                    ? "#185FA5"
                    : selectedAnswers[q._id]
                      ? "rgba(24,95,165,0.4)"
                      : "rgba(0,0,0,0.12)",
                transition: "background 0.2s",
              }}
            />
          ))}
        </div>

        {currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestionIndex((p) => p + 1)}
            disabled={!selectedAnswers[currentQuestion._id]}
            style={{
              ...S.btn,
              ...S.btnPrimary,
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
              ...S.btn,
              ...S.btnPrimary,
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
