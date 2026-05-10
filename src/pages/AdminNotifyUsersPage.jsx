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

const getSubjectCourseId = (subject) =>
  typeof subject?.courseId === "object"
    ? subject.courseId?._id
    : subject?.courseId;

const getSubjectCourseName = (subject) =>
  typeof subject?.courseId === "object"
    ? subject.courseId?.name || "Unknown course"
    : "Unknown course";

async function fetchAllPages(url, key, config = {}) {
  let page = 1;
  let totalPages = 1;
  const allItems = [];

  do {
    const separator = url.includes("?") ? "&" : "?";

    const response = await api.get(
      `${url}${separator}page=${page}&limit=100`,
      config,
    );

    allItems.push(...apiArray(response.data, key));
    totalPages = Number(response.data?.totalPages || 1);
    page += 1;
  } while (page <= totalPages);

  return allItems;
}

function AdminNotifyUsersPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  const [courseId, setCourseId] = useState("");
  const [level, setLevel] = useState("");
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);
  const [customMessage, setCustomMessage] = useState("");

  const [recipientPreview, setRecipientPreview] = useState(null);
  const [isLoadingSetup, setIsLoadingSetup] = useState(true);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const S = {
    container: {
      minHeight: "100vh",
      background: "#f8fafc",
      padding: "40px 20px",
    },
    maxWidth: {
      maxWidth: "1100px",
      margin: "0 auto",
    },
    header: {
      marginBottom: "2rem",
    },
    eyebrow: {
      margin: "0 0 0.75rem",
      color: "#64748b",
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },
    title: {
      margin: "0 0 0.5rem",
      color: "#0f172a",
      fontSize: "32px",
      fontWeight: "700",
    },
    subtitle: {
      margin: 0,
      color: "#64748b",
      fontSize: "14px",
      lineHeight: "1.6",
    },
    card: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      padding: "1.5rem",
      marginBottom: "1.25rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    },
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      gap: "1rem",
      alignItems: "flex-start",
      flexWrap: "wrap",
      marginBottom: "1rem",
    },
    sectionTitle: {
      margin: "0 0 0.35rem",
      color: "#0f172a",
      fontSize: "18px",
      fontWeight: "600",
    },
    sectionText: {
      margin: 0,
      color: "#64748b",
      fontSize: "13px",
      lineHeight: "1.6",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "1rem",
    },
    label: {
      display: "block",
      marginBottom: "6px",
      color: "#0f172a",
      fontSize: "13px",
      fontWeight: "700",
    },
    select: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      background: "white",
      color: "#0f172a",
      fontSize: "13px",
      outline: "none",
    },
    textarea: {
      width: "100%",
      minHeight: "120px",
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      background: "white",
      color: "#0f172a",
      fontSize: "14px",
      outline: "none",
      resize: "vertical",
      boxSizing: "border-box",
      marginTop: "0.75rem",
    },
    checkboxGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "0.75rem",
    },
    checkboxCard: {
      display: "flex",
      gap: "0.75rem",
      alignItems: "flex-start",
      padding: "0.9rem",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      background: "#f8fafc",
      color: "#0f172a",
      cursor: "pointer",
    },
    buttonGroup: {
      display: "flex",
      gap: "0.5rem",
      flexWrap: "wrap",
    },
    smallButton: {
      padding: "8px 12px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      background: "white",
      color: "#0f172a",
      fontSize: "12px",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    primaryButton: {
      width: "100%",
      marginTop: "1rem",
      padding: "13px 16px",
      border: "none",
      borderRadius: "10px",
      background: "#185fa5",
      color: "white",
      fontWeight: "700",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    secondaryButton: {
      padding: "10px 14px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      background: "white",
      color: "#0f172a",
      fontWeight: "700",
      fontSize: "13px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    empty: {
      padding: "1.25rem",
      border: "1px dashed #cbd5e1",
      borderRadius: "10px",
      color: "#64748b",
      background: "#f8fafc",
      fontSize: "13px",
      textAlign: "center",
    },
    infoBox: {
      marginTop: "1rem",
      padding: "0.85rem",
      borderRadius: "10px",
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      color: "#0f172a",
      fontSize: "13px",
    },
    summaryBox: {
      marginTop: "1rem",
      padding: "1rem",
      borderRadius: "10px",
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
    },
    summaryTitle: {
      margin: "0 0 0.5rem",
      color: "#0f172a",
      fontSize: "13px",
      fontWeight: "700",
    },
    summaryText: {
      margin: "0.25rem 0",
      color: "#64748b",
      fontSize: "13px",
    },
    statusBox: {
      marginTop: "1rem",
      padding: "0.85rem",
      borderRadius: "10px",
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      color: "#0f172a",
      fontSize: "13px",
    },
  };

  const fetchSetupData = async () => {
    try {
      setIsLoadingSetup(true);
      setStatusMessage("");

      const [coursesRes, subjectsRes, topicsRes] = await Promise.all([
        api.get("/api/courses?limit=100"),
        fetchAllPages("/api/subjects/admin/all", "subjects", {
          _tokenType: "admin",
        }),
        fetchAllPages("/api/topics/admin/all", "topics", {
          _tokenType: "admin",
        }),
      ]);

      setCourses(apiArray(coursesRes.data, "courses"));
      setSubjects(subjectsRes);
      setTopics(topicsRes);
    } catch (error) {
      console.error("Notification setup error:", error);
      setStatusMessage(error.message || "Failed to load notification setup.");
    } finally {
      setIsLoadingSetup(false);
    }
  };

  useEffect(() => {
    fetchSetupData();
  }, []);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const matchesCourse = courseId
        ? getSubjectCourseId(subject) === courseId
        : true;

      const matchesLevel = level
        ? Number(subject.level) === Number(level)
        : true;

      return matchesCourse && matchesLevel;
    });
  }, [subjects, courseId, level]);

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const subject = topic.subjectId || {};
      const subjectId = subject?._id || subject;

      if (selectedSubjectIds.length > 0) {
        return selectedSubjectIds.includes(subjectId);
      }

      const matchesCourse = courseId
        ? getSubjectCourseId(subject) === courseId
        : true;

      const matchesLevel = level
        ? Number(subject.level) === Number(level)
        : true;

      return matchesCourse && matchesLevel;
    });
  }, [topics, courseId, level, selectedSubjectIds]);

  const selectedSubjects = useMemo(() => {
    const selected = new Set(selectedSubjectIds);
    return subjects.filter((subject) => selected.has(subject._id));
  }, [subjects, selectedSubjectIds]);

  const selectedTopics = useMemo(() => {
    const selected = new Set(selectedTopicIds);
    return topics.filter((topic) => selected.has(topic._id));
  }, [topics, selectedTopicIds]);

  const resetSelectionsOnAudienceChange = () => {
    setSelectedSubjectIds([]);
    setSelectedTopicIds([]);
    setRecipientPreview(null);
    setStatusMessage("");
  };

  const toggleSubject = (subjectId) => {
    setRecipientPreview(null);
    setStatusMessage("");

    setSelectedSubjectIds((previous) => {
      const alreadySelected = previous.includes(subjectId);

      if (alreadySelected) {
        setSelectedTopicIds((previousTopics) =>
          previousTopics.filter((topicId) => {
            const topic = topics.find((item) => item._id === topicId);
            const topicSubjectId = topic?.subjectId?._id || topic?.subjectId;
            return topicSubjectId !== subjectId;
          }),
        );

        return previous.filter((id) => id !== subjectId);
      }

      return [...previous, subjectId];
    });
  };

  const toggleTopic = (topicId) => {
    setRecipientPreview(null);
    setStatusMessage("");

    setSelectedTopicIds((previous) =>
      previous.includes(topicId)
        ? previous.filter((id) => id !== topicId)
        : [...previous, topicId],
    );
  };

  const selectAllSubjects = () => {
    setRecipientPreview(null);
    setStatusMessage("");
    setSelectedSubjectIds(filteredSubjects.map((subject) => subject._id));
  };

  const clearSubjects = () => {
    setRecipientPreview(null);
    setStatusMessage("");
    setSelectedSubjectIds([]);
    setSelectedTopicIds([]);
  };

  const selectAllTopics = () => {
    setRecipientPreview(null);
    setStatusMessage("");
    setSelectedTopicIds(filteredTopics.map((topic) => topic._id));
  };

  const clearTopics = () => {
    setRecipientPreview(null);
    setStatusMessage("");
    setSelectedTopicIds([]);
  };

  const validateForm = () => {
    if (!courseId) {
      alert("Please select a course.");
      return false;
    }

    if (!level) {
      alert("Please select a level.");
      return false;
    }

    if (selectedSubjectIds.length === 0 && selectedTopicIds.length === 0) {
      alert("Please select at least one subject or one topic.");
      return false;
    }

    return true;
  };

  const previewRecipients = async () => {
    if (!courseId || !level) {
      alert("Please select course and level first.");
      return;
    }

    try {
      setIsPreviewing(true);
      setStatusMessage("");

      const response = await api.post(
        "/api/notifications/questions-available/preview",
        {
          courseId,
          level: Number(level),
        },
        { _tokenType: "admin" },
      );

      setRecipientPreview(response.data);
    } catch (error) {
      console.error("Preview recipients error:", error);
      setStatusMessage(error.message || "Failed to preview recipients.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const sendNotification = async () => {
    if (isSending) return;
    if (!validateForm()) return;

    const recipientCount = recipientPreview?.recipientCount;

    if (typeof recipientCount === "number" && recipientCount === 0) {
      alert("No users were found for this course and level.");
      return;
    }

    const confirmText =
      typeof recipientCount === "number"
        ? `Send email notification to ${recipientCount} user(s)?`
        : "Send email notification to users in the selected course and level?";

    if (!window.confirm(confirmText)) return;

    try {
      setIsSending(true);
      setStatusMessage("");

      const response = await api.post(
        "/api/notifications/questions-available",
        {
          courseId,
          level: Number(level),
          subjectIds: selectedSubjectIds,
          topicIds: selectedTopicIds,
          customMessage: customMessage.trim(),
        },
        { _tokenType: "admin" },
      );

      setStatusMessage(
        response.data?.message ||
          `Notification sent to ${response.data?.sentCount || 0} user(s).`,
      );

      setRecipientPreview({
        recipientCount: response.data?.recipientCount || 0,
        sentCount: response.data?.sentCount || 0,
      });
    } catch (error) {
      console.error("Send notification error:", error);
      setStatusMessage(error.message || "Failed to send notification.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={S.container}>
      <div style={S.maxWidth}>
        <div style={S.header}>
          <p style={S.eyebrow}>Admin / Notifications</p>
          <h1 style={S.title}>Notify Users</h1>
          <p style={S.subtitle}>
            Email users when new questions are available for selected subjects
            or topics.
          </p>
        </div>

        <div style={S.card}>
          <div style={S.sectionHeader}>
            <div>
              <h2 style={S.sectionTitle}>Audience</h2>
              <p style={S.sectionText}>
                Choose the course and level of users that should receive this
                email.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              style={S.secondaryButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f1f5f9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              ← Back to Admin
            </button>
          </div>

          <div style={S.grid}>
            <div>
              <label style={S.label}>Course *</label>
              <select
                value={courseId}
                onChange={(event) => {
                  setCourseId(event.target.value);
                  resetSelectionsOnAudienceChange();
                }}
                style={S.select}
                disabled={isLoadingSetup || isSending}
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={S.label}>Level *</label>
              <select
                value={level}
                onChange={(event) => {
                  setLevel(event.target.value);
                  resetSelectionsOnAudienceChange();
                }}
                style={S.select}
                disabled={isLoadingSetup || isSending}
              >
                <option value="">Select level</option>
                {LEVELS.map((item) => (
                  <option key={item} value={item}>
                    {item} Level
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={previewRecipients}
            disabled={isPreviewing || isSending || !courseId || !level}
            style={{
              ...S.secondaryButton,
              opacity:
                isPreviewing || isSending || !courseId || !level ? 0.6 : 1,
              cursor:
                isPreviewing || isSending || !courseId || !level
                  ? "not-allowed"
                  : "pointer",
              marginTop: "1rem",
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = "#f1f5f9";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
            }}
          >
            {isPreviewing ? "Checking users..." : "Preview recipient count"}
          </button>

          {recipientPreview && (
            <div style={S.infoBox}>
              <strong>{recipientPreview.recipientCount ?? 0}</strong> user(s)
              found for this course and level.
            </div>
          )}
        </div>

        <div style={S.card}>
          <div style={S.sectionHeader}>
            <div>
              <h2 style={S.sectionTitle}>Subjects</h2>
              <p style={S.sectionText}>
                Select one or more subjects to include in the email.
              </p>
            </div>

            <div style={S.buttonGroup}>
              <button
                type="button"
                onClick={selectAllSubjects}
                style={S.smallButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                Select all
              </button>
              <button
                type="button"
                onClick={clearSubjects}
                style={S.smallButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {isLoadingSetup ? (
            <div style={S.empty}>Loading subjects...</div>
          ) : filteredSubjects.length === 0 ? (
            <div style={S.empty}>
              No subjects found for the selected course and level.
            </div>
          ) : (
            <div style={S.checkboxGrid}>
              {filteredSubjects.map((subject) => (
                <label key={subject._id} style={S.checkboxCard}>
                  <input
                    type="checkbox"
                    checked={selectedSubjectIds.includes(subject._id)}
                    onChange={() => toggleSubject(subject._id)}
                    disabled={isSending}
                  />
                  <span>
                    <strong>{subject.name}</strong>
                    <small
                      style={{
                        display: "block",
                        color: "#64748b",
                        marginTop: "4px",
                      }}
                    >
                      {getSubjectCourseName(subject)} · {subject.level} Level
                    </small>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div style={S.card}>
          <div style={S.sectionHeader}>
            <div>
              <h2 style={S.sectionTitle}>Topics</h2>
              <p style={S.sectionText}>
                Select specific topics. If no topic is selected, the email will
                mention the selected subjects only.
              </p>
            </div>

            <div style={S.buttonGroup}>
              <button
                type="button"
                onClick={selectAllTopics}
                style={S.smallButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                Select all
              </button>
              <button
                type="button"
                onClick={clearTopics}
                style={S.smallButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {filteredTopics.length === 0 ? (
            <div style={S.empty}>
              Select a subject to see matching topics, or no topics are
              available.
            </div>
          ) : (
            <div style={S.checkboxGrid}>
              {filteredTopics.map((topic) => {
                const subject = topic.subjectId || {};

                return (
                  <label key={topic._id} style={S.checkboxCard}>
                    <input
                      type="checkbox"
                      checked={selectedTopicIds.includes(topic._id)}
                      onChange={() => toggleTopic(topic._id)}
                      disabled={isSending}
                    />
                    <span>
                      <strong>{topic.name}</strong>
                      <small
                        style={{
                          display: "block",
                          color: "#64748b",
                          marginTop: "4px",
                        }}
                      >
                        {subject.name || "Unknown subject"}
                      </small>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div style={S.card}>
          <h2 style={S.sectionTitle}>Email message</h2>
          <p style={S.sectionText}>
            Optional. Leave blank to use the default notification message.
          </p>

          <textarea
            value={customMessage}
            onChange={(event) => setCustomMessage(event.target.value)}
            placeholder="Example: New practice questions have been added. Please log in and start practicing."
            style={S.textarea}
            disabled={isSending}
          />

          <div style={S.summaryBox}>
            <p style={S.summaryTitle}>Notification summary</p>
            <p style={S.summaryText}>
              Subjects selected: <strong>{selectedSubjects.length}</strong>
            </p>
            <p style={S.summaryText}>
              Topics selected: <strong>{selectedTopics.length}</strong>
            </p>
            <p style={S.summaryText}>
              Target level:{" "}
              <strong>{level ? `${level} Level` : "Not selected"}</strong>
            </p>
          </div>

          {statusMessage && <div style={S.statusBox}>{statusMessage}</div>}

          <button
            type="button"
            onClick={sendNotification}
            disabled={isSending}
            style={{
              ...S.primaryButton,
              opacity: isSending ? 0.7 : 1,
              cursor: isSending ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = "#0e3d6e";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#185fa5";
            }}
          >
            {isSending ? "Sending emails..." : "Send Notification"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminNotifyUsersPage;
