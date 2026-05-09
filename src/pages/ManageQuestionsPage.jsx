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

const getCourseId = (subject) =>
  typeof subject?.courseId === "object"
    ? subject.courseId?._id
    : subject?.courseId;

const getCourseName = (subject) => {
  if (!subject || !subject._id) return "Unknown";

  if (typeof subject?.courseId === "object") {
    return subject.courseId?.name || "Unknown Course";
  }

  if (typeof subject?.courseId === "string") {
    return "Unknown Course";
  }

  return "Unknown";
};

const makeImageSrc = (imageData, imageContentType) => {
  if (!imageData || !imageContentType) return "";
  if (String(imageData).startsWith("data:")) return imageData;
  return `data:${imageContentType};base64,${imageData}`;
};

const getQuestionImageSrc = (question, questionImages = {}) => {
  if (!question) return "";

  if (question.localImagePreview) return question.localImagePreview;

  if (question?._id && questionImages[question._id]) {
    return questionImages[question._id];
  }

  if (!question?.imageData || !question?.imageContentType) return "";

  return makeImageSrc(question.imageData, question.imageContentType);
};

const hasQuestionImage = (question) =>
  Boolean(
    question?.hasImage ||
    question?.imageData ||
    question?.imageContentType ||
    question?.imageOriginalName ||
    question?.imageSize,
  );

const formatFileSize = (size) => {
  const bytes = Number(size || 0);

  if (!bytes) return "";

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

  const [hasLoadedQuestions, setHasLoadedQuestions] = useState(false);
  const [isLoadingSetup, setIsLoadingSetup] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [questionImages, setQuestionImages] = useState({});
  const [loadingImageIds, setLoadingImageIds] = useState({});

  const [editingId, setEditingId] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [editForm, setEditForm] = useState({
    subjectId: "",
    topicId: "",
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    image: null,
    removeImage: false,
    existingImageSrc: "",
  });

  const fetchAdminQuestionImage = async (questionId) => {
    const response = await api.get(`/api/questions/${questionId}/admin-image`, {
      _tokenType: "admin",
    });

    return makeImageSrc(
      response.data?.imageData,
      response.data?.imageContentType,
    );
  };

  const loadQuestionImage = async (question) => {
    if (!question?._id) return "";
    if (questionImages[question._id]) return questionImages[question._id];
    if (!hasQuestionImage(question)) return "";

    try {
      setLoadingImageIds((previous) => ({
        ...previous,
        [question._id]: true,
      }));

      const imageSrc = await fetchAdminQuestionImage(question._id);

      if (imageSrc) {
        setQuestionImages((previous) => ({
          ...previous,
          [question._id]: imageSrc,
        }));
      }

      return imageSrc;
    } catch (error) {
      console.error("Error loading question image:", error);
      return "";
    } finally {
      setLoadingImageIds((previous) => {
        const next = { ...previous };
        delete next[question._id];
        return next;
      });
    }
  };

  const fetchSetupData = async () => {
    try {
      setIsLoadingSetup(true);

      const [coursesRes, allSubjects, allTopics] = await Promise.all([
        api.get("/api/courses?limit=100"),
        fetchAllPages("/api/subjects/admin/all", "subjects", {
          _tokenType: "admin",
        }),
        fetchAllPages("/api/topics/admin/all", "topics", {
          _tokenType: "admin",
        }),
      ]);

      setCourses(apiArray(coursesRes.data, "courses"));
      setSubjects(allSubjects);
      setTopics(allTopics);
    } catch (error) {
      console.error("Error loading filter data:", error);
      alert(error.message || "Error loading filter data");
    } finally {
      setIsLoadingSetup(false);
    }
  };

  const resetEditImagePreview = () => {
    if (editImagePreview) {
      URL.revokeObjectURL(editImagePreview);
      setEditImagePreview("");
    }
  };

  const cancelEdit = () => {
    if (isSavingEdit) return;

    resetEditImagePreview();
    setEditingId(null);
    setEditForm({
      subjectId: "",
      topicId: "",
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      image: null,
      removeImage: false,
      existingImageSrc: "",
    });
  };

  const loadQuestions = async () => {
    if (isSavingEdit) return;

    if (!subjectFilter) {
      alert("Please select a subject first.");
      return;
    }

    try {
      setIsLoadingQuestions(true);
      cancelEdit();

      const params = new URLSearchParams();
      params.set("subjectId", subjectFilter);
      if (topicFilter) params.set("topicId", topicFilter);

      const allQuestions = await fetchAllPages(
        `/api/questions/admin/all?${params.toString()}`,
        "questions",
        { _tokenType: "admin" },
      );

      setQuestionImages({});
      setLoadingImageIds({});
      setQuestions(allQuestions);
      setHasLoadedQuestions(true);
    } catch (error) {
      console.error("Error loading questions:", error);
      alert(error.message || "Error loading questions");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchSetupData();
  }, []);

  useEffect(() => {
    return () => {
      if (editImagePreview) URL.revokeObjectURL(editImagePreview);
    };
  }, [editImagePreview]);

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

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const subject = topic.subjectId || {};

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

  useEffect(() => {
    setQuestions([]);
    setHasLoadedQuestions(false);
    cancelEdit();

    if (
      subjectFilter &&
      !filteredSubjects.some((subject) => subject._id === subjectFilter)
    ) {
      setSubjectFilter("");
      setTopicFilter("");
    }
  }, [courseFilter, levelFilter]);

  useEffect(() => {
    setQuestions([]);
    setHasLoadedQuestions(false);
    cancelEdit();

    if (
      topicFilter &&
      !filteredTopics.some((topic) => topic._id === topicFilter)
    ) {
      setTopicFilter("");
    }
  }, [subjectFilter]);

  useEffect(() => {
    setQuestions([]);
    setHasLoadedQuestions(false);
    cancelEdit();
  }, [topicFilter]);

  const startEdit = async (question) => {
    if (isSavingEdit) return;

    resetEditImagePreview();

    const options = Array.isArray(question.options) ? question.options : [];
    let existingImageSrc = getQuestionImageSrc(question, questionImages);

    if (!existingImageSrc && hasQuestionImage(question)) {
      existingImageSrc = await loadQuestionImage(question);
    }

    setEditingId(question._id);
    setEditForm({
      subjectId: subjectOfQuestion(question)?._id || "",
      topicId: topicOfQuestion(question)?._id || "",
      questionText: question.questionText || "",
      options: [...options, "", "", "", "", "", ""].slice(
        0,
        Math.max(4, options.length),
      ),
      correctAnswer: question.correctAnswer || "",
      explanation: question.explanation || "",
      image: null,
      removeImage: false,
      existingImageSrc,
    });
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

  const handleEditImageChange = (event) => {
    const file = event.target.files?.[0];

    resetEditImagePreview();

    if (!file) {
      setEditForm({ ...editForm, image: null });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    const maxBytes = 5 * 1024 * 1024;

    if (file.size > maxBytes) {
      alert("Image is too large. Maximum size is 5MB.");
      event.target.value = "";
      return;
    }

    setEditForm({
      ...editForm,
      image: file,
      removeImage: false,
    });

    setEditImagePreview(URL.createObjectURL(file));
  };

  const removeCurrentImage = () => {
    if (isSavingEdit) return;

    resetEditImagePreview();
    setEditForm({
      ...editForm,
      image: null,
      removeImage: true,
      existingImageSrc: "",
    });
  };

  const saveEdit = async (id) => {
    if (isSavingEdit) return;

    const options = editForm.options
      .map((option) => option.trim())
      .filter(Boolean);

    if (
      !editForm.subjectId ||
      !editForm.topicId ||
      !editForm.questionText.trim() ||
      options.length < 2 ||
      !editForm.correctAnswer.trim() ||
      !editForm.explanation.trim()
    ) {
      alert(
        "Please complete all question fields. At least two options are required.",
      );
      return;
    }

    if (!options.includes(editForm.correctAnswer.trim())) {
      alert("Correct answer must match one of the options exactly.");
      return;
    }

    try {
      setIsSavingEdit(true);

      const selectedSubject = subjects.find(
        (subject) => subject._id === editForm.subjectId,
      );

      const selectedTopic = topics.find(
        (topic) => topic._id === editForm.topicId,
      );

      const localPreview = editImagePreview || "";

      const formData = new FormData();
      formData.append("subjectId", editForm.subjectId);
      formData.append("topicId", editForm.topicId);
      formData.append("questionText", editForm.questionText.trim());
      formData.append("options", JSON.stringify(options));
      formData.append("correctAnswer", editForm.correctAnswer.trim());
      formData.append("explanation", editForm.explanation.trim());

      if (editForm.image) {
        formData.append("image", editForm.image);
      }

      if (editForm.removeImage) {
        formData.append("removeImage", "true");
      }

      const response = await api.put(`/api/questions/${id}`, formData, {
        _tokenType: "admin",
      });

      const updatedQuestionFromServer = response.data || {};

      setQuestions((previousQuestions) =>
        previousQuestions.map((question) => {
          if (question._id !== id) return question;

          const existingSubject = subjectOfQuestion(question);
          const existingTopic = topicOfQuestion(question);

          return {
            ...question,
            ...updatedQuestionFromServer,
            _id: id,
            subjectId: selectedSubject || existingSubject,
            topicId: selectedTopic || existingTopic,
            questionText: editForm.questionText.trim(),
            options,
            correctAnswer: editForm.correctAnswer.trim(),
            explanation: editForm.explanation.trim(),
            imageData: editForm.removeImage ? "" : question.imageData || "",
            imageContentType: editForm.removeImage
              ? ""
              : updatedQuestionFromServer.imageContentType ||
                editForm.image?.type ||
                question.imageContentType ||
                "",
            imageOriginalName: editForm.removeImage
              ? ""
              : updatedQuestionFromServer.imageOriginalName ||
                editForm.image?.name ||
                question.imageOriginalName ||
                "",
            imageSize: editForm.removeImage
              ? 0
              : updatedQuestionFromServer.imageSize ||
                editForm.image?.size ||
                question.imageSize ||
                0,
            hasImage: editForm.removeImage
              ? false
              : Boolean(
                  updatedQuestionFromServer.hasImage ||
                  editForm.image ||
                  question.hasImage ||
                  question.imageContentType ||
                  question.imageSize,
                ),
            localImagePreview: editForm.removeImage ? "" : localPreview,
          };
        }),
      );

      if (editForm.removeImage) {
        setQuestionImages((previousImages) => {
          const nextImages = { ...previousImages };
          delete nextImages[id];
          return nextImages;
        });
      } else if (localPreview) {
        setQuestionImages((previousImages) => ({
          ...previousImages,
          [id]: localPreview,
        }));
      }

      resetEditImagePreview();
      setEditingId(null);
      setEditForm({
        subjectId: "",
        topicId: "",
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
        image: null,
        removeImage: false,
        existingImageSrc: "",
      });
    } catch (error) {
      console.error("Error updating question:", error);
      alert(error.message || "Error updating question");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const deleteQuestion = async (id) => {
    if (isSavingEdit) return;
    if (!window.confirm("Delete this question?")) return;

    try {
      await api.delete(`/api/questions/${id}`, { _tokenType: "admin" });
      setQuestions((previousQuestions) =>
        previousQuestions.filter((question) => question._id !== id),
      );
      setQuestionImages((previousImages) => {
        const nextImages = { ...previousImages };
        delete nextImages[id];
        return nextImages;
      });
    } catch (error) {
      console.error("Error deleting question:", error);
      alert(error.message || "Error deleting question");
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
           from  { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .question-row {
          animation: fadeUp 0.3s ease-out;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#f8f9fb",
          padding: "2.5rem 1.25rem 4rem",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "2rem" }}>
            <p
              style={{
                margin: "0 0 0.75rem",
                color: "#94a3b8",
                fontSize: "12px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Admin / Manage Content
            </p>
            <h1
              style={{
                margin: "0 0 0.5rem",
                color: "#0f172a",
                fontSize: "32px",
                fontWeight: "700",
                letterSpacing: "-0.02em",
              }}
            >
              Manage Questions
            </h1>
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              Select filters to load, view, edit, and delete questions.
            </p>
          </div>

          <div
            style={{
              background: "#fff",
              border: "0.5px solid rgba(0,0,0,0.08)",
              borderRadius: "14px",
              padding: "1.5rem",
              marginBottom: "1.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label style={filterLabelStyle}>Course</label>
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  style={selectStyle}
                  disabled={isLoadingSetup || isSavingEdit}
                >
                  <option value="">All courses</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={filterLabelStyle}>Level</label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  style={selectStyle}
                  disabled={isLoadingSetup || isSavingEdit}
                >
                  <option value="">All levels</option>
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level} Level
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={filterLabelStyle}>Subject *</label>
                <select
                  value={subjectFilter}
                  onChange={(e) => {
                    setSubjectFilter(e.target.value);
                    setTopicFilter("");
                  }}
                  style={selectStyle}
                  disabled={isLoadingSetup || isSavingEdit}
                >
                  <option value="">Select subject</option>
                  {filteredSubjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={filterLabelStyle}>Topic</label>
                <select
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                  style={selectStyle}
                  disabled={isLoadingSetup || !subjectFilter || isSavingEdit}
                >
                  <option value="">All topics</option>
                  {filteredTopics.map((topic) => (
                    <option key={topic._id} value={topic._id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                onClick={loadQuestions}
                style={{
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: "#185FA5",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor:
                    isLoadingSetup || isLoadingQuestions || isSavingEdit
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    isLoadingSetup || isLoadingQuestions || isSavingEdit
                      ? 0.6
                      : 1,
                  transition: "all 0.2s",
                }}
                disabled={isLoadingSetup || isLoadingQuestions || isSavingEdit}
                onMouseEnter={(e) => {
                  if (!(isLoadingSetup || isLoadingQuestions || isSavingEdit)) {
                    e.currentTarget.style.backgroundColor = "#0e3d6e";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#185FA5";
                }}
              >
                {isLoadingQuestions ? "Loading..." : "Load Questions"}
              </button>

              <button
                onClick={() => navigate("/admin")}
                style={{
                  padding: "10px 18px",
                  border: "0.5px solid rgba(0,0,0,0.12)",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  color: "#334155",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                }}
              >
                ← Back to Admin
              </button>
            </div>
          </div>

          <p
            style={{
              marginBottom: "1.5rem",
              color: "#64748b",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            {hasLoadedQuestions
              ? `📋 Showing ${questions.length} question(s)`
              : "Select course, level, and subject, then click Load Questions."}
          </p>

          <div
            style={{
              background: "#fff",
              border: "0.5px solid rgba(0,0,0,0.08)",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            {isLoadingSetup ? (
              <div style={emptyStateStyle}>
                <p style={{ margin: 0, color: "#64748b" }}>
                  Loading filters...
                </p>
              </div>
            ) : isLoadingQuestions ? (
              <div style={emptyStateStyle}>
                <p style={{ margin: 0, color: "#64748b" }}>
                  Loading questions...
                </p>
              </div>
            ) : !hasLoadedQuestions ? (
              <div style={emptyStateStyle}>
                <p style={emptyTitleStyle}>No questions loaded</p>
                <p style={emptyBodyStyle}>
                  Select filters above and click "Load Questions" to get
                  started.
                </p>
              </div>
            ) : questions.length === 0 ? (
              <div style={emptyStateStyle}>
                <p style={emptyTitleStyle}>No questions found</p>
                <p style={emptyBodyStyle}>
                  There are no questions matching your filters.
                </p>
              </div>
            ) : (
              questions.map((question, index) => {
                const subject = subjectOfQuestion(question);
                const topic = topicOfQuestion(question);
                const questionImageSrc = getQuestionImageSrc(
                  question,
                  questionImages,
                );
                const imagePreviewToShow =
                  editImagePreview || editForm.existingImageSrc;
                const loadingThisImage = Boolean(loadingImageIds[question._id]);
                const imageFileDetails = [
                  question.imageOriginalName,
                  formatFileSize(question.imageSize),
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <div
                    key={question._id}
                    className="question-row"
                    style={{
                      borderBottom:
                        index === questions.length - 1
                          ? "none"
                          : "0.5px solid rgba(0,0,0,0.05)",
                      padding: "1.5rem",
                    }}
                  >
                    {editingId === question._id ? (
                      <div style={{ width: "100%" }}>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "0.75rem",
                            marginBottom: "1rem",
                          }}
                        >
                          <div>
                            <label style={labelStyle}>Subject *</label>
                            <select
                              value={editForm.subjectId}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  subjectId: e.target.value,
                                  topicId: "",
                                })
                              }
                              style={inputStyle}
                              disabled={isSavingEdit}
                            >
                              <option value="">Select subject</option>
                              {subjects.map((item) => (
                                <option key={item._id} value={item._id}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label style={labelStyle}>Topic *</label>
                            <select
                              value={editForm.topicId}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  topicId: e.target.value,
                                })
                              }
                              style={inputStyle}
                              disabled={isSavingEdit}
                            >
                              <option value="">Select topic</option>
                              {editTopics.map((item) => (
                                <option key={item._id} value={item._id}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label style={labelStyle}>Question text *</label>
                          <textarea
                            value={editForm.questionText}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                questionText: e.target.value,
                              })
                            }
                            style={textareaStyle}
                            placeholder="Enter question text"
                            disabled={isSavingEdit}
                          />
                        </div>

                        <div>
                          <label style={labelStyle}>Options (min 2) *</label>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(180px, 1fr))",
                              gap: "0.75rem",
                              marginBottom: "1rem",
                            }}
                          >
                            {editForm.options.map((option, optionIndex) => (
                              <input
                                key={optionIndex}
                                value={option}
                                onChange={(e) =>
                                  updateOption(optionIndex, e.target.value)
                                }
                                style={inputStyle}
                                placeholder={`Option ${optionIndex + 1}`}
                                disabled={isSavingEdit}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <label style={labelStyle}>Correct answer *</label>
                          <input
                            value={editForm.correctAnswer}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                correctAnswer: e.target.value,
                              })
                            }
                            style={inputStyle}
                            placeholder="Must match one of the options"
                            disabled={isSavingEdit}
                          />
                        </div>

                        <div>
                          <label style={labelStyle}>Explanation *</label>
                          <textarea
                            value={editForm.explanation}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                explanation: e.target.value,
                              })
                            }
                            style={textareaStyle}
                            placeholder="Provide detailed explanation"
                            disabled={isSavingEdit}
                          />
                        </div>

                        <div
                          style={{
                            background: "#f8fafc",
                            border: "0.5px solid rgba(0,0,0,0.08)",
                            borderRadius: "10px",
                            padding: "1.25rem",
                            marginBottom: "1rem",
                          }}
                        >
                          <label style={labelStyle}>Question image</label>

                          {imagePreviewToShow ? (
                            <div
                              style={{
                                border: "0.5px solid rgba(0,0,0,0.08)",
                                borderRadius: "8px",
                                padding: "8px",
                                marginBottom: "1rem",
                                background: "#fff",
                              }}
                            >
                              <img
                                src={imagePreviewToShow}
                                alt="Question preview"
                                style={{
                                  width: "100%",
                                  maxWidth: "400px",
                                  maxHeight: "280px",
                                  objectFit: "contain",
                                  borderRadius: "6px",
                                  display: "block",
                                  margin: "0 auto",
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              style={{
                                border: "1px dashed rgba(0,0,0,0.12)",
                                borderRadius: "8px",
                                padding: "1.5rem",
                                marginBottom: "1rem",
                                textAlign: "center",
                                color: "#94a3b8",
                                fontSize: "13px",
                              }}
                            >
                              No image attached
                            </div>
                          )}

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleEditImageChange}
                            style={{
                              ...inputStyle,
                              marginBottom: "0.75rem",
                              padding: "8px",
                            }}
                            disabled={isSavingEdit}
                          />

                          <button
                            type="button"
                            onClick={removeCurrentImage}
                            disabled={isSavingEdit}
                            style={{
                              padding: "8px 14px",
                              border: "0.5px solid #FCA5A5",
                              borderRadius: "6px",
                              background: "#FEE2E2",
                              color: "#DC2626",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: isSavingEdit ? "not-allowed" : "pointer",
                              opacity: isSavingEdit ? 0.6 : 1,
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSavingEdit) {
                                e.currentTarget.style.background = "#FECACA";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#FEE2E2";
                            }}
                          >
                            Remove image
                          </button>

                          <p
                            style={{
                              fontSize: "12px",
                              color: "#64748b",
                              margin: "0.75rem 0 0",
                            }}
                          >
                            JPG, PNG, or WEBP. Max 5MB.
                          </p>
                        </div>

                        <div style={{ display: "flex", gap: "0.75rem" }}>
                          <button
                            onClick={() => saveEdit(question._id)}
                            disabled={isSavingEdit}
                            style={{
                              padding: "10px 16px",
                              border: "none",
                              borderRadius: "6px",
                              background: "#185FA5",
                              color: "#fff",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: isSavingEdit ? "not-allowed" : "pointer",
                              opacity: isSavingEdit ? 0.6 : 1,
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSavingEdit) {
                                e.currentTarget.style.background = "#0e3d6e";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#185FA5";
                            }}
                          >
                            {isSavingEdit ? "Saving..." : "Save"}
                          </button>

                          <button
                            onClick={cancelEdit}
                            disabled={isSavingEdit}
                            style={{
                              padding: "10px 16px",
                              border: "0.5px solid rgba(0,0,0,0.12)",
                              borderRadius: "6px",
                              background: "#fff",
                              color: "#334155",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: isSavingEdit ? "not-allowed" : "pointer",
                              opacity: isSavingEdit ? 0.6 : 1,
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSavingEdit) {
                                e.currentTarget.style.background = "#f1f5f9";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#fff";
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ marginBottom: "1rem" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "1rem",
                              marginBottom: "0.75rem",
                              flexWrap: "wrap",
                            }}
                          >
                            <h3
                              style={{
                                margin: 0,
                                fontSize: "16px",
                                fontWeight: "700",
                                color: "#0f172a",
                              }}
                            >
                              Question {index + 1}
                            </h3>

                            {subject && subject._id ? (
                              <span
                                style={{
                                  fontSize: "12px",
                                  padding: "4px 10px",
                                  background: "#E6F1FB",
                                  color: "#185FA5",
                                  borderRadius: "6px",
                                  fontWeight: "600",
                                }}
                              >
                                {getCourseName(subject)} · L
                                {subject?.level || "?"}
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: "12px",
                                  padding: "4px 10px",
                                  background: "#FEE2E2",
                                  color: "#DC2626",
                                  borderRadius: "6px",
                                  fontWeight: "600",
                                }}
                              >
                                ⚠️ Deleted Subject
                              </span>
                            )}

                            {hasQuestionImage(question) && (
                              <span
                                style={{
                                  fontSize: "12px",
                                  padding: "4px 10px",
                                  background: "#ECFDF5",
                                  color: "#047857",
                                  borderRadius: "6px",
                                  fontWeight: "600",
                                }}
                              >
                                🖼 Image attached
                              </span>
                            )}
                          </div>

                          <p
                            style={{
                              margin: "0.5rem 0 0",
                              fontSize: "12px",
                              color: "#64748b",
                            }}
                          >
                            <strong>Subject: </strong>{" "}
                            {subject?.name || "Deleted"} |{" "}
                            <strong>Topic: </strong> {topic?.name || "Deleted"}
                          </p>
                        </div>

                        {questionImageSrc && (
                          <div
                            style={{
                              border: "0.5px solid rgba(0,0,0,0.08)",
                              borderRadius: "10px",
                              padding: "8px",
                              marginBottom: "1rem",
                              background: "#f8fafc",
                            }}
                          >
                            <img
                              src={questionImageSrc}
                              alt="Question"
                              style={{
                                width: "100%",
                                maxWidth: "500px",
                                maxHeight: "280px",
                                objectFit: "contain",
                                borderRadius: "6px",
                                display: "block",
                              }}
                            />
                          </div>
                        )}

                        {!questionImageSrc && hasQuestionImage(question) && (
                          <div
                            style={{
                              border: "1px dashed rgba(0,0,0,0.12)",
                              borderRadius: "10px",
                              padding: "1rem",
                              marginBottom: "1rem",
                              background: "#f8fafc",
                              color: "#64748b",
                              fontSize: "13px",
                            }}
                          >
                            <p style={{ margin: "0 0 0.75rem" }}>
                              Image is attached
                              {imageFileDetails ? `, ${imageFileDetails}` : ""}.
                            </p>

                            <button
                              type="button"
                              onClick={() => loadQuestionImage(question)}
                              disabled={loadingThisImage}
                              style={{
                                padding: "8px 13px",
                                border: "0.5px solid rgba(24,95,165,0.25)",
                                borderRadius: "6px",
                                background: "#E6F1FB",
                                color: "#185FA5",
                                fontSize: "12px",
                                fontWeight: "700",
                                cursor: loadingThisImage
                                  ? "not-allowed"
                                  : "pointer",
                                opacity: loadingThisImage ? 0.65 : 1,
                              }}
                            >
                              {loadingThisImage
                                ? "Loading image..."
                                : "Load image"}
                            </button>
                          </div>
                        )}

                        <p
                          style={{
                            fontSize: "14px",
                            color: "#0f172a",
                            lineHeight: "1.6",
                            marginBottom: "1rem",
                          }}
                        >
                          {question.questionText}
                        </p>

                        <div style={{ marginBottom: "1rem" }}>
                          <p
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#64748b",
                              marginBottom: "0.5rem",
                            }}
                          >
                            Options:
                          </p>
                          <ol
                            style={{
                              margin: "0",
                              paddingLeft: "1.5rem",
                              color: "#475569",
                              fontSize: "13px",
                            }}
                          >
                            {(question.options || []).map(
                              (option, optionIndex) => (
                                <li key={`${question._id}-${optionIndex}`}>
                                  {option}
                                </li>
                              ),
                            )}
                          </ol>
                        </div>

                        <div
                          style={{
                            background: "#f8fafc",
                            border: "0.5px solid rgba(0,0,0,0.08)",
                            borderRadius: "8px",
                            padding: "1rem",
                            marginBottom: "1rem",
                          }}
                        >
                          <p
                            style={{
                              margin: "0 0 0.5rem",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#64748b",
                            }}
                          >
                            ✓ Correct answer
                          </p>
                          <p
                            style={{
                              margin: "0 0 1rem",
                              fontSize: "14px",
                              color: "#0f172a",
                              fontWeight: "600",
                            }}
                          >
                            {question.correctAnswer}
                          </p>

                          <p
                            style={{
                              margin: "0 0 0.5rem",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#64748b",
                            }}
                          >
                            💡 Explanation
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "13px",
                              color: "#475569",
                              lineHeight: "1.6",
                            }}
                          >
                            {question.explanation}
                          </p>
                        </div>

                        <div style={{ display: "flex", gap: "0.75rem" }}>
                          <button
                            onClick={() => startEdit(question)}
                            disabled={isSavingEdit}
                            style={{
                              padding: "9px 16px",
                              border: "none",
                              borderRadius: "6px",
                              background: "#185FA5",
                              color: "#fff",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: isSavingEdit ? "not-allowed" : "pointer",
                              opacity: isSavingEdit ? 0.6 : 1,
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSavingEdit) {
                                e.currentTarget.style.background = "#0e3d6e";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#185FA5";
                            }}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            onClick={() => deleteQuestion(question._id)}
                            disabled={isSavingEdit}
                            style={{
                              padding: "9px 16px",
                              border: "0.5px solid #FCA5A5",
                              borderRadius: "6px",
                              background: "#FEE2E2",
                              color: "#DC2626",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: isSavingEdit ? "not-allowed" : "pointer",
                              opacity: isSavingEdit ? 0.6 : 1,
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSavingEdit) {
                                e.currentTarget.style.background = "#FECACA";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#FEE2E2";
                            }}
                          >
                            🗑️ Delete
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
    </>
  );
}

const filterLabelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "12px",
  fontWeight: "600",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const selectStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: "8px",
  border: "0.5px solid rgba(0,0,0,0.12)",
  fontSize: "13px",
  boxSizing: "border-box",
  background: "#fff",
  color: "#0f172a",
  transition: "all 0.2s",
  outline: "none",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23334155' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  paddingRight: "28px",
};

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: "8px",
  border: "0.5px solid rgba(0,0,0,0.12)",
  fontSize: "13px",
  boxSizing: "border-box",
  background: "#fff",
  color: "#0f172a",
  transition: "all 0.2s",
  outline: "none",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: "80px",
  resize: "vertical",
  marginBottom: "1rem",
  fontFamily: "inherit",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: "600",
  color: "#0f172a",
};

const emptyStateStyle = {
  padding: "3rem 2rem",
  textAlign: "center",
  color: "#64748b",
};

const emptyTitleStyle = {
  margin: "0 0 0.5rem",
  fontSize: "15px",
  fontWeight: "700",
  color: "#0f172a",
};

const emptyBodyStyle = {
  margin: 0,
  fontSize: "13px",
  color: "#64748b",
  lineHeight: "1.6",
};

export default ManageQuestionsPage;
