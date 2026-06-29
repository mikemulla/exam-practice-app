import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const LEVELS = [100, 200, 300, 400, 500, 600];

const emptyForm = {
  subjectId: "",
  topicId: "",
  summary: "",
  sectionsText: "",
  extraNotes: "",
  isPublished: true,
};

const sampleJson = `{
  "summary": "Short overview of the selected topic.",
  "sections": [
    {
      "heading": "Key Points",
      "points": [
        "Point one",
        "Point two"
      ]
    },
    {
      "heading": "Exam Tips",
      "points": [
        "Tip one",
        "Tip two"
      ]
    }
  ],
  "extraNotes": "Optional extra note",
  "isPublished": true
}`;

function apiArray(payload, key) {
  if (Array.isArray(payload)) return payload;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

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

    const items = apiArray(response.data, key);

    allItems.push(...items);
    totalPages = Number(response.data?.totalPages || 1);
    page += 1;
  } while (page <= totalPages);

  return allItems;
}

function getCourseId(subject) {
  return typeof subject?.courseId === "object"
    ? subject.courseId?._id
    : subject?.courseId;
}

function getCourseName(subject) {
  return typeof subject?.courseId === "object"
    ? subject.courseId?.name
    : "Not available";
}

function parseSectionsText(value) {
  return String(value || "")
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length === 0) return null;

      return {
        heading: lines[0],
        points: lines.slice(1),
      };
    })
    .filter((section) => section && section.heading && section.points.length > 0);
}

function sectionsToText(sections) {
  if (!Array.isArray(sections)) return "";

  return sections
    .map((section) => {
      const heading = section.heading || "";
      const points = Array.isArray(section.points) ? section.points : [];

      return [heading, ...points].filter(Boolean).join("\n");
    })
    .join("\n\n");
}

function AdminQuickReviewsPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [courseFilter, setCourseFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [bulkJson, setBulkJson] = useState(sampleJson);

  const [isLoadingSetup, setIsLoadingSetup] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("single");

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

  useEffect(() => {
    const fetchSetup = async () => {
      try {
        setIsLoadingSetup(true);

        const [coursesRes, allSubjects] = await Promise.all([
          api.get("/api/courses?limit=100", { _tokenType: "admin" }),
          fetchAllPages("/api/subjects/admin/all", "subjects", {
            _tokenType: "admin",
          }),
        ]);

        setCourses(apiArray(coursesRes.data, "courses"));
        setSubjects(allSubjects);
      } catch (error) {
        console.error("Quick review setup error:", error);
        alert(error.message || "Unable to load setup data.");
      } finally {
        setIsLoadingSetup(false);
      }
    };

    fetchSetup();
  }, []);

  useEffect(() => {
    setSubjectFilter("");
    setTopics([]);
    setReviews([]);
    setForm((previous) => ({
      ...previous,
      subjectId: "",
      topicId: "",
    }));
  }, [courseFilter, levelFilter]);

  useEffect(() => {
    if (!subjectFilter) {
      setTopics([]);
      setReviews([]);
      setForm((previous) => ({
        ...previous,
        subjectId: "",
        topicId: "",
      }));
      return;
    }

    const loadSubjectData = async () => {
      try {
        setIsLoadingReviews(true);

        const [topicsRes, reviewsRes] = await Promise.all([
          api.get(`/api/quick-reviews/admin/topics/${subjectFilter}`, {
            _tokenType: "admin",
          }),
          api.get(`/api/quick-reviews/admin/all?subjectId=${subjectFilter}`, {
            _tokenType: "admin",
          }),
        ]);

        setTopics(topicsRes.data?.topics || topicsRes.data?.data || []);
        setReviews(reviewsRes.data?.reviews || reviewsRes.data?.data || []);
        setForm((previous) => ({
          ...previous,
          subjectId: subjectFilter,
          topicId: "",
        }));
      } catch (error) {
        console.error("Quick review subject data error:", error);
        alert(error.message || "Unable to load subject data.");
      } finally {
        setIsLoadingReviews(false);
      }
    };

    loadSubjectData();
  }, [subjectFilter]);

  const resetForm = () => {
    setEditingId("");
    setForm({
      ...emptyForm,
      subjectId: subjectFilter || "",
    });
    setBulkJson(sampleJson);
  };

  const reloadReviews = async () => {
    if (!subjectFilter) return;

    const response = await api.get(
      `/api/quick-reviews/admin/all?subjectId=${subjectFilter}`,
      { _tokenType: "admin" },
    );

    setReviews(response.data?.reviews || response.data?.data || []);
  };

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const editReview = (review) => {
    setEditingId(review._id);
    setActiveTab("single");

    const topicId = review.topicId?._id || review.topicId;
    const subjectId = review.subjectId?._id || review.subjectId;

    setForm({
      subjectId,
      topicId,
      summary: review.summary || "",
      sectionsText: sectionsToText(review.sections),
      extraNotes: review.extraNotes || "",
      isPublished: Boolean(review.isPublished),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedTopic = topics.find((topic) => String(topic._id) === String(form.topicId));

  const saveReview = async (e) => {
    e.preventDefault();

    if (!form.subjectId || !form.topicId) {
      alert("Please select subject and existing topic.");
      return;
    }

    const payload = {
      subjectId: form.subjectId,
      topicId: form.topicId,
      summary: form.summary.trim(),
      sections: parseSectionsText(form.sectionsText),
      extraNotes: form.extraNotes.trim(),
      isPublished: form.isPublished,
    };

    try {
      setIsSaving(true);

      if (editingId) {
        await api.put(`/api/quick-reviews/${editingId}`, payload, {
          _tokenType: "admin",
        });
      } else {
        await api.post("/api/quick-reviews", payload, {
          _tokenType: "admin",
        });
      }

      resetForm();
      await reloadReviews();
      alert("Quick review saved successfully.");
    } catch (error) {
      console.error("Save quick review error:", error);
      alert(error.message || "Unable to save quick review.");
    } finally {
      setIsSaving(false);
    }
  };

  const bulkImport = async () => {
    if (!subjectFilter) {
      alert("Please select a subject first.");
      return;
    }

    if (!form.topicId) {
      alert("Please select the existing topic for this import.");
      return;
    }

    let parsed;

    try {
      parsed = JSON.parse(bulkJson);
    } catch (error) {
      alert("Invalid JSON. Please check the format.");
      return;
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      alert("Topic-based bulk import JSON must be one object, not an array.");
      return;
    }

    if (
      !window.confirm(
        `Import quick review for "${selectedTopic?.name || "selected topic"}"? Existing review for this topic will be updated.`,
      )
    ) {
      return;
    }

    try {
      setIsSaving(true);

      const response = await api.post(
        "/api/quick-reviews/admin/bulk-import",
        {
          subjectId: subjectFilter,
          topicId: form.topicId,
          item: parsed,
        },
        { _tokenType: "admin" },
      );

      await reloadReviews();

      alert(
        response.data?.message ||
          "Quick review imported successfully.",
      );
    } catch (error) {
      console.error("Bulk import quick review error:", error);
      alert(error.message || "Unable to import quick review.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Delete this quick review?")) return;

    try {
      await api.delete(`/api/quick-reviews/${reviewId}`, {
        _tokenType: "admin",
      });

      setReviews((previous) =>
        previous.filter((review) => review._id !== reviewId),
      );

      if (editingId === reviewId) resetForm();
    } catch (error) {
      console.error("Delete quick review error:", error);
      alert(error.message || "Unable to delete quick review.");
    }
  };

  return (
    <>
      <style>{`
        @media (max-width: 720px) {
          .qr-admin-page {
            padding: 24px 14px 80px !important;
          }
          .qr-admin-card {
            padding: 18px !important;
          }
          .qr-admin-grid {
            grid-template-columns: 1fr !important;
          }
          .qr-review-item {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      `}</style>

      <div className="qr-admin-page" style={S.page}>
        <div style={S.wrap}>
          <button style={S.backButton} onClick={() => navigate("/admin")}>
            ← Back to Admin
          </button>

          <section style={S.header}>
            <p style={S.eyebrow}>Admin Content</p>
            <h1 style={S.title}>Manage Quick Reviews</h1>
            <p style={S.subtitle}>
              Select an existing topic, then add flexible review sections. Use
              any heading that fits the course, such as Key Points, Definitions,
              Risk Factors, Formulae, Mnemonics, Exam Tips, or Common Mistakes.
            </p>
          </section>

          <section className="qr-admin-card" style={S.card}>
            <div className="qr-admin-grid" style={S.filterGrid}>
              <SelectField
                label="Course"
                value={courseFilter}
                onChange={setCourseFilter}
                disabled={isLoadingSetup || isSaving}
              >
                <option value="">All courses</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Level"
                value={levelFilter}
                onChange={setLevelFilter}
                disabled={isLoadingSetup || isSaving}
              >
                <option value="">All levels</option>
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level} Level
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Subject"
                value={subjectFilter}
                onChange={setSubjectFilter}
                disabled={isLoadingSetup || isSaving}
              >
                <option value="">Select subject</option>
                {filteredSubjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name} · {getCourseName(subject)} · L{subject.level}
                  </option>
                ))}
              </SelectField>
            </div>
          </section>

          <section className="qr-admin-card" style={S.card}>
            <Field label="Existing Topic">
              <select
                style={S.input}
                value={form.topicId}
                onChange={(e) => updateForm("topicId", e.target.value)}
                disabled={!subjectFilter || isSaving}
              >
                <option value="">Select existing topic</option>
                {topics.map((topic) => (
                  <option key={topic._id} value={topic._id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </Field>

            {selectedTopic && (
              <div style={S.selectedTopicBox}>
                Selected topic: <strong>{selectedTopic.name}</strong>
              </div>
            )}

            <div style={S.tabs}>
              <button
                type="button"
                style={{
                  ...S.tabButton,
                  ...(activeTab === "single" ? S.tabButtonActive : {}),
                }}
                onClick={() => setActiveTab("single")}
              >
                Single Review
              </button>

              <button
                type="button"
                style={{
                  ...S.tabButton,
                  ...(activeTab === "bulk" ? S.tabButtonActive : {}),
                }}
                onClick={() => setActiveTab("bulk")}
              >
                Topic Bulk Import JSON
              </button>
            </div>

            {activeTab === "single" ? (
              <>
                <h2 style={S.sectionTitle}>
                  {editingId ? "Edit Quick Review" : "Create Quick Review"}
                </h2>

                <form onSubmit={saveReview}>
                  <Field label="Summary">
                    <textarea
                      style={S.textarea}
                      value={form.summary}
                      onChange={(e) => updateForm("summary", e.target.value)}
                      placeholder="Short overview of the selected topic"
                      rows={3}
                      disabled={isSaving}
                    />
                  </Field>

                  <Field label="Flexible Review Sections">
                    <p style={S.helperText}>
                      Use one heading, then points under it. Leave a blank line
                      before the next heading.
                    </p>

                    <textarea
                      style={S.largeTextarea}
                      value={form.sectionsText}
                      onChange={(e) => updateForm("sectionsText", e.target.value)}
                      placeholder={`Key Points
Most important point
Another important point

Risk Factors
First risk factor
Second risk factor

Exam Tips
Common exam trap
High-yield reminder`}
                      rows={14}
                      disabled={isSaving}
                    />
                  </Field>

                  <Field label="Extra Notes">
                    <textarea
                      style={S.textarea}
                      value={form.extraNotes}
                      onChange={(e) => updateForm("extraNotes", e.target.value)}
                      placeholder="Any extra explanation, mnemonic, or clarification"
                      rows={5}
                      disabled={isSaving}
                    />
                  </Field>

                  <label style={S.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) => updateForm("isPublished", e.target.checked)}
                      disabled={isSaving}
                    />
                    Publish for users
                  </label>

                  <div style={S.actions}>
                    <button type="submit" style={S.primaryButton} disabled={isSaving}>
                      {isSaving
                        ? "Saving..."
                        : editingId
                          ? "Update Review"
                          : "Create Review"}
                    </button>

                    {editingId && (
                      <button type="button" style={S.secondaryButton} onClick={resetForm}>
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 style={S.sectionTitle}>Topic Bulk Import</h2>

                <p style={S.helperText}>
                  Select one existing topic above, then paste one JSON object
                  for that topic. Do not include topic name in the JSON. Existing
                  review content for the selected topic will be updated.
                </p>

                <textarea
                  style={S.bulkTextarea}
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                  rows={22}
                  disabled={isSaving}
                />

                <div style={S.actions}>
                  <button
                    type="button"
                    style={S.primaryButton}
                    onClick={bulkImport}
                    disabled={isSaving || !subjectFilter || !form.topicId}
                  >
                    {isSaving ? "Importing..." : "Import for Selected Topic"}
                  </button>
                </div>
              </>
            )}
          </section>

          <section className="qr-admin-card" style={S.card}>
            <h2 style={S.sectionTitle}>Existing Reviews</h2>

            {!subjectFilter ? (
              <p style={S.emptyText}>Select a subject to view reviews.</p>
            ) : isLoadingReviews ? (
              <p style={S.emptyText}>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p style={S.emptyText}>No quick reviews for this subject yet.</p>
            ) : (
              <div style={S.reviewList}>
                {reviews.map((review) => (
                  <div key={review._id} className="qr-review-item" style={S.reviewItem}>
                    <div>
                      <h3 style={S.reviewTitle}>
                        {review.topicId?.name || "Unknown Topic"}
                      </h3>
                      <p style={S.reviewMeta}>
                        {review.sections?.length || 0} section
                        {review.sections?.length === 1 ? "" : "s"} ·{" "}
                        {review.isPublished ? "Published" : "Draft"}
                      </p>
                    </div>

                    <div style={S.reviewActions}>
                      <button style={S.secondaryButton} onClick={() => editReview(review)}>
                        Edit
                      </button>
                      <button style={S.dangerButton} onClick={() => deleteReview(review._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }) {
  return (
    <div style={S.field}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function SelectField({ label, value, onChange, disabled, children }) {
  return (
    <Field label={label}>
      <select
        style={S.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {children}
      </select>
    </Field>
  );
}

const S = {
  page: {
    minHeight: "100vh",
    background: "#f8f9fb",
    padding: "34px 18px 80px",
  },
  wrap: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  backButton: {
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "9px 14px",
    background: "#fff",
    color: "#334155",
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: "18px",
  },
  header: {
    marginBottom: "18px",
  },
  eyebrow: {
    margin: "0 0 8px",
    color: "#185FA5",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    fontSize: "clamp(30px, 5vw, 46px)",
    color: "#0f172a",
    lineHeight: 1.08,
  },
  subtitle: {
    margin: "12px 0 0",
    color: "#64748b",
    lineHeight: 1.7,
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "24px",
    marginBottom: "18px",
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },
  tabs: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "22px",
  },
  tabButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "10px 16px",
    background: "#fff",
    color: "#334155",
    fontWeight: 800,
    cursor: "pointer",
  },
  tabButtonActive: {
    background: "#185FA5",
    color: "#fff",
    borderColor: "#185FA5",
  },
  selectedTopicBox: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#185FA5",
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "14px",
    marginBottom: "18px",
  },
  sectionTitle: {
    margin: "0 0 18px",
    color: "#0f172a",
    fontSize: "20px",
  },
  field: {
    marginBottom: "14px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    color: "#334155",
    fontWeight: 700,
    fontSize: "13px",
  },
  helperText: {
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.6,
    margin: "0 0 10px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "11px 12px",
    background: "#fff",
    color: "#0f172a",
    fontSize: "14px",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "11px 12px",
    background: "#fff",
    color: "#0f172a",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: 1.6,
  },
  largeTextarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "13px",
    background: "#fff",
    color: "#0f172a",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: 1.6,
  },
  bulkTextarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "13px",
    background: "#0f172a",
    color: "#e2e8f0",
    fontSize: "13px",
    resize: "vertical",
    fontFamily: "Consolas, Monaco, monospace",
    lineHeight: 1.55,
    marginBottom: "14px",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#334155",
    fontWeight: 700,
    marginBottom: "16px",
  },
  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  primaryButton: {
    border: "none",
    borderRadius: "10px",
    padding: "11px 16px",
    background: "#185FA5",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "10px 14px",
    background: "#fff",
    color: "#334155",
    fontWeight: 800,
    cursor: "pointer",
  },
  dangerButton: {
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "10px 14px",
    background: "#fee2e2",
    color: "#dc2626",
    fontWeight: 800,
    cursor: "pointer",
  },
  emptyText: {
    color: "#64748b",
    margin: 0,
  },
  reviewList: {
    display: "grid",
    gap: "10px",
  },
  reviewItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "14px",
  },
  reviewTitle: {
    margin: "0 0 4px",
    color: "#0f172a",
    fontSize: "15px",
  },
  reviewMeta: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
  },
  reviewActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
};

export default AdminQuickReviewsPage;
