import { useEffect, useRef, useState } from "react";
import api from "../lib/api";
import { ADMIN, errorText } from "../lib/adminKit";

const KINDS = ["checkin", "reminder", "comeback", "welldone"];
const FIELD_LABEL = { firstName: "first name", daysAway: "days away", weakTopic: "weakest topic", lastTopic: "last topic" };
let templateCache = null;

const randomOf = (list, avoid) => {
  if (!list?.length) return "";
  if (list.length === 1) return list[0];
  let pick = avoid;
  while (pick === avoid) pick = list[Math.floor(Math.random() * list.length)];
  return pick;
};

/** Write and send a personal check-in / reminder email to one or more students. */
export default function CheckInComposer({ recipients, defaultKind = "checkin", onClose, onSent, toast }) {
  const [templates, setTemplates] = useState(templateCache);
  const [kind, setKind] = useState(defaultKind);
  const [subject, setSubject] = useState(() => randomOf(templateCache?.[defaultKind]?.subjects));
  const [message, setMessage] = useState(() => randomOf(templateCache?.[defaultKind]?.bodies));
  const [preview, setPreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const boxRef = useRef(null);
  const msgRef = useRef(null);
  const first = recipients[0];

  const generate = (k, tpl = templates) => {
    const t = tpl?.[k];
    if (!t) return;
    setSubject((prev) => randomOf(t.subjects, prev));
    setMessage((prev) => randomOf(t.bodies, prev));
  };

  useEffect(() => {
    if (templateCache) return;
    api.get("/api/admin/check-in/templates", ADMIN).then((r) => {
      templateCache = r.data.templates;
      setTemplates(templateCache);
      setSubject(randomOf(templateCache[defaultKind]?.subjects));
      setMessage(randomOf(templateCache[defaultKind]?.bodies));
    }).catch((err) => setError(errorText(err, "Couldn't load the email ideas.")));
  }, [defaultKind]);

  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    boxRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Personal preview for the first student, refreshed as you type.
  useEffect(() => {
    if (!first || !subject.trim() || !message.trim()) return undefined;
    const id = setTimeout(() => {
      api.post("/api/admin/check-in/preview", { userId: first.id, subject, message }, ADMIN).then((r) => setPreview(r.data)).catch(() => {});
    }, 400);
    return () => clearTimeout(id);
  }, [first, subject, message]);

  const insert = (field) => {
    const el = msgRef.current;
    const token = `{${field}}`;
    if (!el) return setMessage((m) => m + token);
    const start = el.selectionStart ?? message.length;
    const end = el.selectionEnd ?? message.length;
    setMessage(message.slice(0, start) + token + message.slice(end));
    requestAnimationFrame(() => { el.focus(); el.selectionStart = el.selectionEnd = start + token.length; });
  };

  const send = async () => {
    setSending(true);
    setError("");
    try {
      const r = await api.post("/api/admin/check-in/send", { userIds: recipients.map((x) => x.id), subject, message }, ADMIN);
      const d = r.data;
      const skipped = [d.skippedEmailsOff && `${d.skippedEmailsOff} turned emails off`, d.skippedRecent && `${d.skippedRecent} already got one today`, d.failed && `${d.failed} failed`].filter(Boolean);
      toast(`${d.sent} email${d.sent === 1 ? "" : "s"} sent${skipped.length ? ` · ${skipped.join(" · ")}` : ""}`, d.sent === 0);
      onSent?.();
      onClose();
    } catch (err) {
      setError(errorText(err, "Couldn't send."));
      setSending(false);
    }
  };

  const who = recipients.length === 1 ? first.fullName : `${recipients.length} students`;

  return (
    <div className="adm-modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="ci-title" tabIndex={-1} ref={boxRef}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <h2 id="ci-title" style={{ margin: 0, fontSize: 19 }}>Email {who}</h2>
            <p className="adm-sub">Each student gets their own name and details filled in. Students who turned emails off, or got one in the last 24 hours, are skipped.</p>
          </div>
          <button type="button" className="adm-btn sm ghost" aria-label="Close" onClick={onClose}>✕</button>
        </div>

        <div className="adm-row" style={{ marginTop: 14, gap: 18 }}>
          <div style={{ flex: "1 1 340px", display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
            <div className="adm-chips" role="group" aria-label="Kind of email">
              {KINDS.map((k) => (
                <button key={k} type="button" className="adm-chip" aria-pressed={kind === k} onClick={() => { setKind(k); generate(k); }}>{templates?.[k]?.label || k}</button>
              ))}
            </div>
            <label className="adm-field">Subject<input className="adm-in" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} /></label>
            <label className="adm-field">Message<textarea ref={msgRef} className="adm-in" rows={9} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={5000} /></label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#5b6577" }}>Insert:</span>
              {Object.entries(FIELD_LABEL).map(([f, label]) => (
                <button key={f} type="button" className="adm-btn sm" style={{ minHeight: 30 }} onClick={() => insert(f)}>{label}</button>
              ))}
            </div>
            <button type="button" className="adm-btn" style={{ alignSelf: "flex-start" }} onClick={() => generate(kind)} disabled={!templates}>↻ Another version</button>
          </div>
          <aside style={{ flex: "1 1 280px", minWidth: 0 }} aria-label="Preview">
            <div style={{ fontSize: 12, fontWeight: 700, color: "#5b6577", letterSpacing: ".05em" }}>PREVIEW · {first?.fullName?.toUpperCase()}</div>
            <div style={{ border: "1px solid #e4e8ee", borderRadius: 14, marginTop: 8, overflow: "hidden" }}>
              <div style={{ background: "#0e3d6e", color: "#fff", padding: "12px 16px", fontWeight: 700, fontSize: 14 }}>A note from Bambo</div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 12, color: "#5b6577" }}>Subject: <b style={{ color: "#0f172a" }}>{preview?.subject || subject}</b></div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: "#334155", whiteSpace: "pre-line", marginTop: 10 }}>{preview?.message || message}</div>
                <span style={{ display: "inline-block", marginTop: 12, background: "#185fa5", color: "#fff", borderRadius: 9, padding: "8px 14px", fontWeight: 700, fontSize: 13 }}>Open Bambo</span>
              </div>
            </div>
            {preview?.emailsOff && <div className="adm-note warn" style={{ marginTop: 10 }}>{first.fullName} turned emails off, so they'll be skipped.</div>}
          </aside>
        </div>

        {error && <div className="adm-note bad" role="alert" style={{ marginTop: 12 }}>{error}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
          <button type="button" className="adm-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="adm-btn pri" disabled={sending || !subject.trim() || !message.trim()} onClick={send}>{sending ? "Sending…" : `Send to ${who}`}</button>
        </div>
      </div>
    </div>
  );
}
