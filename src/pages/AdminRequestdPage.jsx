import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../lib/useToast";
import { ADMIN, errorText, listOf, refreshAdminBadges, timeAgo } from "../lib/adminKit";

const key = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const sizeText = (b) => (!b ? "" : b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const extOf = (name = "") => (String(name).split(".").pop() || "FILE").slice(0, 4).toUpperCase();

export default function AdminRequestdPage() {
  const [status, setStatus] = useState("pending");
  const [items, setItems] = useState(null);
  const [counts, setCounts] = useState({ pending: 0, reviewed: 0 });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);
  const [toastNode, toast] = useToast();

  const load = useCallback(async () => {
    try {
      const all = [];
      for (let p = 1; p <= 10; p += 1) {
        const r = await api.get(`/api/requests?status=${status}&page=${p}&limit=100`, ADMIN);
        all.push(...listOf(r.data, "requests"));
        if (p >= (r.data.totalPages || 1)) break;
      }
      setItems(all);
      setError("");
      const other = status === "pending" ? "reviewed" : "pending";
      const o = await api.get(`/api/requests?status=${other}&limit=1`, ADMIN);
      setCounts({ [status]: all.length, [other]: o.data.total || 0 });
    } catch (err) {
      setError(errorText(err, "Couldn't load requests."));
      setItems([]);
    }
  }, [status]);

  useEffect(() => {
    const id = setTimeout(load, 0); // load after render; it only sets state once data arrives
    return () => clearTimeout(id);
  }, [load]);

  const switchTo = (next) => {
    if (next === status) return;
    setItems(null);
    setStatus(next);
  };

  const groups = useMemo(() => {
    const m = new Map();
    for (const r of items || []) {
      const u = r.userId || {};
      const k = [key(r.subject), key(r.topic), u.courseId?._id || "", u.level || ""].join("|");
      if (!m.has(k)) m.set(k, { key: k, subject: r.subject, topic: r.topic, course: u.courseId?.name, level: u.level, requests: [] });
      m.get(k).requests.push(r);
    }
    return [...m.values()].sort((a, b) => b.requests.length - a.requests.length || new Date(b.requests[0].createdAt) - new Date(a.requests[0].createdAt));
  }, [items]);

  const markDone = async (g) => {
    setBusy(g.key);
    let done = 0;
    for (const r of g.requests) {
      try {
        await api.put(`/api/requests/${r._id}/reviewed`, {}, ADMIN);
        done += 1;
      } catch {
        /* keep going */
      }
    }
    setBusy(null);
    refreshAdminBadges();
    toast(`Marked done · ${done} student${done === 1 ? "" : "s"} emailed`, done < g.requests.length);
    load();
  };

  const remove = async (g) => {
    if (!window.confirm(`Delete ${g.requests.length === 1 ? "this request" : `these ${g.requests.length} requests`}? Students aren't told.`)) return;
    setBusy(g.key);
    for (const r of g.requests) {
      try {
        await api.delete(`/api/requests/${r._id}`, ADMIN);
      } catch {
        /* keep going */
      }
    }
    setBusy(null);
    refreshAdminBadges();
    toast("Deleted");
    load();
  };

  return (
    <AdminLayout
      title="Subject requests"
      subtitle="Topics students want added · requests for the same topic are grouped"
      actions={
        <div className="adm-seg" role="tablist" aria-label="Request status">
          <button type="button" role="tab" aria-selected={status === "pending"} onClick={() => switchTo("pending")}>Pending {counts.pending || ""}</button>
          <button type="button" role="tab" aria-selected={status === "reviewed"} onClick={() => switchTo("reviewed")}>Done {counts.reviewed || ""}</button>
        </div>
      }
    >
      {toastNode}
      {error && <div className="adm-note bad" role="alert">{error}</div>}
      {!items && <div className="adm-card adm-empty">Loading requests…</div>}
      {items && groups.length === 0 && <div className="adm-card adm-empty">{status === "pending" ? "No requests waiting. Nice." : "Nothing here yet."}</div>}
      {groups.map((g) => {
        const names = g.requests.map((r) => r.userId?.fullName).filter(Boolean);
        const files = g.requests.filter((r) => r.fileName);
        return (
          <article key={g.key} className="adm-card adm-row" style={{ gap: 18 }}>
            <div style={{ flex: "1 1 380px", minWidth: 0 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                {g.course && <span className="adm-pill info">{g.course} · {g.level}L</span>}
                <span className="adm-pill warn">Asked by {g.requests.length} student{g.requests.length === 1 ? "" : "s"}</span>
                <small style={{ color: "#5b6577" }}>Latest {timeAgo(g.requests[0].createdAt)}</small>
              </div>
              <h2 style={{ margin: "10px 0 2px", fontSize: 18 }}>{g.topic}</h2>
              <div style={{ fontSize: 14, color: "#5b6577" }}>Subject: <b style={{ color: "#0f172a" }}>{g.subject}</b>{g.requests[0].timer ? ` · wants a ${g.requests[0].timer}-minute test` : ""}</div>
              <div style={{ fontSize: 13, color: "#5b6577", marginTop: 8 }}>
                From {names.slice(0, 3).join(", ")}{names.length > 3 ? ` and ${names.length - 3} more` : ""}
              </div>
            </div>
            <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: 10 }}>
              {files.map((r) => (
                <div key={r._id} style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid #e4e8ee", borderRadius: 12, padding: "10px 12px" }}>
                  <span style={{ width: 40, height: 40, borderRadius: 9, background: "#fef2f2", color: "#b91c1c", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{extOf(r.fileName)}</span>
                  <span style={{ minWidth: 0 }}>
                    <b style={{ display: "block", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.fileName}</b>
                    <small style={{ color: "#5b6577" }}>{sizeText(r.fileSize)} · sent to your email</small>
                  </span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {status === "pending" && <Link to="/admin-courses" className="adm-btn">Add this topic</Link>}
                {status === "pending" && (
                  <button type="button" className="adm-btn pri" disabled={busy === g.key} onClick={() => markDone(g)}>
                    {busy === g.key ? "Working…" : `Mark done & email ${g.requests.length === 1 ? "student" : `all ${g.requests.length}`}`}
                  </button>
                )}
                <button type="button" className="adm-btn danger" disabled={busy === g.key} onClick={() => remove(g)}>Delete</button>
              </div>
            </div>
          </article>
        );
      })}
      {status === "pending" && groups.length > 0 && <p className="adm-sub" style={{ textAlign: "center" }}>"Mark done" emails each student that their request was reviewed.</p>}
    </AdminLayout>
  );
}
