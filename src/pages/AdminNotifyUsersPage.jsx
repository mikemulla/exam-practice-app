import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../lib/useToast";
import { ADMIN, LEVELS, errorText, listOf, num } from "../lib/adminKit";

export default function AdminNotifyUsersPage() {
  const [courses, setCourses] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [level, setLevel] = useState("");
  const [subjectIds, setSubjectIds] = useState([]);
  const [topicsBySubject, setTopicsBySubject] = useState({});
  const [topicIds, setTopicIds] = useState([]);
  const [message, setMessage] = useState("");
  const [count, setCount] = useState(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [toastNode, toast] = useToast();

  useEffect(() => {
    api.get("/api/courses?limit=100").then((r) => {
      const list = listOf(r.data, "courses");
      setCourses(list);
      setCourseId((c) => c || list[0]?._id || "");
    }).catch(() => {});
    api.get("/api/admin/content", ADMIN).then((r) => setAllSubjects(r.data.subjects)).catch(() => {});
  }, []);

  const subjects = allSubjects.filter((s) => s.course?.id === courseId && String(s.level) === level);

  useEffect(() => {
    setSubjectIds([]);
    setTopicIds([]);
    setResult(null);
    if (!courseId || !level) return setCount(null);
    let alive = true;
    api.post("/api/notifications/questions-available/preview", { courseId, level: Number(level) }, ADMIN)
      .then((r) => alive && setCount(r.data.recipientCount))
      .catch(() => alive && setCount(null));
    return () => {
      alive = false;
    };
  }, [courseId, level]);

  useEffect(() => {
    for (const id of subjectIds) {
      if (topicsBySubject[id]) continue;
      api.get(`/api/admin/subjects/${id}/topics`, ADMIN).then((r) => setTopicsBySubject((m) => ({ ...m, [id]: r.data.topics }))).catch(() => {});
    }
  }, [subjectIds, topicsBySubject]);

  const toggleSubject = (id) => {
    setSubjectIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    if (subjectIds.includes(id)) setTopicIds((t) => t.filter((tid) => !(topicsBySubject[id] || []).some((x) => x.id === tid)));
  };
  const toggleTopic = (id) => setTopicIds((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  const picked = useMemo(() => {
    const out = [];
    for (const sid of subjectIds) {
      const s = allSubjects.find((x) => x.id === sid);
      const ts = (topicsBySubject[sid] || []).filter((t) => topicIds.includes(t.id));
      if (ts.length) ts.forEach((t) => out.push({ label: `${s?.name} · ${t.name}`, n: t.questions }));
      else if (s) out.push({ label: `${s.name} · all topics`, n: s.questions });
    }
    return out;
  }, [subjectIds, topicIds, topicsBySubject, allSubjects]);
  const course = courses.find((c) => c._id === courseId);

  const send = async () => {
    if (!subjectIds.length) return setError("Pick at least one subject to tell students about.");
    if (!window.confirm(`Email ${count ?? "all"} ${course?.name || ""} ${level}L students now?`)) return;
    setSending(true);
    setError("");
    try {
      const r = await api.post("/api/notifications/questions-available", { courseId, level: Number(level), subjectIds, topicIds, customMessage: message.trim() }, ADMIN);
      setResult(r.data);
      toast(r.data.message || "Sent");
    } catch (err) {
      setError(errorText(err, "Couldn't send."));
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout title="Notify students" subtitle="Email a class about new questions">
      {toastNode}
      <div className="adm-row">
        <div style={{ flex: "3 1 460px", display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <section className="adm-card" aria-label="Who should get it">
            <h2>1 · Who should get it?</h2>
            <div className="adm-grid c2" style={{ marginTop: 14 }}>
              <label className="adm-field">Course
                <select className="adm-in" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </label>
              <label className="adm-field">Level
                <select className="adm-in" value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option value="">Choose a level</option>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
            </div>
          </section>
          <section className="adm-card" aria-label="What's new">
            <h2>2 · What's new?</h2>
            <p className="adm-sub">Pick subjects, and topics if you only want to mention some</p>
            {!level ? <p className="adm-empty">Choose a level first.</p> : subjects.length === 0 ? <p className="adm-empty">This class has no subjects yet.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                <div className="adm-chips" role="group" aria-label="Subjects">
                  {subjects.map((s) => (
                    <button key={s.id} type="button" className="adm-chip" aria-pressed={subjectIds.includes(s.id)} onClick={() => toggleSubject(s.id)}>{s.name}<small>{num(s.questions)} Qs</small></button>
                  ))}
                </div>
                {subjectIds.map((sid) => {
                  const ts = topicsBySubject[sid];
                  const s = allSubjects.find((x) => x.id === sid);
                  return (
                    <div key={sid}>
                      <div className="adm-field" style={{ marginBottom: 6 }}>{s?.name} topics <span style={{ fontWeight: 400, color: "#5b6577" }}>(none ticked = the whole subject)</span></div>
                      {!ts ? <p className="adm-sub">Loading…</p> : (
                        <div className="adm-chips" role="group" aria-label={`${s?.name} topics`} style={{ maxHeight: 180, overflowY: "auto" }}>
                          {ts.map((t) => <button key={t.id} type="button" className="adm-chip" aria-pressed={topicIds.includes(t.id)} onClick={() => toggleTopic(t.id)}>{t.name}</button>)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
          <section className="adm-card" aria-label="Message">
            <h2>3 · Add a note (optional)</h2>
            <label className="adm-field" style={{ marginTop: 12 }}><span className="adm-sr">Message</span>
              <textarea className="adm-in" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Example: New practice questions are ready for your block exam. Log in and try a topic test." />
            </label>
          </section>
        </div>

        <aside style={{ flex: "2 1 320px", display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <section className="adm-card" style={{ background: "#0e3d6e", borderColor: "#0e3d6e", color: "#fff" }} aria-label="Summary">
            <div style={{ fontSize: 13, color: "#bfdbfe" }}>This will go to</div>
            <div style={{ fontSize: 34, fontWeight: 800 }}>{count == null ? "—" : `${num(count)} student${count === 1 ? "" : "s"}`}</div>
            <div style={{ fontSize: 13, color: "#bfdbfe" }}>{course && level ? `Every ${course.name} ${level}L student` : "Choose a course and level"}</div>
            {error && <div className="adm-note bad" style={{ marginTop: 12 }}>{error}</div>}
            {result && <div className="adm-note ok" style={{ marginTop: 12 }}>{result.message}{result.failedCount ? ` ${result.failedCount} failed.` : ""}</div>}
            <button type="button" className="adm-btn" style={{ marginTop: 16, width: "100%" }} disabled={sending || !count || !subjectIds.length} onClick={send}>{sending ? "Sending…" : `Send to ${count ? num(count) : ""} students`}</button>
          </section>
          <section className="adm-card flush" aria-label="Email preview">
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #eef1f5", fontSize: 12, color: "#5b6577" }}>Preview · what students will get</div>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 12, color: "#5b6577" }}>Subject: New Questions Available: {course?.name || "Course"} {level || "—"} Level</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginTop: 12 }}>New practice questions are ready</div>
              {message.trim() && <p style={{ fontSize: 14, lineHeight: 1.6, color: "#334155", whiteSpace: "pre-line" }}>{message.trim()}</p>}
              {picked.length > 0 ? (
                <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 14, lineHeight: 1.8, color: "#334155" }}>
                  {picked.map((p) => <li key={p.label}>{p.label}</li>)}
                </ul>
              ) : <p className="adm-sub">Pick subjects to list them here.</p>}
              <span style={{ display: "inline-block", marginTop: 16, background: "#185fa5", color: "#fff", borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 14 }}>Start practising</span>
            </div>
          </section>
        </aside>
      </div>
    </AdminLayout>
  );
}
