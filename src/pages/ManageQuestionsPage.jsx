import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

const apiArray = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};


const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f5f1",
    padding: "40px 24px",
    fontFamily: "'Geist', 'Inter', sans-serif",
  },
  inner: { maxWidth: "940px", margin: "0 auto" },
  breadcrumb: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "11px",
    color: "#64748b",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "10px",
  },
  pageTitle: {
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontSize: "40px",
    fontStyle: "italic",
    color: "#0f172a",
    lineHeight: 1.1,
    marginBottom: "8px",
  },
  pageSub: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: 1.6,
    marginBottom: "36px",
  },
  card: {
    background: "#fff",
    border: "0.5px solid rgba(15,23,42,0.1)",
    borderRadius: "16px",
    overflow: "hidden",
  },
  filtersRow: {
    padding: "20px 24px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1.4fr",
    gap: "14px",
    borderBottom: "0.5px solid rgba(15,23,42,0.1)",
    background: "#f9f8f5",
  },
  fieldLabel: {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#64748b",
    fontFamily: "'DM Mono', monospace",
    marginBottom: "6px",
  },
  select: {
    width: "100%",
    padding: "9px 28px 9px 12px",
    border: "0.5px solid rgba(15,23,42,0.18)",
    borderRadius: "8px",
    background: "#fff",
    color: "#0f172a",
    fontSize: "13px",
    outline: "none",
    appearance: "none",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2364748b' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    border: "0.5px solid rgba(15,23,42,0.18)",
    borderRadius: "8px",
    background: "#fff",
    color: "#0f172a",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "9px 12px",
    border: "0.5px solid rgba(15,23,42,0.18)",
    borderRadius: "8px",
    background: "#fff",
    color: "#0f172a",
    fontSize: "13px",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "'Geist', 'Inter', sans-serif",
  },
  bulkBar: {
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderBottom: "0.5px solid rgba(15,23,42,0.1)",
    flexWrap: "wrap",
  },
  bulkLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "11px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginRight: "4px",
  },
  rangeInput: {
    width: "64px",
    padding: "7px 10px",
    border: "0.5px solid rgba(15,23,42,0.18)",
    borderRadius: "8px",
    fontSize: "12px",
    outline: "none",
    boxSizing: "border-box",
  },
  rangeSep: { fontSize: "13px", color: "#94a3b8" },
  btn: {
    padding: "7px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
    border: "0.5px solid rgba(15,23,42,0.18)",
    background: "#fff",
    color: "#0f172a",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
  },
  btnAccent: {
    background: "#185FA5",
    color: "#fff",
    border: "none",
  },
  btnDanger: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
  },
  btnGhost: {
    background: "#f9f8f5",
    border: "0.5px solid rgba(15,23,42,0.18)",
    color: "#0f172a",
  },
  countBar: {
    padding: "12px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "0.5px solid rgba(15,23,42,0.1)",
  },
  countBadge: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "11px",
    color: "#64748b",
  },
  selBadge: {
    background: "#e6f1fb",
    color: "#185FA5",
    fontFamily: "'DM Mono', monospace",
    fontSize: "11px",
    padding: "3px 10px",
    borderRadius: "20px",
  },
  qItem: {
    borderBottom: "0.5px solid rgba(15,23,42,0.08)",
    padding: "18px 24px",
    display: "flex",
    gap: "14px",
  },
  qNum: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "11px",
    color: "#94a3b8",
    marginBottom: "5px",
  },
  qMeta: { display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" },
  pillSubj: {
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "20px",
    fontWeight: 500,
    background: "#e6f1fb",
    color: "#185FA5",
  },
  pillTopic: {
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "20px",
    fontWeight: 500,
    background: "#eaf3de",
    color: "#3B6D11",
  },
  qText: {
    fontSize: "14px",
    color: "#0f172a",
    lineHeight: 1.5,
    marginBottom: "8px",
    fontWeight: 500,
  },
  qAnswer: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "11px",
    color: "#3B6D11",
    background: "#eaf3de",
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "6px",
    marginBottom: "10px",
  },
  qActions: { display: "flex", gap: "8px" },
  editForm: {
    padding: "20px 24px",
    background: "#f9f8f5",
    borderBottom: "0.5px solid rgba(15,23,42,0.1)",
  },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  editField: { marginBottom: "12px" },
  optRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginBottom: "8px",
  },
  formActions: { display: "flex", gap: "8px", marginTop: "16px" },
  footerBar: {
    padding: "20px 24px",
    borderTop: "0.5px solid rgba(15,23,42,0.1)",
  },
  empty: {
    padding: "60px 24px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px",
  },
};

function QuestionItem({
  question,
  index,
  isSelected,
  isEditing,
  onToggleSelect,
  onEdit,
  onDelete,
  onUpdate,
  onCancelEdit,
  subjects,
  editTopics,
  onEditSubjectChange,
}) {
  const [subjectId, setSubjectId] = useState(
    question.subjectId?._id || question.subjectId || "",
  );
  const [topicId, setTopicId] = useState(
    question.topicId?._id || question.topicId || "",
  );
  const [questionText, setQuestionText] = useState(question.questionText);
  const [options, setOptions] = useState(
    question.options.length ? question.options : ["", "", "", ""],
  );
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer);
  const [explanation, setExplanation] = useState(question.explanation);

  useEffect(() => {
    if (isEditing) {
      setSubjectId(question.subjectId?._id || question.subjectId || "");
      setTopicId(question.topicId?._id || question.topicId || "");
      setQuestionText(question.questionText);
      setOptions(question.options.length ? question.options : ["", "", "", ""]);
      setCorrectAnswer(question.correctAnswer);
      setExplanation(question.explanation);
    }
  }, [isEditing]);

  const handleSubjectChange = (val) => {
    setSubjectId(val);
    setTopicId("");
    onEditSubjectChange(val);
  };

  const handleOptionChange = (i, val) => {
    const updated = [...options];
    updated[i] = val;
    setOptions(updated);
    const cleaned = updated.map((o) => o.trim()).filter(Boolean);
    if (correctAnswer && !cleaned.includes(correctAnswer)) setCorrectAnswer("");
  };

  const removeOption = (i) => {
    if (options.length <= 2) return;
    const updated = options.filter((_, idx) => idx !== i);
    setOptions(updated);
    const cleaned = updated.map((o) => o.trim()).filter(Boolean);
    if (correctAnswer && !cleaned.includes(correctAnswer)) setCorrectAnswer("");
  };

  const validOptions = options.map((o) => o.trim()).filter(Boolean);

  const handleSave = () => {
    onUpdate(question._id, {
      subjectId,
      topicId,
      questionText,
      options,
      correctAnswer,
      explanation,
    });
  };

  if (isEditing) {
    return (
      <div style={styles.editForm}>
        <div style={styles.twoCol}>
          <div style={styles.editField}>
            <label style={styles.fieldLabel}>Subject</label>
            <select
              style={styles.select}
              value={subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.editField}>
            <label style={styles.fieldLabel}>Topic</label>
            <select
              style={styles.select}
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              disabled={!subjectId}
            >
              <option value="">
                {subjectId ? "Select topic" : "Select subject first"}
              </option>
              {editTopics.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={styles.editField}>
          <label style={styles.fieldLabel}>Question</label>
          <textarea
            style={styles.textarea}
            rows={3}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Question text"
          />
        </div>
        <div style={styles.editField}>
          <label style={styles.fieldLabel}>Options</label>
          {options.map((opt, i) => (
            <div key={i} style={styles.optRow}>
              <input
                style={{ ...styles.input, flex: 1 }}
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
              />
              {options.length > 2 && (
                <button
                  style={{
                    ...styles.btn,
                    color: "#dc2626",
                    borderColor: "#fecaca",
                    padding: "5px 10px",
                    fontSize: "11px",
                  }}
                  onClick={() => removeOption(i)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button
              style={{
                ...styles.btn,
                fontSize: "11px",
                padding: "5px 12px",
                marginTop: "4px",
              }}
              onClick={() => setOptions([...options, ""])}
            >
              + Add option
            </button>
          )}
        </div>
        <div style={styles.editField}>
          <label style={styles.fieldLabel}>Correct answer</label>
          <select
            style={styles.select}
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
          >
            <option value="">Select correct answer</option>
            {validOptions.map((o, i) => (
              <option key={i} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.editField}>
          <label style={styles.fieldLabel}>Explanation</label>
          <textarea
            style={styles.textarea}
            rows={2}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explanation"
          />
        </div>
        <div style={styles.formActions}>
          <button
            style={{ ...styles.btn, ...styles.btnAccent }}
            onClick={handleSave}
          >
            Save changes
          </button>
          <button style={styles.btn} onClick={onCancelEdit}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...styles.qItem,
        background: isSelected ? "#eef6ff" : "transparent",
      }}
    >
      <div style={{ paddingTop: "2px" }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(question._id)}
          style={{
            width: 16,
            height: 16,
            accentColor: "#185FA5",
            cursor: "pointer",
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <div style={styles.qNum}>#{index + 1}</div>
        <div style={styles.qMeta}>
          <span style={styles.pillSubj}>
            {question.subjectId?.name || "Unknown"}
          </span>
          <span style={styles.pillTopic}>
            {question.topicId?.name || "Unknown"}
          </span>
        </div>
        <div style={styles.qText}>{question.questionText}</div>
        <div style={styles.qAnswer}>✓ {question.correctAnswer}</div>
        <div style={styles.qActions}>
          <button
            style={{ ...styles.btn, ...styles.btnAccent }}
            onClick={() => onEdit(question)}
          >
            Edit
          </button>
          <button
            style={{ ...styles.btn, ...styles.btnDanger }}
            onClick={() => onDelete(question._id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ManageQuestionsPage() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [editTopics, setEditTopics] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [filterSubjectId, setFilterSubjectId] = useState("");
  const [filterTopicId, setFilterTopicId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchQuestions = async () => {
    try {
      const res = await api.get("/api/questions/admin/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setQuestions(apiArray(res.data, "questions"));
    } catch (e) {
      console.error("Error fetching questions:", e);
    }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/api/subjects/admin/all", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });
        setSubjects(apiArray(res.data, "subjects"));
      } catch (e) {
        console.error("Error fetching subjects:", e);
      }
    };
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
        const res = await api.get(`/api/topics/subject/${filterSubjectId}`);
        setTopics(apiArray(res.data, "topics"));
        setFilterTopicId("");
      } catch (e) {
        console.error("Error fetching filter topics:", e);
      }
    };
    fetchFilterTopics();
  }, [filterSubjectId]);

  useEffect(() => {
    setSelectedIds([]);
    setRangeStart("");
    setRangeEnd("");
  }, [filterSubjectId, filterTopicId, searchTerm]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const sid = q.subjectId?._id || q.subjectId;
      const tid = q.topicId?._id || q.topicId;
      if (filterSubjectId && sid !== filterSubjectId) return false;
      if (filterTopicId && tid !== filterTopicId) return false;
      const s = searchTerm.trim().toLowerCase();
      if (s) {
        const hay = [
          q.questionText,
          q.correctAnswer,
          q.explanation,
          ...q.options,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [questions, filterSubjectId, filterTopicId, searchTerm]);

  const handleEditSubjectChange = async (newSubjectId) => {
    if (!newSubjectId) {
      setEditTopics([]);
      return;
    }
    try {
      const res = await api.get(`/api/topics/subject/${newSubjectId}`);
      setEditTopics(apiArray(res.data, "topics"));
    } catch (e) {
      console.error("Error fetching edit topics:", e);
      setEditTopics([]);
    }
  };

  const startEdit = async (question) => {
    const sid = question.subjectId?._id || question.subjectId || "";
    setEditingId(question._id);
    if (sid) {
      try {
        const res = await api.get(`/api/topics/subject/${sid}`);
        setEditTopics(apiArray(res.data, "topics"));
      } catch (e) {
        setEditTopics([]);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTopics([]);
  };

  const handleUpdate = async (id, data) => {
    const cleaned = data.options.map((o) => o.trim()).filter(Boolean);
    if (!data.subjectId) {
      alert("Please select a subject.");
      return;
    }
    if (!data.topicId) {
      alert("Please select a topic.");
      return;
    }
    if (!data.questionText.trim()) {
      alert("Please enter the question text.");
      return;
    }
    if (cleaned.length < 2) {
      alert("Please provide at least two options.");
      return;
    }
    if (!data.correctAnswer) {
      alert("Please select the correct answer.");
      return;
    }
    if (!cleaned.includes(data.correctAnswer)) {
      alert("Correct answer must match one of the options.");
      return;
    }
    if (!data.explanation.trim()) {
      alert("Please enter the explanation.");
      return;
    }
    try {
      await api.put(
        `/api/questions/${id}`,
        {
          ...data,
          options: cleaned,
          questionText: data.questionText.trim(),
          explanation: data.explanation.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );
      alert("Question updated successfully");
      cancelEdit();
      fetchQuestions();
    } catch (e) {
      console.error("Error updating question:", e);
      alert("Error updating question");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;
    try {
      await api.delete(`/api/questions/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      alert("Question deleted successfully");
      fetchQuestions();
      setSelectedIds((prev) => prev.filter((qid) => qid !== id));
    } catch (e) {
      alert("Error deleting question");
    }
  };

  const toggleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const handleSelectAll = () =>
    setSelectedIds(filteredQuestions.map((q) => q._id));
  const clearSelection = () => setSelectedIds([]);

  const handleSelectRange = () => {
    const s = Number(rangeStart);
    const e = Number(rangeEnd);
    if (!s || !e || s < 1 || e < 1 || s > e) {
      alert("Please enter a valid range.");
      return;
    }
    const ids = filteredQuestions
      .filter((_, i) => i + 1 >= s && i + 1 <= e)
      .map((q) => q._id);
    if (!ids.length) {
      alert("No questions found in that range.");
      return;
    }
    setSelectedIds(ids);
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) {
      alert("No questions selected.");
      return;
    }
    if (
      !window.confirm(
        `Delete ${selectedIds.length} question${selectedIds.length !== 1 ? "s" : ""}?`,
      )
    )
      return;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          api.delete(`/api/questions/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }),
        ),
      );
      alert("Selected questions deleted successfully");
      setSelectedIds([]);
      setRangeStart("");
      setRangeEnd("");
      fetchQuestions();
    } catch (e) {
      alert("Error deleting selected questions");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <div style={styles.breadcrumb}>Admin / Manage questions</div>
        <h1 style={styles.pageTitle}>Edit & delete questions</h1>
        <p style={styles.pageSub}>
          Filter by subject, topic, and keyword to manage large question banks
          more easily.
        </p>

        <div style={styles.card}>
          {/* Filters */}
          <div style={styles.filtersRow}>
            <div>
              <label style={styles.fieldLabel}>Subject</label>
              <select
                style={styles.select}
                value={filterSubjectId}
                onChange={(e) => setFilterSubjectId(e.target.value)}
              >
                <option value="">All subjects</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={styles.fieldLabel}>Topic</label>
              <select
                style={styles.select}
                value={filterTopicId}
                onChange={(e) => setFilterTopicId(e.target.value)}
                disabled={!filterSubjectId}
              >
                <option value="">
                  {filterSubjectId ? "All topics" : "Select subject first"}
                </option>
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={styles.fieldLabel}>Search</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Question, option, answer, explanation…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Bulk tools */}
          <div style={styles.bulkBar}>
            <span style={styles.bulkLabel}>Bulk delete</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <input
                style={styles.rangeInput}
                type="number"
                min="1"
                placeholder="From"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
              />
              <span style={styles.rangeSep}>—</span>
              <input
                style={styles.rangeInput}
                type="number"
                min="1"
                placeholder="To"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
              />
            </div>
            <button style={styles.btn} onClick={handleSelectRange}>
              Select range
            </button>
            <button style={styles.btn} onClick={handleSelectAll}>
              Select all filtered
            </button>
            <button style={styles.btn} onClick={clearSelection}>
              Clear
            </button>
            <button
              style={{ ...styles.btn, ...styles.btnDanger }}
              onClick={handleDeleteSelected}
            >
              Delete selected
            </button>
          </div>

          {/* Count bar */}
          <div style={styles.countBar}>
            <span style={styles.countBadge}>
              Showing {filteredQuestions.length} question
              {filteredQuestions.length !== 1 ? "s" : ""}
            </span>
            <span style={styles.selBadge}>{selectedIds.length} selected</span>
          </div>

          {/* Question list */}
          {filteredQuestions.length === 0 ? (
            <div style={styles.empty}>No matching questions found.</div>
          ) : (
            filteredQuestions.map((q, i) => (
              <QuestionItem
                key={q._id}
                question={q}
                index={i}
                isSelected={selectedIds.includes(q._id)}
                isEditing={editingId === q._id}
                onToggleSelect={toggleSelect}
                onEdit={startEdit}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onCancelEdit={cancelEdit}
                subjects={subjects}
                editTopics={editTopics}
                onEditSubjectChange={handleEditSubjectChange}
              />
            ))
          )}

          <div style={styles.footerBar}>
            <button
              style={{ ...styles.btn, ...styles.btnGhost }}
              onClick={() => navigate("/admin")}
            >
              ← Back to Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageQuestionsPage;
