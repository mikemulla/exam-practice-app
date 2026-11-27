import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../lib/useToast";
import { ADMIN, LEVELS, errorText, listOf, num, pctText } from "../lib/adminKit";

function TopicsCard({ subject, onCountsChanged, toast }) {
  const [topics, setTopics] = useState(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api
      .get(`/api/admin/subjects/${subject.id}/topics`, ADMIN)
      .then((r) => {
        setTopics(r.data.topics);
        setError("");
      })
      .catch((err) => setError(errorText(err)));
  }, [subject.id]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await api.post("/api/topics", { subjectId: subject.id, name: name.trim() }, ADMIN);
      setName("");
      toast("Topic added");
      load();
      onCountsChanged();
    } catch (err) {
      toast(errorText(err), true);
    } finally {
      setBusy(false);
    }
  };

  const rename = async (t) => {
    if (!editName.trim() || editName.trim() === t.name) return setEditing(null);
    try {
      await api.put(`/api/topics/${t.id}`, { name: editName.trim(), subjectId: subject.id }, ADMIN);
      setEditing(null);
      toast("Topic renamed");
      load();
    } catch (err) {
      toast(errorText(err), true);
    }
  };

  const empty = async (t) => {
    if (!window.confirm(`Delete all ${t.questions} questions in "${t.name}"? The topic stays. This can't be undone.`)) return;
    try {
      await api.delete(`/api/questions/admin/topic/${t.id}/questions`, ADMIN);
      toast("Questions deleted");
      load();
      onCountsChanged();
    } catch (err) {
      toast(errorText(err), true);
    }
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete the topic "${t.name}" and its ${t.questions} questions? This can't be undone.`)) return;
    try {
      await api.delete(`/api/topics/${t.id}`, ADMIN);
      toast("Topic deleted");
      load();
      onCountsChanged();
    } catch (err) {
      toast(errorText(err), true);
    }
  };

  const missing = topics ? topics.filter((t) => t.review === "missing").length : 0;

  return (
    <section className="adm-card" aria-label={`Topics in ${subject.name}`}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <div>
          <h2>Topics in {subject.name} · {subject.level}L</h2>
          <p className="adm-sub">{topics ? `${topics.length} topics · ${num(subject.questions)} questions${missing ? ` · ${missing} without a quick review` : ""}` : "Loading…"}</p>
        </div>
        <form onSubmit={add} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <label className="adm-sr" htmlFor="new-topic">New topic name</label>
          <input id="new-topic" className="adm-in" style={{ width: 240 }} placeholder="New topic name" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="adm-btn pri" disabled={busy || !name.trim()}>Add topic</button>
        </form>
      </div>
      {error && <div className="adm-note bad" style={{ marginTop: 12 }}>{error}</div>}
      <div className="adm-table-wrap" style={{ marginTop: 12 }}>
        <table className="adm-table" style={{ minWidth: 720 }}>
          <thead><tr><th>Topic</th><th className="num">Questions</th><th>Quick review</th><th className="num">Tests</th><th className="num">Avg score</th><th /></tr></thead>
          <tbody>
            {topics && topics.length === 0 && <tr><td colSpan={6} className="adm-empty">No topics yet. Add the first one above.</td></tr>}
            {(topics || []).map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 600 }}>
                  {editing === t.id ? (
                    <form onSubmit={(e) => { e.preventDefault(); rename(t); }} style={{ display: "flex", gap: 6 }}>
                      <label className="adm-sr" htmlFor={`rn-${t.id}`}>Topic name</label>
                      <input id={`rn-${t.id}`} className="adm-in" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
                      <button className="adm-btn sm pri">Save</button>
                      <button type="button" className="adm-btn sm" onClick={() => setEditing(null)}>Cancel</button>
                    </form>
                  ) : t.name}
                </td>
                <td className="num">{t.questions}</td>
                <td>
                  <Link to={`/admin-quick-reviews?subjectId=${subject.id}&topicId=${t.id}`} className={`adm-pill ${t.review === "published" ? "ok" : t.review === "draft" ? "warn" : "bad"}`}>
                    {t.review === "published" ? "Published" : t.review === "draft" ? "Draft" : "Missing · write one"}
                  </Link>
                </td>
                <td className="num">{t.tests}</td>
                <td className="num">{pctText(t.averageScore)}</td>
                <td className="nowrap" style={{ textAlign: "right" }}>
                  <Link to={`/manage-questions?subjectId=${subject.id}&topicId=${t.id}`} className="adm-btn sm ghost">Questions</Link>
                  <button type="button" className="adm-btn sm ghost" onClick={() => { setEditing(t.id); setEditName(t.name); }}>Rename</button>
                  <button type="button" className="adm-btn sm ghost" style={{ color: "#c2410c" }} disabled={!t.questions} onClick={() => empty(t)}>Empty</button>
                  <button type="button" className="adm-btn sm ghost" style={{ color: "#b91c1c" }} onClick={() => remove(t)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState(null);
  const [error, setError] = useState("");
  const [courseId, setCourseId] = useState("");
  const [level, setLevel] = useState("");
  const [picked, setPicked] = useState(null);
  const [newCourse, setNewCourse] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", level: "200", minutes: "15" });
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toastNode, toast] = useToast();

  const loadCourses = useCallback(() => {
    api.get("/api/courses?limit=100").then((r) => {
      const list = listOf(r.data, "courses");
      setCourses(list);
      setCourseId((c) => c || list[0]?._id || "");
    }).catch((err) => setError(errorText(err)));
  }, []);

  const loadSubjects = useCallback(() => {
    api
      .get("/api/admin/content", ADMIN)
      .then((r) => {
        setSubjects(r.data.subjects);
        setError("");
      })
      .catch((err) => setError(errorText(err, "Couldn't load subjects.")));
  }, []);

  useEffect(() => {
    loadCourses();
    loadSubjects();
  }, [loadCourses, loadSubjects]);

  const perCourse = useMemo(() => {
    const m = {};
    for (const s of subjects || []) if (s.course) m[s.course.id] = (m[s.course.id] || 0) + 1;
    return m;
  }, [subjects]);
  const course = courses.find((c) => c._id === courseId);
  const shown = (subjects || []).filter((s) => s.course?.id === courseId && (!level || String(s.level) === level));
  const pickedSubject = (subjects || []).find((s) => s.id === picked);

  const addCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.trim()) return;
    try {
      await api.post("/api/courses", { name: newCourse.trim() }, ADMIN);
      setNewCourse("");
      toast("Course added");
      loadCourses();
    } catch (err) {
      toast(errorText(err), true);
    }
  };

  const deleteCourse = async () => {
    if (!course) return;
    if (perCourse[course._id]) return toast("Delete or move this course's subjects first", true);
    if (!window.confirm(`Delete the course "${course.name}"?`)) return;
    try {
      await api.delete(`/api/courses/${course._id}`, ADMIN);
      toast("Course deleted");
      setCourseId("");
      loadCourses();
    } catch (err) {
      toast(errorText(err), true);
    }
  };

  const addSubject = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !courseId) return;
    setBusy(true);
    try {
      await api.post("/api/subjects", { name: form.name.trim(), courseId, level: Number(form.level), duration: Number(form.minutes) * 60 }, ADMIN);
      toast("Subject created");
      setForm({ name: "", level: form.level, minutes: form.minutes });
      setShowAdd(false);
      loadSubjects();
    } catch (err) {
      toast(errorText(err), true);
    } finally {
      setBusy(false);
    }
  };

  const saveSubject = async (s) => {
    try {
      await api.put(`/api/subjects/${s.id}`, { name: edit.name.trim(), courseId: s.course?.id || courseId, level: Number(edit.level), duration: Number(edit.minutes) * 60 }, ADMIN);
      setEdit(null);
      toast("Subject saved");
      loadSubjects();
    } catch (err) {
      toast(errorText(err), true);
    }
  };

  const deleteSubject = async (s) => {
    if (!window.confirm(`Delete "${s.name}" (${s.level}L) with its ${s.topics} topics and ${s.questions} questions? This can't be undone.`)) return;
    try {
      await api.delete(`/api/subjects/${s.id}`, ADMIN);
      if (picked === s.id) setPicked(null);
      toast("Subject deleted");
      loadSubjects();
    } catch (err) {
      toast(errorText(err), true);
    }
  };

  return (
    <AdminLayout
      title="Courses & subjects"
      subtitle="Pick a course, then a subject to manage its topics"
      actions={<button type="button" className="adm-btn pri" onClick={() => setShowAdd((v) => !v)}>{showAdd ? "Close" : "+ Add subject"}</button>}
    >
      {toastNode}
      {error && <div className="adm-note bad" role="alert">{error}</div>}
      <div className="adm-row">
        <section className="adm-card" aria-label="Courses" style={{ flex: "1 1 240px", maxWidth: 290, padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#5b6577", letterSpacing: ".06em", padding: "6px 8px 8px" }}>COURSES</div>
          {courses.map((c) => (
            <button key={c._id} type="button" onClick={() => { setCourseId(c._id); setPicked(null); }} aria-pressed={courseId === c._id}
              style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", minHeight: 44, padding: "0 12px", borderRadius: 10, border: 0, cursor: "pointer", background: courseId === c._id ? "#e8f1fb" : "transparent", fontWeight: courseId === c._id ? 700 : 500, fontSize: 14, color: "#0f172a" }}>
              {c.name}<small style={{ color: "#5b6577", fontWeight: 500 }}>{perCourse[c._id] || 0} subjects</small>
            </button>
          ))}
          <form onSubmit={addCourse} style={{ display: "flex", gap: 8, padding: "12px 4px 4px", borderTop: "1px solid #eef1f5", marginTop: 8 }}>
            <label className="adm-sr" htmlFor="nc">New course name</label>
            <input id="nc" className="adm-in" placeholder="New course name" value={newCourse} onChange={(e) => setNewCourse(e.target.value)} />
            <button className="adm-btn" disabled={!newCourse.trim()}>Add</button>
          </form>
          {course && <button type="button" className="adm-btn sm ghost" style={{ color: "#b91c1c", marginTop: 6 }} onClick={deleteCourse}>Delete {course.name}</button>}
        </section>

        <div style={{ flex: "999 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {showAdd && (
            <section className="adm-card hl" aria-label="Add a subject">
              <h2>Add a subject to {course?.name || "this course"}</h2>
              <p className="adm-sub">Students in that course and level see it straight away</p>
              <form onSubmit={addSubject} className="adm-grid c4" style={{ marginTop: 14, alignItems: "end" }}>
                <label className="adm-field">Subject name<input className="adm-in" placeholder="For example: Anatomy" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
                <label className="adm-field">Level
                  <select className="adm-in" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select>
                </label>
                <label className="adm-field">Test time (minutes)<input className="adm-in" type="number" min="1" max="120" value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} /></label>
                <button className="adm-btn pri" disabled={busy || !form.name.trim()}>Create subject</button>
              </form>
            </section>
          )}

          <div className="adm-chips" role="group" aria-label="Level">
            <strong style={{ fontSize: 18, marginRight: 8, alignSelf: "center" }}>{course?.name || "No course yet"}</strong>
            {["", ...LEVELS.map(String)].map((l) => (
              <button key={l || "all"} type="button" className="adm-chip" aria-pressed={level === l} onClick={() => setLevel(l)}>{l ? `${l}L` : "All levels"}</button>
            ))}
          </div>

          <section className="adm-card flush">
            <div className="adm-table-wrap">
              <table className="adm-table" style={{ minWidth: 760, fontSize: 14 }}>
                <thead><tr><th style={{ paddingLeft: 20 }}>Subject</th><th>Level</th><th className="num">Topics</th><th className="num">Questions</th><th>Quick reviews</th><th>Test time</th><th /></tr></thead>
                <tbody>
                  {!subjects && <tr><td colSpan={7} className="adm-empty">Loading…</td></tr>}
                  {subjects && shown.length === 0 && <tr><td colSpan={7} className="adm-empty">No subjects here yet.</td></tr>}
                  {shown.map((s) => (
                    <tr key={s.id} className={picked === s.id ? "sel" : ""}>
                      {edit?.id === s.id ? (
                        <>
                          <td style={{ paddingLeft: 20 }}><label className="adm-sr" htmlFor={`sn-${s.id}`}>Name</label><input id={`sn-${s.id}`} className="adm-in" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></td>
                          <td><label className="adm-sr" htmlFor={`sl-${s.id}`}>Level</label><select id={`sl-${s.id}`} className="adm-in" value={edit.level} onChange={(e) => setEdit({ ...edit, level: e.target.value })}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></td>
                          <td className="num">{s.topics}</td><td className="num">{num(s.questions)}</td><td />
                          <td><label className="adm-sr" htmlFor={`sm-${s.id}`}>Minutes</label><input id={`sm-${s.id}`} className="adm-in" type="number" min="1" max="120" style={{ width: 80 }} value={edit.minutes} onChange={(e) => setEdit({ ...edit, minutes: e.target.value })} /></td>
                          <td className="nowrap" style={{ textAlign: "right", paddingRight: 16 }}>
                            <button type="button" className="adm-btn sm pri" onClick={() => saveSubject(s)}>Save</button>{" "}
                            <button type="button" className="adm-btn sm" onClick={() => setEdit(null)}>Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ paddingLeft: 20 }}><button type="button" onClick={() => setPicked(s.id)} style={{ border: 0, background: "none", padding: 0, font: "inherit", fontWeight: 600, color: "#185fa5", cursor: "pointer" }}>{s.name}</button></td>
                          <td>{s.level}</td>
                          <td className="num">{s.topics}</td>
                          <td className="num">{num(s.questions)}</td>
                          <td><span className={`adm-pill ${s.topics && s.publishedReviews >= s.topics ? "ok" : s.publishedReviews ? "warn" : "bad"}`}>{s.publishedReviews} / {s.topics}</span></td>
                          <td>{Math.round((s.duration || 0) / 60)} min</td>
                          <td className="nowrap" style={{ textAlign: "right", paddingRight: 16 }}>
                            <button type="button" className="adm-btn sm ghost" onClick={() => setPicked(s.id)}>Topics</button>
                            <button type="button" className="adm-btn sm ghost" onClick={() => setEdit({ id: s.id, name: s.name, level: String(s.level), minutes: String(Math.round((s.duration || 0) / 60)) })}>Edit</button>
                            <button type="button" className="adm-btn sm ghost" style={{ color: "#b91c1c" }} onClick={() => deleteSubject(s)}>Delete</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {pickedSubject ? (
            <TopicsCard key={pickedSubject.id} subject={pickedSubject} onCountsChanged={loadSubjects} toast={toast} />
          ) : (
            subjects && shown.length > 0 && <p className="adm-sub" style={{ textAlign: "center" }}>Pick a subject to see and manage its topics.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
