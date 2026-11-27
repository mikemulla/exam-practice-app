import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../lib/useToast";
import { ADMIN, errorText, idOf, listOf, num } from "../lib/adminKit";
import { useSubjectPicker } from "../lib/useSubjectPicker";
import PickerFields from "../components/PickerFields";

const PAGE = 50;
const imageSrc = (data, type) => (!data || !type ? "" : String(data).startsWith("data:") ? data : `data:${type};base64,${data}`);

function Editor({ q, onSaved, onCancel, onDeleted, toast }) {
  const [text, setText] = useState(q.questionText || "");
  const [options, setOptions] = useState(() => [...(q.options || [])]);
  const [correct, setCorrect] = useState(() => Math.max(0, (q.options || []).indexOf(q.correctAnswer)));
  const [explanation, setExplanation] = useState(q.explanation || "");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!q.hasImage) return;
    let alive = true;
    api.get(`/api/questions/${q._id}/admin-image`, ADMIN).then((r) => alive && setPreview(imageSrc(r.data?.imageData, r.data?.imageContentType))).catch(() => {});
    return () => {
      alive = false;
    };
  }, [q._id, q.hasImage]);

  const pickImage = (file) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setError("Use a JPG, PNG or WebP picture.");
    if (file.size > 5 * 1024 * 1024) return setError("Pictures must be under 5 MB.");
    setError("");
    setImage(file);
    setRemoveImage(false);
    setPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    const cleaned = options.map((o) => o.trim());
    if (!text.trim()) return setError("The question can't be empty.");
    if (cleaned.length < 2 || cleaned.some((o) => !o)) return setError("Every option needs text, and there must be at least 2.");
    if (new Set(cleaned.map((o) => o.toLowerCase())).size !== cleaned.length) return setError("Two options are the same.");
    if (!explanation.trim()) return setError("Please add an explanation.");
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("subjectId", idOf(q.subjectId));
      fd.append("topicId", idOf(q.topicId));
      fd.append("questionText", text.trim());
      fd.append("options", JSON.stringify(cleaned));
      fd.append("correctAnswer", cleaned[correct]);
      fd.append("explanation", explanation.trim());
      if (image) fd.append("image", image);
      if (removeImage) fd.append("removeImage", "true");
      await api.put(`/api/questions/${q._id}`, fd, ADMIN);
      toast("Question saved");
      onSaved({ ...q, questionText: text.trim(), options: cleaned, correctAnswer: cleaned[correct], explanation: explanation.trim(), hasImage: removeImage ? false : q.hasImage || Boolean(image) });
    } catch (err) {
      setError(errorText(err, "Couldn't save the question."));
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this question? This can't be undone.")) return;
    try {
      await api.delete(`/api/questions/${q._id}`, ADMIN);
      toast("Question deleted");
      onDeleted(q._id);
    } catch (err) {
      setError(errorText(err));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
      <label className="adm-field">Question<textarea className="adm-in" rows={3} value={text} onChange={(e) => setText(e.target.value)} /></label>
      <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <legend className="adm-field" style={{ marginBottom: 6 }}>Options · tick the correct one</legend>
        {options.map((o, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="radio" className="adm-check" name={`ok-${q._id}`} checked={correct === i} onChange={() => setCorrect(i)} aria-label={`Option ${String.fromCharCode(65 + i)} is correct`} />
            <b style={{ width: 14, color: "#5b6577" }}>{String.fromCharCode(65 + i)}</b>
            <input className="adm-in" value={o} aria-label={`Option ${String.fromCharCode(65 + i)}`} onChange={(e) => setOptions((p) => p.map((x, j) => (j === i ? e.target.value : x)))} style={correct === i ? { borderColor: "#86efac", background: "#f0fdf4" } : undefined} />
            {options.length > 2 && (
              <button type="button" className="adm-btn sm ghost" aria-label={`Remove option ${String.fromCharCode(65 + i)}`} onClick={() => { setOptions((p) => p.filter((_, j) => j !== i)); setCorrect((c) => (c === i ? 0 : c > i ? c - 1 : c)); }}>✕</button>
            )}
          </div>
        ))}
        {options.length < 6 && <button type="button" className="adm-btn sm" style={{ alignSelf: "flex-start" }} onClick={() => setOptions((p) => [...p, ""])}>+ Add option</button>}
      </fieldset>
      <label className="adm-field">Explanation<textarea className="adm-in" rows={3} value={explanation} onChange={(e) => setExplanation(e.target.value)} /></label>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {preview && !removeImage && <img src={preview} alt="Question picture" style={{ maxHeight: 110, maxWidth: 220, borderRadius: 10, border: "1px solid #e4e8ee" }} />}
        <label className="adm-btn sm" style={{ cursor: "pointer" }}>{preview && !removeImage ? "Change picture" : "Add picture"}<input type="file" accept="image/jpeg,image/png,image/webp" className="adm-sr" onChange={(e) => pickImage(e.target.files?.[0])} /></label>
        {preview && !removeImage && <button type="button" className="adm-btn sm ghost" onClick={() => { setRemoveImage(true); setImage(null); }}>Remove picture</button>}
      </div>
      {error && <div className="adm-note bad" role="alert">{error}</div>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" className="adm-btn danger" onClick={remove}>Delete</button>
        <span style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button type="button" className="adm-btn" onClick={onCancel}>Cancel</button>
          <button type="button" className="adm-btn pri" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save changes"}</button>
        </span>
      </div>
    </div>
  );
}

export default function ManageQuestionsPage() {
  const [params, setParams] = useSearchParams();
  const picker = useSubjectPicker(params, setParams);
  const { subjectId, topicId } = picker;
  const listKey = `${subjectId}|${topicId}`;
  const [loaded, setLoaded] = useState({ key: "", list: null });
  const [total, setTotal] = useState(0);
  const [pageState, setPageState] = useState({ key: "", page: 1 });
  const page = pageState.key === listKey ? pageState.page : 1;
  const setPage = (fn) => setPageState({ key: listKey, page: typeof fn === "function" ? fn(page) : fn });
  const [stats, setStats] = useState({});
  const [reported, setReported] = useState({});
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [toastNode, toast] = useToast();

  useEffect(() => {
    api.get("/api/reports/admin?status=open", ADMIN).then((r) => {
      const m = {};
      for (const it of r.data.items || []) m[it.questionId] = it.count;
      setReported(m);
    }).catch(() => {});
  }, []);

  const questions = loaded.key === `${listKey}|${page}` ? loaded.list : null;
  const setQuestions = (fn) => setLoaded((l) => ({ ...l, list: typeof fn === "function" ? fn(l.list) : fn }));

  const load = useCallback(async () => {
    if (!subjectId) return;
    const key = `${subjectId}|${topicId}|${page}`;
    try {
      const base = `/api/questions/admin/all?subjectId=${subjectId}${topicId ? `&topicId=${topicId}` : ""}`;
      if (topicId) {
        const all = [];
        for (let p = 1; p <= 20; p += 1) {
          const r = await api.get(`${base}&page=${p}&limit=100`, ADMIN);
          all.push(...listOf(r.data, "questions"));
          if (p >= (r.data.totalPages || 1)) break;
        }
        setLoaded({ key, list: all.reverse() });
        setTotal(all.length);
      } else {
        const r = await api.get(`${base}&page=${page}&limit=${PAGE}`, ADMIN);
        setLoaded({ key, list: listOf(r.data, "questions") });
        setTotal(r.data.total || 0);
      }
      setError("");
    } catch (err) {
      setError(errorText(err, "Couldn't load questions."));
      setLoaded({ key, list: [] });
    }
  }, [subjectId, topicId, page]);

  useEffect(() => {
    const id = setTimeout(load, 0); // load after render; it only sets state once data arrives
    return () => clearTimeout(id);
  }, [load]);

  useEffect(() => {
    if (!subjectId) return;
    api.get(`/api/admin/question-stats?subjectId=${subjectId}${topicId ? `&topicId=${topicId}` : ""}`, ADMIN).then((r) => setStats(r.data.stats || {})).catch(() => setStats({}));
  }, [subjectId, topicId]);

  const counts = useMemo(() => {
    const list = questions || [];
    return {
      all: list.length,
      reported: list.filter((q) => reported[q._id]).length,
      hard: list.filter((q) => stats[q._id] && stats[q._id].attempts >= 5 && stats[q._id].correctRate < 40).length,
      image: list.filter((q) => q.hasImage).length,
    };
  }, [questions, reported, stats]);

  const shown = (questions || []).filter((q) => {
    if (filter === "reported" && !reported[q._id]) return false;
    if (filter === "hard" && !(stats[q._id] && stats[q._id].attempts >= 5 && stats[q._id].correctRate < 40)) return false;
    if (filter === "image" && !q.hasImage) return false;
    const s = search.trim().toLowerCase();
    return !s || `${q.questionText} ${(q.options || []).join(" ")}`.toLowerCase().includes(s);
  });
  const offset = topicId ? 0 : (page - 1) * PAGE;
  const totalPages = topicId ? 1 : Math.max(1, Math.ceil(total / PAGE));

  return (
    <AdminLayout title="Questions" subtitle="Find, check and edit any question" actions={<Link className="adm-btn pri" style={{ color: "#fff" }} to={`/add-question${subjectId ? `?subjectId=${subjectId}${topicId ? `&topicId=${topicId}` : ""}` : ""}`}>+ Add questions</Link>}>
      {toastNode}
      <section className="adm-card adm-grid c4" aria-label="Filters" style={{ alignItems: "end" }}>
        <PickerFields picker={picker} />
      </section>

      {!subjectId ? (
        <div className="adm-card adm-empty">Choose a subject to see its questions.</div>
      ) : (
        <>
          <div className="adm-actions" style={{ justifyContent: "space-between" }}>
            <div className="adm-chips" role="group" aria-label="Show">
              <strong style={{ fontSize: 14, alignSelf: "center", marginRight: 4 }}>{num(topicId ? total : total)} questions</strong>
              {[["all", "All", counts.all], ["reported", "Reported", counts.reported], ["hard", "Under 40% right", counts.hard], ["image", "With picture", counts.image]].map(([id, label, n]) => (
                <button key={id} type="button" className="adm-chip" aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}{id !== "all" && <small>{n}</small>}</button>
              ))}
            </div>
            <label className="adm-search">
              <span className="adm-sr">Search questions</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={topicId ? "Search this topic" : "Search this page"} />
            </label>
          </div>
          {error && <div className="adm-note bad" role="alert">{error}</div>}
          {!questions && <div className="adm-card adm-empty">Loading questions…</div>}
          {questions && shown.length === 0 && <div className="adm-card adm-empty">No questions match.</div>}
          {shown.map((q) => {
            const st = stats[q._id];
            const n = (questions || []).indexOf(q) + 1 + offset;
            const open = editing === q._id;
            return (
              <article key={q._id} className={`adm-card${open ? " hl" : ""}`} style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span className="adm-pill" style={{ background: "#f1f5f9", color: "#5b6577", borderRadius: 8 }}>Q{n}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {!topicId && <small style={{ color: "#5b6577", display: "block", marginBottom: 4 }}>{q.topicId?.name}</small>}
                    {!open && (
                      <>
                        <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.45 }}>{q.questionText}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                          {(q.options || []).map((o, i) => (
                            <span key={i} style={{ fontSize: 13, padding: "4px 10px", borderRadius: 8, background: o === q.correctAnswer ? "#dcfce7" : "#f1f5f9", color: o === q.correctAnswer ? "#166534" : "#334155", fontWeight: o === q.correctAnswer ? 700 : 500 }}>{o}</span>
                          ))}
                          {q.hasImage && <span className="adm-pill info">Has picture</span>}
                          {reported[q._id] && <Link to="/admin-reports" className="adm-pill warn">Reported {reported[q._id]}×</Link>}
                        </div>
                      </>
                    )}
                    {open && (
                      <>
                        {st && <p className="adm-sub">Answered {st.attempts} times · {st.correctRate}% right{st.commonWrong ? ` · most common wrong answer: ${st.commonWrong}` : ""}</p>}
                        <Editor q={q} toast={toast} onCancel={() => setEditing(null)} onSaved={(nq) => { setQuestions((list) => list.map((x) => (x._id === nq._id ? nq : x))); setEditing(null); }} onDeleted={(id) => { setQuestions((list) => list.filter((x) => x._id !== id)); setTotal((t) => t - 1); setEditing(null); }} />
                      </>
                    )}
                  </div>
                  {!open && (
                    <>
                      <div style={{ flex: "none", textAlign: "right", minWidth: 44 }}>
                        {st ? (<><div style={{ fontSize: 18, fontWeight: 800, color: st.correctRate < 40 ? "#b91c1c" : st.correctRate < 60 ? "#c2410c" : "#15803d" }}>{st.correctRate}%</div><div style={{ fontSize: 11, color: "#5b6577" }}>{st.attempts} tries</div></>) : <div style={{ fontSize: 11, color: "#7a8496" }}>no answers yet</div>}
                      </div>
                      <button type="button" className="adm-btn sm" onClick={() => setEditing(q._id)}>Edit</button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
          {!topicId && questions && totalPages > 1 && (
            <div className="adm-pager" style={{ border: 0, padding: 0 }}>
              <span>Page {page} of {totalPages}</span>
              <span style={{ display: "flex", gap: 8 }}>
                <button type="button" className="adm-btn sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
                <button type="button" className="adm-btn sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
              </span>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
