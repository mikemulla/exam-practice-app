import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../lib/api";
import "../styles/dashboard.css";
import "../styles/student.css";

const ADMIN = { _tokenType: "admin" };
const fmt = (d) => (d ? new Date(d).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "never");

export default function AdminDigestPage() {
  const [status, setStatus] = useState(null);
  const [email, setEmail] = useState("");
  const [to, setTo] = useState("");
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");

  const loadStatus = () => api.get("/api/digest/admin/status", ADMIN).then((r) => setStatus(r.data)).catch((e) => setNote(e?.message || "Couldn't load status."));
  useEffect(() => {
    loadStatus();
  }, []);

  const doPreview = async () => {
    setBusy("preview");
    setNote("");
    try {
      const r = await api.get(`/api/digest/admin/preview?email=${encodeURIComponent(email.trim())}`, ADMIN);
      setPreview(r.data);
    } catch (e) {
      setNote(e?.message || "Couldn't build the preview.");
    } finally {
      setBusy("");
    }
  };
  const sendTest = async () => {
    setBusy("test");
    setNote("");
    try {
      await api.post("/api/digest/admin/send-test", { email: email.trim(), to: to.trim() }, ADMIN);
      setNote(`Test email sent to ${to.trim()}.`);
    } catch (e) {
      setNote(e?.message || "Sending failed.");
    } finally {
      setBusy("");
    }
  };
  const runNow = async (dryRun) => {
    if (!dryRun && !window.confirm("Send the weekly email now to every student who is due one (not emailed in the last 6 days)?")) return;
    setBusy(dryRun ? "dry" : "run");
    setNote("");
    try {
      const r = await api.post("/api/digest/admin/run", { dryRun }, ADMIN);
      if (r.data?.busy) setNote("A run is already in progress.");
      else setNote(dryRun ? `Dry run: ${r.data.sent} student(s) would get an email right now.` : `Sent ${r.data.sent} email(s). ${r.data.failed ? `${r.data.failed} failed.` : ""}`);
      loadStatus();
    } catch (e) {
      setNote(e?.message || "Run failed.");
    } finally {
      setBusy("");
    }
  };

  return (
    <AdminLayout title="Weekly progress email" subtitle="Sent on Sunday evenings (Lagos time) to students who practised in the last 60 days and haven't switched it off. Nobody gets more than one a week, and at most 250 go out per run (Brevo's free plan allows 300 a day).">
      <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 980 }}>

        {status && (
          <section className="db-grid-4">
            <div className="db-stat"><p className="db-stat-label">Email set up</p><p className="db-stat-value" style={{ fontSize: 22 }}>{status.configured ? "✓ Yes" : "✕ No"}</p><p className="db-stat-note">{status.configured ? "Brevo key and sender found" : "Add BREVO_API_KEY and EMAIL_FROM_EMAIL"}</p></div>
            <div className="db-stat"><p className="db-stat-label">Students subscribed</p><p className="db-stat-value" style={{ fontSize: 22 }}>{status.subscribed}</p><p className="db-stat-note">only active ones are emailed</p></div>
            <div className="db-stat"><p className="db-stat-label">Last sent</p><p className="db-stat-value" style={{ fontSize: 18 }}>{fmt(status.lastRun?.startedAt)}</p><p className="db-stat-note">{status.lastRun ? `${status.lastRun.sent} sent · ${status.lastRun.failed} failed` : ""}</p></div>
            <div className="db-stat"><p className="db-stat-label">Schedule</p><p className="db-stat-value" style={{ fontSize: 18 }}>{status.autoSchedule ? "Sundays" : "Off"}</p><p className="db-stat-note">{status.cronSecretSet ? "External trigger ready" : "No external trigger"}</p></div>
          </section>
        )}

        <section className="st-panel">
          <h2 className="db-h2">Preview a student's email</h2>
          <div className="rq-row">
            <label className="rq-field"><span>Student's email</span><input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" /></label>
            <label className="rq-field"><span>Send a test to <small>your own address</small></span><input type="text" value={to} onChange={(e) => setTo(e.target.value)} placeholder="you@example.com" /></label>
          </div>
          <div className="st-actions" style={{ justifyContent: "flex-start" }}>
            <button type="button" className="st-btn st-btn-outline" disabled={!email.trim() || busy} onClick={doPreview}>{busy === "preview" ? "Building…" : "Preview"}</button>
            <button type="button" className="st-btn st-btn-outline" disabled={!email.trim() || !to.trim() || busy} onClick={sendTest}>{busy === "test" ? "Sending…" : "Send test to me"}</button>
          </div>
          {preview && (
            <>
              <p style={{ margin: 0, fontSize: 14 }}><b>Subject:</b> {preview.subject}</p>
              <iframe title="Email preview" sandbox="" srcDoc={preview.html} style={{ width: "100%", height: 620, border: "1px solid var(--border-color)", borderRadius: 12, background: "#fff" }} />
            </>
          )}
        </section>

        <section className="st-panel">
          <h2 className="db-h2">Send now</h2>
          <p className="st-sub" style={{ fontSize: 14 }}>Normally you don't need this: it goes out by itself on Sunday. Try a dry run first to see how many students would get one.</p>
          <div className="st-actions" style={{ justifyContent: "flex-start" }}>
            <button type="button" className="st-btn st-btn-outline" disabled={Boolean(busy)} onClick={() => runNow(true)}>{busy === "dry" ? "Checking…" : "Dry run"}</button>
            <button type="button" className="st-btn" disabled={Boolean(busy) || !status?.configured} onClick={() => runNow(false)}>{busy === "run" ? "Sending…" : "Send to everyone due"}</button>
          </div>
        </section>

        {note && <div className="rs-banner" role="status">{note}</div>}
      </div>
    </AdminLayout>
  );
}
