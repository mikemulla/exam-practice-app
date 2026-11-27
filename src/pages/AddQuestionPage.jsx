import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import AdminLayout from "../components/AdminLayout";
import PickerFields from "../components/PickerFields";
import { useToast } from "../lib/useToast";
import { useSubjectPicker } from "../lib/useSubjectPicker";
import { ADMIN, errorText, listOf } from "../lib/adminKit";

const norm = (s) => String(s || "").toLowerCase().replace(/\s+/g, " ").replace(/[^\p{L}\p{N} ]/gu, "").trim();
const LETTERS = "ABCDEF";

function OneQuestion({ subjectId, topicId, topicName, onSaved, toast }) {
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setText("");
    setOptions(["", "", "", ""]);
    setCorrect(0);
    setExplanation("");
    setImage(null);
    setPreview("");
  };

  const pickImage = (file) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setError("Use a JPG, PNG or WebP picture.");
    if (file.size > 5 * 1024 * 1024) return setError("Pictures must be under 5 MB.");
    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    const cleaned = options.map((o) => o.trim());
    if (!topicId) return setError("Choose a subject and topic first.");
    if (!text.trim()) return setError("Write the question.");
    if (cleaned.length < 2 || cleaned.some((o) => !o)) return setError("Every option needs text.");
    if (new Set(cleaned.map(norm)).size !== cleaned.length) return setError("Two options are the same.");
    if (!explanation.trim()) return setError("Add an explanation. Students see it after answering.");
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("subjectId", subjectId);
      fd.append("topicId", topicId);
      fd.append("questionText", text.trim());
      fd.append("options", JSON.stringify(cleaned));
      fd.append("correctAnswer", cleaned[correct]);
      fd.append("explanation", explanation.trim());
      if (image) fd.append("image", image);
      await api.post("/api/questions", fd, ADMIN);
      toast("Question saved");
      onSaved();
      reset();
    } catch (err) {
      setError(errorText(err, "Couldn't save the question."));
    } finally {
      setSaving(false);
    }
  };

  const filled = options.map((o, i) => o.trim() || `Option ${LETTERS[i]}`);

  return (
    <div className="adm-row">
      <section className="adm-card" aria-label="One question" style={{ flex: "3 1 460px" }}>
        <h2>One question</h2>
        <p className="adm-sub">Students see it exactly as on the right</p>
        <form onSubmit={(e) => { e.preventDefault(); save(); }} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
          <label className="adm-field">Question<textarea className="adm-in" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write the question here" /></label>
          <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            <legend className="adm-field" style={{ marginBottom: 6 }}>Options · tick the correct one</legend>
            {options.map((o, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="radio" className="adm-check" name="correct" checked={correct === i} onChange={() => setCorrect(i)} aria-label={`Option ${LETTERS[i]} is correct`} />
                <b style={{ width: 14, color: "#5b6577" }}>{LETTERS[i]}</b>
                <input className="adm-in" value={o} aria-label={`Option ${LETTERS[i]}`} onChange={(e) => setOptions((p) => p.map((x, j) => (j === i ? e.target.value : x)))} style={correct === i ? { borderColor: "#86efac", background: "#f0fdf4" } : undefined} />
                {options.length > 2 && <button type="button" className="adm-btn sm ghost" aria-label={`Remove option ${LETTERS[i]}`} onClick={() => { setOptions((p) => p.filter((_, j) => j !== i)); setCorrect((c) => (c === i ? 0 : c > i ? c - 1 : c)); }}>✕</button>}
              </div>
            ))}
            {options.length < 6 && <button type="button" className="adm-btn sm" style={{ alignSelf: "flex-start" }} onClick={() => setOptions((p) => [...p, ""])}>+ Add option</button>}
          </fieldset>
          <label className="adm-field">Explanation<textarea className="adm-in" rows={3} value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Why the answer is right" /></label>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <label className="adm-btn sm" style={{ cursor: "pointer" }}>{image ? "Change picture" : "Add picture"}<input type="file" accept="image/jpeg,image/png,image/webp" className="adm-sr" onChange={(e) => pickImage(e.target.files?.[0])} /></label>
            {image && <button type="button" className="adm-btn sm ghost" onClick={() => { setImage(null); setPreview(""); }}>Remove picture</button>}
          </div>
          {error && <div className="adm-note bad" role="alert">{error}</div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button type="button" className="adm-btn" disabled={saving} onClick={save}>Save and add another</button>
            <button className="adm-btn pri" disabled={saving}>{saving ? "Saving…" : "Save question"}</button>
          </div>
        </form>
      </section>
      <aside aria-label="Student preview" style={{ flex: "2 1 300px", background: "#0e3d6e", borderRadius: 16, padding: 20, color: "#fff", alignSelf: "flex-start" }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", color: "#93c5fd" }}>HOW STUDENTS SEE IT</div>
        <div style={{ background: "#fff", color: "#0f172a", borderRadius: 14, padding: 16, marginTop: 12 }}>
          <div style={{ fontSize: 12, color: "#5b6577" }}>{topicName || "Topic"} · Question 1</div>
          <div style={{ fontSize: 15, fontWeight: 600, margin: "8px 0 12px", lineHeight: 1.45 }}>{text.trim() || "Your question appears here"}</div>
          {preview && <img src={preview} alt="" style={{ maxWidth: "100%", borderRadius: 10, marginBottom: 8 }} />}
          {filled.map((o, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", border: "1px solid #e4e8ee", borderRadius: 10, minHeight: 42, padding: "0 12px", marginTop: 8, fontSize: 14, color: options[i].trim() ? "#0f172a" : "#94a3b8" }}>
              <b style={{ color: "#5b6577" }}>{LETTERS[i]}</b>{o}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function BulkImport({ subjectId, topicId, onSaved, toast }) {
  const [raw, setRaw] = useState("");
  const [existing, setExisting] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!topicId) return;
    let alive = true;
    (async () => {
      const seen = new Set();
      try {
        for (let p = 1; p <= 20; p += 1) {
          const r = await api.get(`/api/questions/admin/all?subjectId=${subjectId}&topicId=${topicId}&page=${p}&limit=100`, ADMIN);
          listOf(r.data, "questions").forEach((q) => seen.add(norm(q.questionText)));
          if (p >= (r.data.totalPages || 1)) break;
        }
      } catch {
        /* duplicates just won't be caught */
      }
      if (alive) setExisting(seen);
    })();
    return () => {
      alive = false;
    };
  }, [subjectId, topicId]);

  const check = useMemo(() => {
    if (!raw.trim()) return null;
    let items;
    try {
      items = JSON.parse(raw);
    } catch (e) {
      return { fatal: `That isn't valid JSON: ${e.message}` };
    }
    if (!Array.isArray(items)) items = Array.isArray(items?.questions) ? items.questions : null;
    if (!items) return { fatal: "Paste a JSON list: [ { ... }, { ... } ]" };
    const ready = [], dupes = [], problems = [];
    const inFile = new Set();
    items.forEach((it, i) => {
      const n = i + 1;
      const q = String(it?.questionText || it?.question || "").trim();
      const options = Array.isArray(it?.options) ? it.options.map((o) => String(o ?? "").trim()) : [];
      const answer = String(it?.correctAnswer ?? "").trim();
      const explanation = String(it?.explanation || "").trim();
      let why = "";
      if (!q) why = "it has no question text";
      else if (q.length > 2000) why = "the question is over 2,000 characters";
      else if (options.length < 2 || options.length > 6) why = `it has ${options.length} options (2 to 6 needed)`;
      else if (options.some((o) => !o)) why = "one of its options is empty";
      else if (!options.includes(answer)) why = `the correct answer "${answer || "(blank)"}" isn't one of its options`;
      else if (!explanation) why = "it has no explanation";
      if (why) return problems.push({ n, why });
      const key = norm(q);
      if (inFile.has(key) || existing?.has(key)) return dupes.push(n);
      inFile.add(key);
      ready.push({ topicId, questionText: q, options, correctAnswer: answer, explanation });
    });
    return { total: items.length, ready, dupes, problems };
  }, [raw, existing, topicId]);

  const loadFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRaw(String(reader.result || ""));
    reader.readAsText(file);
  };

  const run = async () => {
    if (!check?.ready?.length) return;
    setImporting(true);
    let done = 0;
    try {
      for (let i = 0; i < check.ready.length; i += 100) {
        await api.post("/api/questions/bulk", { subjectId, questions: check.ready.slice(i, i + 100) }, ADMIN);
        done += Math.min(100, check.ready.length - i);
      }
      toast(`${done} questions imported`);
      setRaw("");
      onSaved();
    } catch (err) {
      toast(`${done} imported, then: ${errorText(err)}`, true);
    } finally {
      setImporting(false);
    }
  };

  return (
    <section className="adm-card" aria-label="Bulk import">
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10 }}>
        <div><h2>Bulk import</h2><p className="adm-sub">Paste a JSON list or upload a .json file · each item needs questionText, options, correctAnswer and explanation</p></div>
        <label className="adm-btn" style={{ cursor: "pointer" }}>Upload file<input type="file" accept=".json,application/json" className="adm-sr" onChange={(e) => loadFile(e.target.files?.[0])} /></label>
      </div>
      <div className="adm-row" style={{ marginTop: 14 }}>
        <label className="adm-field" style={{ flex: "1 1 380px" }}>Paste JSON
          <textarea className="adm-in" rows={12} value={raw} onChange={(e) => setRaw(e.target.value)} spellCheck={false}
            style={{ fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 13 }}
            placeholder={'[\n  {\n    "questionText": "…",\n    "options": ["…", "…", "…", "…"],\n    "correctAnswer": "…",\n    "explanation": "…"\n  }\n]'} />
        </label>
        <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="adm-field">Check before importing</div>
          {!check && <p className="adm-sub">Paste or upload to see what will be imported.</p>}
          {check?.fatal && <div className="adm-note bad">{check.fatal}</div>}
          {check && !check.fatal && (
            <>
              <div className="adm-grid c3" style={{ gap: 10 }}>
                <div className="adm-note ok"><b style={{ fontSize: 22, display: "block" }}>{check.ready.length}</b>ready</div>
                <div className="adm-note warn"><b style={{ fontSize: 22, display: "block" }}>{check.dupes.length}</b>already exist</div>
                <div className="adm-note bad"><b style={{ fontSize: 22, display: "block" }}>{check.problems.length}</b>need fixing</div>
              </div>
              {check.problems.slice(0, 6).map((p) => <div key={p.n} className="adm-note bad"><strong>Item {p.n}:</strong> {p.why}.</div>)}
              {check.problems.length > 6 && <p className="adm-sub">…and {check.problems.length - 6} more.</p>}
              {check.dupes.length > 0 && <p className="adm-sub">Skipping items {check.dupes.slice(0, 12).join(", ")}{check.dupes.length > 12 ? "…" : ""}: the same question is already in this topic or earlier in the file.</p>}
              <button type="button" className="adm-btn pri" style={{ alignSelf: "flex-start" }} disabled={!topicId || importing || !check.ready.length} onClick={run}>
                {importing ? "Importing…" : `Import ${check.ready.length} question${check.ready.length === 1 ? "" : "s"}`}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default function AddQuestionPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "bulk" ? "bulk" : "one";
  const picker = useSubjectPicker(params, (next) => setParams({ ...next, ...(tab === "bulk" ? { tab } : {}) }));
  const { subjectId, topicId, topics } = picker;
  const topic = topics.find((t) => t.id === topicId);
  const [toastNode, toast] = useToast();

  const setTab = (t) => {
    const next = Object.fromEntries(params.entries());
    if (t === "bulk") next.tab = "bulk";
    else delete next.tab;
    setParams(next);
  };

  return (
    <AdminLayout
      title="Add questions"
      subtitle="Write one at a time, or import a whole topic at once"
      actions={
        <div className="adm-seg" role="tablist" aria-label="How to add">
          <button type="button" role="tab" aria-selected={tab === "one"} onClick={() => setTab("one")}>One question</button>
          <button type="button" role="tab" aria-selected={tab === "bulk"} onClick={() => setTab("bulk")}>Bulk import</button>
        </div>
      }
    >
      {toastNode}
      <section className="adm-card adm-grid c4" aria-label="Where the questions go" style={{ alignItems: "end" }}>
        <PickerFields picker={picker} needTopic />
      </section>
      {subjectId && topicId ? (
        <p className="adm-sub" style={{ margin: 0 }}>
          Adding to <b>{topic?.name || "this topic"}</b>{topic ? ` · ${topic.questions} questions so far` : ""} · <Link to={`/manage-questions?subjectId=${subjectId}&topicId=${topicId}`}>see them</Link>
        </p>
      ) : (
        <div className="adm-note info">Choose the subject and topic the questions belong to. To add a new topic, go to <Link to="/admin-courses">Courses &amp; subjects</Link>.</div>
      )}
      {tab === "one" ? (
        <OneQuestion subjectId={subjectId} topicId={topicId} topicName={topic?.name} onSaved={picker.reloadTopics} toast={toast} />
      ) : (
        <BulkImport key={topicId} subjectId={subjectId} topicId={topicId} onSaved={picker.reloadTopics} toast={toast} />
      )}
    </AdminLayout>
  );
}
