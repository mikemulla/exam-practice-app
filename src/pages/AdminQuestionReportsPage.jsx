import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { refreshAdminBadges } from "../lib/adminKit";
import api from "../lib/api";
import "../styles/dashboard.css";
import "../styles/student.css";
import "../styles/admin-reports.css";

const ADMIN = { _tokenType: "admin" };
const REASON_LABEL = {
  wrong_answer: "Wrong answer",
  unclear: "Unclear",
  explanation: "Explanation",
  typo: "Typo",
  image: "Picture",
  other: "Other",
};
const FLAG_LABEL = {
  top_students_miss: "Strong students miss it",
  popular_wrong_answer: "One wrong answer is very popular",
  very_hard: "Under 30% correct",
};
const idOf = (ref) => (ref && typeof ref === "object" ? ref._id : ref) || "";
const nameOf = (ref, fallback = "") => (ref && typeof ref === "object" ? ref.name : null) || fallback;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");
const listOf = (data, key) => (Array.isArray(data) ? data : Array.isArray(data?.[key]) ? data[key] : Array.isArray(data?.data) ? data.data : []);

/* Edit a question in place (uses the existing admin question update). */
function QuestionEditor({ question, onSaved, onCancel }) {
  const [text, setText] = useState(question.questionText || "");
  const [options, setOptions] = useState(() => [...(question.options || [])]);
  const [correct, setCorrect] = useState(() => Math.max(0, (question.options || []).indexOf(question.correctAnswer)));
  const [explanation, setExplanation] = useState(question.explanation || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    const cleaned = options.map((o) => o.trim());
    if (!text.trim()) return setError("The question can't be empty.");
    if (cleaned.some((o) => !o) || cleaned.length < 2) return setError("Every option needs text, and there must be at least 2.");
    if (new Set(cleaned).size !== cleaned.length) return setError("Two options are the same.");
    if (!explanation.trim()) return setError("Please keep an explanation.");
    setSaving(true);
    setError("");
    try {
      await api.put(
        `/api/questions/${question._id}`,
        {
          subjectId: idOf(question.subjectId),
          topicId: idOf(question.topicId),
          questionText: text.trim(),
          options: cleaned,
          correctAnswer: cleaned[correct],
          explanation: explanation.trim(),
        },
        ADMIN,
      );
      onSaved({ ...question, questionText: text.trim(), options: cleaned, correctAnswer: cleaned[correct], explanation: explanation.trim() });
    } catch (err) {
      setError(err?.data?.message || err?.message || "Couldn't save the question.");
      setSaving(false);
    }
  };

  return (
    <div className="ar-editor">
      <label className="rq-field">
        <span>Question</span>
        <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <div className="rq-field">
        <span>Options <small>Tick the correct one</small></span>
        {options.map((opt, i) => (
          <div key={i} className="ar-opt-row">
            <input type="radio" name={`correct-${question._id}`} checked={correct === i} onChange={() => setCorrect(i)} aria-label={`Option ${i + 1} is correct`} />
            <input type="text" value={opt} onChange={(e) => setOptions((prev) => prev.map((o, j) => (j === i ? e.target.value : o)))} />
            {options.length > 2 && (
              <button type="button" className="st-btn st-btn-text" aria-label={`Remove option ${i + 1}`} onClick={() => {
                setOptions((prev) => prev.filter((_, j) => j !== i));
                setCorrect((c) => (c === i ? 0 : c > i ? c - 1 : c));
              }}>✕</button>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <button type="button" className="st-btn st-btn-text" style={{ alignSelf: "flex-start" }} onClick={() => setOptions((prev) => [...prev, ""])}>+ Add option</button>
        )}
      </div>
      <label className="rq-field">
        <span>Explanation</span>
        <textarea rows={4} value={explanation} onChange={(e) => setExplanation(e.target.value)} />
      </label>
      {error && <p className="rq-error" role="alert">{error}</p>}
      <div className="st-actions" style={{ justifyContent: "flex-start" }}>
        <button type="button" className="st-btn" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save question"}</button>
        <button type="button" className="st-btn st-btn-outline" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function QuestionBlock({ question, editing, setEditing, onSaved }) {
  if (!question) return <p className="st-muted">This question has been deleted.</p>;
  if (editing) return <QuestionEditor question={question} onCancel={() => setEditing(false)} onSaved={(q) => { setEditing(false); onSaved(q); }} />;
  return (
    <div className="ar-q">
      <p className="ar-q-text">{question.questionText}</p>
      <ol className="ar-q-opts">
        {(question.options || []).map((o, i) => (
          <li key={i} className={o === question.correctAnswer ? "key" : ""}>{o}{o === question.correctAnswer && <b> · marked correct</b>}</li>
        ))}
      </ol>
      {question.explanation && (
        <details>
          <summary>Explanation</summary>
          <p>{question.explanation}</p>
        </details>
      )}
    </div>
  );
}

function ReportsTab() {
  const [status, setStatus] = useState("open");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(null);
  const [notes, setNotes] = useState({});

  const load = useCallback(() => {
    api
      .get(`/api/reports/admin?status=${status}`, ADMIN)
      .then((res) => {
        setData(res.data);
        setError("");
      })
      .catch((err) => setError(err?.message || "Couldn't load reports."));
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const close = async (questionId, next) => {
    setBusy(questionId);
    try {
      await api.patch(`/api/reports/admin/question/${questionId}`, { status: next, note: notes[questionId] || "" }, ADMIN);
      refreshAdminBadges();
      setData((d) => ({ ...d, items: d.items.filter((i) => i.questionId !== questionId), openCount: next === "open" ? d.openCount + 1 : status === "open" ? Math.max(0, d.openCount - 1) : d.openCount }));
    } catch (err) {
      alert(err?.message || "Couldn't update.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <div className="st-chips" role="group" aria-label="Status">
        {[["open", `Open${data && status === "open" ? ` ${data.items.length}` : ""}`], ["resolved", "Fixed"], ["dismissed", "Dismissed"]].map(([k, label]) => (
          <button key={k} type="button" className="st-chip" aria-pressed={status === k} onClick={() => { setData(null); setStatus(k); }}>{label}</button>
        ))}
      </div>
      {error && <div className="rs-banner" role="alert">{error}</div>}
      {!data && !error && <p className="st-muted">Loading…</p>}
      {data && data.items.length === 0 && (
        <div className="st-panel st-empty">{status === "open" ? "No open reports. 🎉" : "Nothing here yet."}</div>
      )}
      {data?.items.map((item) => {
        const q = item.question;
        return (
          <article key={item.questionId} className="st-panel ar-card">
            <div className="ar-head">
              <div>
                <p className="ar-where">{nameOf(q?.subjectId, "Subject")} · {nameOf(q?.topicId, "Topic")}</p>
                <div className="ar-tags">
                  <span className="ar-count">{item.count} report{item.count === 1 ? "" : "s"}</span>
                  {Object.entries(item.reasons).map(([r, n]) => (
                    <span key={r} className={`ar-tag ${r}`}>{REASON_LABEL[r] || r}{n > 1 ? ` ×${n}` : ""}</span>
                  ))}
                </div>
              </div>
              <span className="st-muted" style={{ fontSize: 13 }}>{status === "open" ? `Latest ${fmtDate(item.latest)}` : `Closed ${fmtDate(item.closedAt)}`}</span>
            </div>

            <QuestionBlock question={q} editing={editing === item.questionId} setEditing={(v) => setEditing(v ? item.questionId : null)} onSaved={(nq) => setData((d) => ({ ...d, items: d.items.map((i) => (i.questionId === item.questionId ? { ...i, question: nq } : i)) }))} />

            {item.messages.length > 0 && (
              <div className="ar-msgs">
                <p className="ar-label">What students said</p>
                {item.messages.slice(0, 8).map((m, i) => (
                  <blockquote key={i}><b>{REASON_LABEL[m.reason] || m.reason}:</b> {m.message} <span>· {fmtDate(m.at)}</span></blockquote>
                ))}
              </div>
            )}

            {status === "open" ? (
              <div className="ar-actions">
                <input type="text" placeholder="Note for yourself (optional)" value={notes[item.questionId] || ""} onChange={(e) => setNotes((n) => ({ ...n, [item.questionId]: e.target.value }))} />
                <div className="st-actions">
                  {q && editing !== item.questionId && <button type="button" className="st-btn st-btn-outline" onClick={() => setEditing(item.questionId)}>Edit question</button>}
                  <button type="button" className="st-btn st-btn-outline" disabled={busy === item.questionId} onClick={() => close(item.questionId, "dismissed")}>Dismiss</button>
                  <button type="button" className="st-btn" disabled={busy === item.questionId} onClick={() => close(item.questionId, "resolved")}>Mark fixed</button>
                </div>
              </div>
            ) : (
              <div className="ar-actions">
                <span className="st-muted" style={{ fontSize: 13 }}>{item.adminNote ? `Note: ${item.adminNote}` : ""}</span>
                <button type="button" className="st-btn st-btn-text" disabled={busy === item.questionId} onClick={() => close(item.questionId, "open")}>Reopen</button>
              </div>
            )}
          </article>
        );
      })}
    </>
  );
}

function InsightsTab() {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [onlyFlagged, setOnlyFlagged] = useState(true);
  const [open, setOpen] = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    api
      .get("/api/subjects/admin/all?limit=100", ADMIN)
      .then((res) => setSubjects(listOf(res.data, "subjects").sort((a, b) => `${a.level}${a.name}`.localeCompare(`${b.level}${b.name}`))))
      .catch(() => setError("Couldn't load subjects."));
  }, []);

  const run = (id) => {
    setSubjectId(id);
    setData(null);
    if (!id) return;
    setLoading(true);
    setError("");
    api
      .get(`/api/reports/admin/insights?subjectId=${id}`, ADMIN)
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Couldn't work out insights."))
      .finally(() => setLoading(false));
  };

  const rows = useMemo(() => (data?.items || []).filter((r) => !onlyFlagged || r.flags.length), [data, onlyFlagged]);

  return (
    <>
      <div className="st-toolbar">
        <select className="st-select" style={{ maxWidth: 420 }} value={subjectId} onChange={(e) => run(e.target.value)} aria-label="Subject">
          <option value="">Choose a subject…</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>{s.level ? `${s.level}L · ` : ""}{s.name}{s.courseId?.name ? ` (${s.courseId.name})` : ""}</option>
          ))}
        </select>
        {data && (
          <div className="st-chips">
            <button type="button" className="st-chip" aria-pressed={onlyFlagged} onClick={() => setOnlyFlagged(true)}>Needs a look {data.items.filter((r) => r.flags.length).length}</button>
            <button type="button" className="st-chip" aria-pressed={!onlyFlagged} onClick={() => setOnlyFlagged(false)}>Hardest {data.items.length}</button>
          </div>
        )}
      </div>
      <p className="st-muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
        Based on saved answers from the last year (retries left out). A question shows once it has 5+ attempts. <b>Strong students</b> scored 80%+ on that test. If strong students keep picking the same "wrong" answer, the answer key is often the problem.
      </p>
      {error && <div className="rs-banner" role="alert">{error}</div>}
      {loading && <p className="st-muted">Working it out…</p>}
      {data && (
        <p className="st-muted" style={{ margin: 0, fontSize: 13 }}>{data.testsScanned.toLocaleString("en-GB")} tests checked.</p>
      )}
      {data && rows.length === 0 && <div className="st-panel st-empty">{onlyFlagged ? "Nothing looks suspicious in this subject. 👍" : "Not enough answers yet."}</div>}
      {rows.length > 0 && (
        <div className="st-panel" style={{ padding: 0, overflow: "hidden" }}>
          {rows.map((r) => {
            const q = r.question;
            const isOpen = open === r.questionId;
            return (
              <div key={r.questionId} className={`ar-row${isOpen ? " open" : ""}`}>
                <button type="button" className="ar-row-main" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : r.questionId)}>
                  <span className="ar-row-q">
                    <strong>{q.questionText}</strong>
                    <small>{nameOf(q.topicId, "Topic")} · {r.attempts} attempts{r.openReports ? ` · ${r.openReports} open report${r.openReports === 1 ? "" : "s"}` : ""}</small>
                    {r.flags.length > 0 && (
                      <span className="ar-tags" style={{ marginTop: 6 }}>{r.flags.map((f) => <span key={f} className="ar-tag flag">{FLAG_LABEL[f]}</span>)}</span>
                    )}
                  </span>
                  <span className="ar-figs">
                    <span><b className={r.correctRate < 30 ? "bad" : r.correctRate < 60 ? "mid" : "ok"}>{r.correctRate}%</b>correct</span>
                    <span><b>{r.topWrongRate === null ? "–" : `${r.topWrongRate}%`}</b>strong wrong</span>
                  </span>
                </button>
                {isOpen && (
                  <div className="ar-row-body">
                    {r.commonWrong && (
                      <p className="ar-hint">Most common wrong answer: <b>{r.commonWrong}</b> ({r.commonWrongRate}% of attempts){r.skippedRate ? ` · skipped by ${r.skippedRate}%` : ""}</p>
                    )}
                    <QuestionBlock question={q} editing={editing === r.questionId} setEditing={(v) => setEditing(v ? r.questionId : null)} onSaved={(nq) => setData((d) => ({ ...d, items: d.items.map((i) => (i.questionId === r.questionId ? { ...i, question: nq } : i)) }))} />
                    {editing !== r.questionId && (
                      <div className="st-actions" style={{ justifyContent: "flex-start" }}>
                        <button type="button" className="st-btn st-btn-outline" onClick={() => setEditing(r.questionId)}>Edit question</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function AdminQuestionReportsPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "insights" ? "insights" : "reports";
  return (
    <AdminLayout
      title="Reported questions"
      subtitle="Reports from students, and questions the answer data says need a second look"
      actions={
        <div className="adm-seg" role="tablist" aria-label="View">
          <button type="button" role="tab" aria-selected={tab === "reports"} onClick={() => setParams({})}>Reports</button>
          <button type="button" role="tab" aria-selected={tab === "insights"} onClick={() => setParams({ tab: "insights" })}>Question insights</button>
        </div>
      }
    >
      <div className="ar-wrap">{tab === "reports" ? <ReportsTab /> : <InsightsTab />}</div>
    </AdminLayout>
  );
}
