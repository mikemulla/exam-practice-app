import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../lib/useToast";
import { useSubjectPicker } from "../lib/useSubjectPicker";
import { ADMIN, LEVELS, errorText, listOf } from "../lib/adminKit";

const blankSection = () => ({ heading: "", points: [""] });
const STATUS = {
  published: { label: "Published", dot: "#16a34a", color: "#15803d" },
  draft: { label: "Draft", dot: "#f59e0b", color: "#a16207" },
  missing: { label: "Missing", dot: "#ef4444", color: "#b91c1c" },
};

function ReviewEditor({ subjectId, topic, onChanged, toast }) {
  const [review, setReview] = useState(undefined);
  const [summary, setSummary] = useState("");
  const [sections, setSections] = useState([blankSection()]);
  const [extra, setExtra] = useState("");
  const [published, setPublished] = useState(true);
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fill = (r) => {
    setSummary(r?.summary || "");
    setSections(r?.sections?.length ? r.sections.map((s) => ({ heading: s.heading || "", points: s.points?.length ? [...s.points] : [""] })) : [blankSection()]);
    setExtra(r?.extraNotes || "");
    setPublished(r ? r.isPublished !== false : true);
  };

  useEffect(() => {
    let alive = true;
    api
      .get(`/api/quick-reviews/admin/all?subjectId=${subjectId}&topicId=${topic.id}`, ADMIN)
      .then((r) => {
        if (!alive) return;
        const found = listOf(r.data, "reviews")[0] || null;
        setReview(found);
        fill(found);
      })
      .catch((err) => alive && setError(errorText(err)));
    return () => {
      alive = false;
    };
  }, [subjectId, topic.id]);

  const setSection = (i, patch) => setSections((list) => list.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const setPoint = (i, k, value) => setSection(i, { points: sections[i].points.map((p, j) => (j === k ? value : p)) });
  const move = (i, d) => setSections((list) => {
    const next = [...list];
    const j = i + d;
    if (j < 0 || j >= next.length) return list;
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });

  const applyImport = () => {
    try {
      const data = JSON.parse(importText);
      const item = data.item || data.review || data;
      if (!item || typeof item !== "object" || !Array.isArray(item.sections)) throw new Error("It needs a sections list.");
      fill({ ...item, isPublished: published });
      setShowImport(false);
      setImportText("");
      setError("");
      toast("Filled in from JSON. Check it, then save.");
    } catch (e) {
      setError(`Couldn't read that JSON: ${e.message}`);
    }
  };

  const save = async () => {
    const clean = sections
      .map((s) => ({ heading: s.heading.trim(), points: s.points.map((p) => p.trim()).filter(Boolean) }))
      .filter((s) => s.heading || s.points.length);
    if (!summary.trim()) return setError("Write a short summary.");
    if (!clean.length) return setError("Add at least one section with a heading and a point.");
    const bad = clean.findIndex((s) => !s.heading || !s.points.length);
    if (bad >= 0) return setError(`Section ${bad + 1} needs both a heading and at least one point.`);
    setSaving(true);
    setError("");
    const body = { subjectId, topicId: topic.id, summary: summary.trim(), sections: clean, extraNotes: extra.trim(), isPublished: published };
    try {
      const r = review?._id ? await api.put(`/api/quick-reviews/${review._id}`, body, ADMIN) : await api.post("/api/quick-reviews", body, ADMIN);
      const saved = r.data?.review || r.data?.data || { ...body, _id: review?._id };
      setReview(saved);
      toast(published ? "Review saved and visible to students" : "Saved as a draft");
      onChanged();
    } catch (err) {
      setError(errorText(err, "Couldn't save the review."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!review?._id || !window.confirm(`Delete the quick review for "${topic.name}"?`)) return;
    try {
      await api.delete(`/api/quick-reviews/${review._id}`, ADMIN);
      setReview(null);
      fill(null);
      toast("Review deleted");
      onChanged();
    } catch (err) {
      setError(errorText(err));
    }
  };

  if (review === undefined && !error) return <section className="adm-card adm-empty" style={{ flex: "999 1 520px" }}>Loading review…</section>;

  return (
    <section className="adm-card" aria-label="Edit review" style={{ flex: "999 1 520px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <div>
          <h2>{topic.name}</h2>
          <p className="adm-sub">{review ? `${review.isPublished === false ? "Draft" : "Published"} · ${review.sections?.length || 0} sections` : "No review yet · write one below or fill it from JSON"}</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" className="adm-btn sm" onClick={() => setShowImport((v) => !v)}>{showImport ? "Close JSON" : "Fill from JSON"}</button>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
            <input type="checkbox" className="adm-check" checked={published} onChange={(e) => setPublished(e.target.checked)} />Visible to students
          </label>
        </div>
      </div>
      {showImport && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          <label className="adm-field">Paste a review as JSON ({"{"} summary, sections: [{"{"} heading, points {"}"}], extraNotes {"}"})
            <textarea className="adm-in" rows={6} value={importText} onChange={(e) => setImportText(e.target.value)} spellCheck={false} style={{ fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 13 }} />
          </label>
          <button type="button" className="adm-btn" style={{ alignSelf: "flex-start" }} onClick={applyImport} disabled={!importText.trim()}>Fill the form</button>
        </div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); save(); }} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
        <label className="adm-field">Summary<textarea className="adm-in" rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="A short overview of the topic" /></label>
        {sections.map((s, i) => (
          <fieldset key={i} style={{ border: "1px solid #e4e8ee", borderRadius: 12, padding: 14, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            <legend style={{ fontSize: 12, fontWeight: 700, color: "#5b6577", padding: "0 6px" }}>SECTION {i + 1}</legend>
            <div style={{ display: "flex", gap: 8 }}>
              <label className="adm-sr" htmlFor={`h-${i}`}>Section {i + 1} heading</label>
              <input id={`h-${i}`} className="adm-in" style={{ fontWeight: 700 }} value={s.heading} placeholder="Heading" onChange={(e) => setSection(i, { heading: e.target.value })} />
              <button type="button" className="adm-btn sm ghost" aria-label={`Move section ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
              <button type="button" className="adm-btn sm ghost" aria-label={`Move section ${i + 1} down`} disabled={i === sections.length - 1} onClick={() => move(i, 1)}>↓</button>
              <button type="button" className="adm-btn sm ghost" aria-label={`Remove section ${i + 1}`} disabled={sections.length === 1} onClick={() => setSections((l) => l.filter((_, j) => j !== i))}>✕</button>
            </div>
            {s.points.map((p, k) => (
              <div key={k} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span aria-hidden="true" style={{ color: "#93c5fd", paddingTop: 10 }}>•</span>
                <textarea className="adm-in" rows={2} style={{ minHeight: 0 }} value={p} aria-label={`Section ${i + 1}, point ${k + 1}`} onChange={(e) => setPoint(i, k, e.target.value)} />
                <button type="button" className="adm-btn sm ghost" aria-label={`Remove point ${k + 1}`} disabled={s.points.length === 1} onClick={() => setSection(i, { points: s.points.filter((_, j) => j !== k) })}>✕</button>
              </div>
            ))}
            <button type="button" className="adm-btn sm" style={{ alignSelf: "flex-start" }} onClick={() => setSection(i, { points: [...s.points, ""] })}>+ Add point</button>
          </fieldset>
        ))}
        <button type="button" className="adm-btn" style={{ alignSelf: "flex-start" }} onClick={() => setSections((l) => [...l, blankSection()])}>+ Add section</button>
        <label className="adm-field">Extra notes · exam traps (optional)<textarea className="adm-in" rows={4} value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Common mix-ups, mnemonics, things examiners like" /></label>
        {error && <div className="adm-note bad" role="alert">{error}</div>}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {review?._id && <button type="button" className="adm-btn danger" onClick={remove}>Delete review</button>}
          <button className="adm-btn pri" style={{ marginLeft: "auto" }} disabled={saving}>{saving ? "Saving…" : "Save review"}</button>
        </div>
      </form>
    </section>
  );
}

export default function AdminQuickReviewsPage() {
  const [params, setParams] = useSearchParams();
  const picker = useSubjectPicker(params, setParams);
  const { courses, subjectChoices, topics, courseId, level, subjectId, topicId, set, reloadTopics } = picker;
  const [show, setShow] = useState("all");
  const [toastNode, toast] = useToast();
  const topic = topics.find((t) => t.id === topicId);
  const counts = { all: topics.length, missing: topics.filter((t) => t.review === "missing").length, draft: topics.filter((t) => t.review === "draft").length };
  const list = topics.filter((t) => show === "all" || t.review === show);

  return (
    <AdminLayout title="Quick reviews" subtitle="Short revision notes students read before a test">
      {toastNode}
      <section className="adm-card adm-grid c3" aria-label="Choose subject" style={{ alignItems: "end" }}>
        <label className="adm-field">Course
          <select className="adm-in" value={courseId} onChange={(e) => set({ courseId: e.target.value })}>
            <option value="">All courses</option>
            {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </label>
        <label className="adm-field">Level
          <select className="adm-in" value={level} onChange={(e) => set({ level: e.target.value })}>
            <option value="">All levels</option>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <label className="adm-field">Subject
          <select className="adm-in" value={subjectId} onChange={(e) => set({ subjectId: e.target.value })}>
            <option value="">Choose a subject</option>
            {subjectChoices.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.level}L</option>)}
          </select>
        </label>
      </section>
      {!subjectId ? (
        <div className="adm-card adm-empty">Choose a subject to see its topics and reviews.</div>
      ) : (
        <div className="adm-row">
          <section className="adm-card" aria-label="Topics" style={{ flex: "1 1 280px", maxWidth: 360, padding: 12 }}>
            <div className="adm-chips" role="group" aria-label="Show" style={{ padding: "4px 4px 10px" }}>
              <button type="button" className="adm-chip" aria-pressed={show === "all"} onClick={() => setShow("all")}>All <small>{counts.all}</small></button>
              <button type="button" className="adm-chip" aria-pressed={show === "missing"} onClick={() => setShow("missing")}>Missing <small>{counts.missing}</small></button>
              <button type="button" className="adm-chip" aria-pressed={show === "draft"} onClick={() => setShow("draft")}>Draft <small>{counts.draft}</small></button>
            </div>
            {list.length === 0 && <p className="adm-empty">Nothing here.</p>}
            {list.map((t) => (
              <button key={t.id} type="button" onClick={() => set({ topicId: t.id })} aria-current={t.id === topicId ? "true" : undefined}
                style={{ display: "flex", width: "100%", alignItems: "center", gap: 10, minHeight: 44, padding: "0 10px", borderRadius: 10, border: 0, cursor: "pointer", textAlign: "left", background: t.id === topicId ? "#e8f1fb" : "transparent", color: "#0f172a", fontSize: 14, fontWeight: t.id === topicId ? 700 : 500 }}>
                <span className="adm-dot" style={{ background: STATUS[t.review].dot }} />
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                <small style={{ color: STATUS[t.review].color, fontWeight: 600 }}>{STATUS[t.review].label}</small>
              </button>
            ))}
          </section>
          {topic ? (
            <ReviewEditor key={topic.id} subjectId={subjectId} topic={topic} onChanged={reloadTopics} toast={toast} />
          ) : (
            <section className="adm-card adm-empty" style={{ flex: "999 1 520px" }}>Pick a topic on the left to write or edit its review.</section>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
