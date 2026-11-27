import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";
import AdminLayout from "../components/AdminLayout";
import CheckInComposer from "../components/CheckInComposer";
import { useToast } from "../lib/useToast";
import { ADMIN, LEVELS, deviceText, errorText, fmtDate, initials, listOf, num, pctText, statusText, timeAgo } from "../lib/adminKit";

const CHIPS = [
  { id: "all", label: "All" },
  { id: "online", label: "Online now" },
  { id: "today", label: "Active today" },
  { id: "week", label: "This week" },
  { id: "inactive", label: "Inactive 30+ days" },
  { id: "never", label: "Never came back" },
];

function StudentPanel({ id, onClose, onChanged, toast, onEmail }) {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .get(`/api/admin/students/${id}`, ADMIN)
      .then((r) => {
        if (!alive) return;
        setD(r.data);
        setError("");
      })
      .catch((err) => alive && setError(errorText(err)));
    return () => {
      alive = false;
    };
  }, [id]);

  const logoutAll = async () => {
    if (!window.confirm(`Sign ${d.fullName} out on every phone and computer? They'll need to log in again.`)) return;
    setBusy(true);
    try {
      await api.post(`/api/admin/students/${id}/logout-all`, {}, ADMIN);
      toast(`${d.fullName} was signed out everywhere`);
    } catch (err) {
      toast(errorText(err), true);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete ${d.fullName}'s account? Their results go too. This can't be undone.`)) return;
    setBusy(true);
    try {
      await api.delete(`/api/users/${id}`, ADMIN);
      toast("Account deleted");
      onChanged();
      onClose();
    } catch (err) {
      toast(errorText(err), true);
      setBusy(false);
    }
  };

  return (
    <aside className="adm-card adm-panel adm-drawer" aria-label="Selected student">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <h2 className="adm-sr">Student details</h2>
        <span />
        <button type="button" className="adm-btn sm ghost" onClick={onClose} aria-label="Close student details">✕</button>
      </div>
      {error && <div className="adm-note bad">{error}</div>}
      {!d && !error && <p className="adm-empty">Loading…</p>}
      {d && (
        <>
          <div className="adm-person" style={{ marginTop: -18 }}>
            <span className="adm-avatar lg">{initials(d.fullName)}{d.status === "online" && <span className="on" />}</span>
            <span><b style={{ fontSize: 17 }}>{d.fullName}</b><small>{d.course?.name || "No course"} · {d.level} Level</small><small>{d.email}</small></span>
          </div>
          {d.status === "online" ? (
            <div className="adm-note ok"><strong>Online now</strong> · {d.doing} · on a {d.device || "device"}{d.installed ? " (installed app)" : ""}</div>
          ) : (
            <div className="adm-note info">{statusText(d)}{d.lastSeenAt ? ` · ${fmtDate(d.lastSeenAt, true)}` : ""}</div>
          )}
          <div className="adm-grid c2" style={{ gap: 10 }}>
            <div className="adm-stat"><small>Joined</small><b>{fmtDate(d.joinedAt)}</b></div>
            <div className="adm-stat"><small>Last login</small><b>{d.lastLoginAt ? timeAgo(d.lastLoginAt) : "Not recorded"}</b></div>
            <div className="adm-stat"><small>Tests</small><b>{num(d.tests)} · avg {pctText(d.averageScore)}</b></div>
            <div className="adm-stat"><small>Perfect scores</small><b>{num(d.perfectScores)}</b></div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Active days · last 5 weeks</div>
            <div className="adm-days" role="img" aria-label={`Active on ${d.activeDays.filter((x) => x.active).length} of the last 35 days`}>
              {d.activeDays.map((x) => <span key={x.day} className={x.active ? "on" : ""} title={x.day} />)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Recent logins</div>
            {d.recentLogins.length === 0 ? (
              <p className="adm-sub">None recorded yet. Logins are recorded from this update on.</p>
            ) : (
              <ul style={{ listStyle: "none", margin: "8px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                {d.recentLogins.map((l, i) => (
                  <li key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span>{fmtDate(l.at, true)}</span><span style={{ color: "#5b6577" }}>{deviceText(l.device)}</span></li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Recent tests</div>
            {d.recentTests.length === 0 ? <p className="adm-sub">No tests yet.</p> : (
              <ul style={{ listStyle: "none", margin: "8px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                {d.recentTests.map((t, i) => (
                  <li key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.topic}</span><b>{t.score}/{t.total}</b></li>
                ))}
              </ul>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="adm-btn pri" style={{ flex: 1 }} onClick={() => onEmail({ id: d.id, fullName: d.fullName }, d.status)}>Send a check-in</button>
            <button type="button" className="adm-btn" style={{ flex: 1 }} disabled={busy} onClick={logoutAll}>Log out everywhere</button>
          </div>
          <p className="adm-sub" style={{ margin: "-6px 0 0" }}>
            {d.lastCheckInAt ? `Last check-in email ${timeAgo(d.lastCheckInAt)}` : "No check-in emails yet"}
            {!d.weeklyDigest && " · emails turned off"} · <a href={`mailto:${d.email}`}>email from your inbox</a>
          </p>
          <button type="button" className="adm-btn danger" disabled={busy} onClick={remove}>Delete account</button>
        </>
      )}
    </aside>
  );
}

export default function AdminUsersPage() {
  const [params, setParams] = useSearchParams();
  const status = CHIPS.some((c) => c.id === params.get("status")) ? params.get("status") : "all";
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [courseId, setCourseId] = useState("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("lastSeen");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState([]);
  const [open, setOpen] = useState(null);
  const [moveCourse, setMoveCourse] = useState("");
  const [moveLevel, setMoveLevel] = useState("");
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);
  const [composer, setComposer] = useState(null);
  const names = useRef(new Map());
  const [toastNode, toast] = useToast();

  useEffect(() => {
    api.get("/api/courses?limit=100").then((r) => setCourses(listOf(r.data, "courses"))).catch(() => {});
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(q.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const search = useMemo(() => {
    const s = new URLSearchParams({ status, sort, page: String(page), limit: "25" });
    if (query) s.set("q", query);
    if (courseId) s.set("courseId", courseId);
    if (level) s.set("level", level);
    return s.toString();
  }, [status, sort, page, query, courseId, level]);

  const load = useCallback(() => {
    api
      .get(`/api/admin/students?${search}`, ADMIN)
      .then((r) => {
        setData(r.data);
        setError("");
      })
      .catch((err) => setError(errorText(err, "Couldn't load students.")));
  }, [search]);

  useEffect(() => {
    load();
  }, [load, tick]);

  const setStatus = (id) => {
    setPage(1);
    setSelected([]);
    setParams(id === "all" ? {} : { status: id });
  };

  const rows = useMemo(() => data?.students || [], [data]);
  useEffect(() => {
    rows.forEach((r) => names.current.set(r.id, r.fullName));
  }, [rows]);
  const kindFor = (st) => (st === "inactive" || st === "never" || st === "month" ? "comeback" : st === "online" || st === "today" ? "checkin" : "reminder");
  const emailGroup = async () => {
    try {
      const s2 = new URLSearchParams(search);
      s2.set("page", "1");
      s2.set("limit", "100");
      const r = await api.get(`/api/admin/students?${s2}`, ADMIN);
      if (!r.data.students.length) return toast("Nobody in this group", true);
      if (r.data.total > 100) toast(`Emailing the first 100 of ${r.data.total}. Send again later for the rest.`);
      setComposer({ recipients: r.data.students.map((u) => ({ id: u.id, fullName: u.fullName })), kind: kindFor(status) });
    } catch (err) {
      toast(errorText(err), true);
    }
  };
  const allOnPage = rows.length > 0 && rows.every((r) => selected.includes(r.id));
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () => setSelected((s) => (allOnPage ? s.filter((id) => !rows.some((r) => r.id === id)) : [...new Set([...s, ...rows.map((r) => r.id)])]));

  const applyMove = async () => {
    if (!moveCourse && !moveLevel) return toast("Choose a course or level to move them to", true);
    setBusy(true);
    try {
      const body = { userIds: selected };
      if (moveCourse) body.courseId = moveCourse;
      if (moveLevel) body.level = Number(moveLevel);
      const r = await api.patch("/api/users/admin/bulk-update", body, ADMIN);
      toast(r.data?.message || "Students updated");
      setSelected([]);
      setMoveCourse("");
      setMoveLevel("");
      load();
    } catch (err) {
      toast(errorText(err), true);
    } finally {
      setBusy(false);
    }
  };

  const deleteSelected = async () => {
    if (!window.confirm(`Delete ${selected.length} account${selected.length === 1 ? "" : "s"} and their results? This can't be undone.`)) return;
    setBusy(true);
    let done = 0;
    for (const id of selected) {
      try {
        await api.delete(`/api/users/${id}`, ADMIN);
        done += 1;
      } catch {
        /* keep going */
      }
    }
    setBusy(false);
    setSelected([]);
    if (selected.includes(open)) setOpen(null);
    toast(`${done} account${done === 1 ? "" : "s"} deleted`, done < selected.length);
    load();
  };

  const exportCsv = async () => {
    try {
      const all = [];
      for (let p = 1; p <= 50; p += 1) {
        const s = new URLSearchParams(search);
        s.set("page", String(p));
        s.set("limit", "100");
        const r = await api.get(`/api/admin/students?${s}`, ADMIN);
        all.push(...r.data.students);
        if (p >= r.data.totalPages) break;
      }
      const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const lines = [["Name", "Email", "Course", "Level", "Status", "Last seen", "Last login", "Logins (30d)", "Tests", "Average %", "Perfect scores", "Device", "Joined"].map(cell).join(",")];
      for (const u of all) {
        lines.push([u.fullName, u.email, u.course?.name, u.level, statusText(u), u.lastSeenAt ? new Date(u.lastSeenAt).toISOString() : "", u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : "", u.loginsLast30Days, u.tests, u.averageScore ?? "", u.perfectScores, deviceText(u.device, u.installed), new Date(u.joinedAt).toISOString().slice(0, 10)].map(cell).join(","));
      }
      const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `bambo-students-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast(errorText(err, "Couldn't export"), true);
    }
  };

  const counts = data?.counts || {};

  return (
    <AdminLayout
      title="Students"
      subtitle={data ? `${num(counts.all)} students · status updates every minute` : "Loading…"}
      actions={
        <>
          <label className="adm-search">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
            <span className="adm-sr">Search students</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" />
          </label>
          {status !== "all" && <button type="button" className="adm-btn pri" onClick={emailGroup}>Email this group</button>}
          <button type="button" className="adm-btn" onClick={exportCsv}>Export CSV</button>
        </>
      }
    >
      {toastNode}
      {composer && <CheckInComposer recipients={composer.recipients} defaultKind={composer.kind} onClose={() => setComposer(null)} onSent={() => setTick((n) => n + 1)} toast={toast} />}
      <div className="adm-chips" role="group" aria-label="Filter by status">
        {CHIPS.map((c) => (
          <button key={c.id} type="button" className="adm-chip" aria-pressed={status === c.id} onClick={() => setStatus(c.id)}>
            <span className={`adm-dot dot-${c.id}`} />{c.label}<small>{counts[c.id] != null ? num(counts[c.id]) : ""}</small>
          </button>
        ))}
      </div>

      <div className="adm-actions">
        <label className="adm-field" style={{ flexDirection: "row", alignItems: "center", fontWeight: 500, color: "#5b6577" }}>Course
          <select className="adm-in" style={{ width: "auto" }} value={courseId} onChange={(e) => { setCourseId(e.target.value); setPage(1); }}>
            <option value="">All courses</option>
            {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </label>
        <label className="adm-field" style={{ flexDirection: "row", alignItems: "center", fontWeight: 500, color: "#5b6577" }}>Level
          <select className="adm-in" style={{ width: "auto" }} value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }}>
            <option value="">All levels</option>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <label className="adm-field" style={{ flexDirection: "row", alignItems: "center", fontWeight: 500, color: "#5b6577" }}>Sort
          <select className="adm-in" style={{ width: "auto" }} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="lastSeen">Last seen</option>
            <option value="name">Name</option>
            <option value="joined">Newest first</option>
          </select>
        </label>
      </div>

      {selected.length > 0 && (
        <div className="adm-bulk" role="region" aria-label="Bulk actions">
          <strong style={{ fontSize: 14 }}>{selected.length} selected</strong>
          <label>Move to course
            <select value={moveCourse} onChange={(e) => setMoveCourse(e.target.value)}>
              <option value="">Don't change</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </label>
          <label>Move to level
            <select value={moveLevel} onChange={(e) => setMoveLevel(e.target.value)}>
              <option value="">Don't change</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <button type="button" className="adm-btn sm" disabled={busy} onClick={applyMove}>Apply to {selected.length}</button>
          <button type="button" className="adm-btn sm" disabled={busy || selected.length > 100} onClick={() => setComposer({ recipients: selected.map((id) => ({ id, fullName: names.current.get(id) || "Student" })), kind: "checkin" })}>Email {selected.length}</button>
          <button type="button" className="adm-btn sm ghost" style={{ color: "#fff" }} onClick={() => setSelected([])}>Clear</button>
          <button type="button" className="adm-btn sm" disabled={busy} onClick={deleteSelected} style={{ marginLeft: "auto", background: "transparent", color: "#fecaca", borderColor: "#fca5a5" }}>Delete accounts</button>
        </div>
      )}

      {error && <div className="adm-note bad" role="alert">{error}</div>}

      <div className="adm-row">
        <div className="adm-card flush" style={{ flex: "999 1 620px" }}>
          <div className="adm-table-wrap">
            <table className="adm-table" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th><input type="checkbox" className="adm-check" checked={allOnPage} onChange={toggleAll} aria-label="Select everyone on this page" /></th>
                  <th>Student</th><th>Course · level</th><th>Status</th><th>Last login</th><th className="num">Logins (30d)</th><th className="num">Tests</th><th className="num">Avg</th><th className="num">Perfects</th><th>Device</th>
                </tr>
              </thead>
              <tbody>
                {data && rows.length === 0 && <tr><td colSpan={10} className="adm-empty">No students match.</td></tr>}
                {!data && <tr><td colSpan={10} className="adm-empty">Loading students…</td></tr>}
                {rows.map((u) => (
                  <tr key={u.id} className={open === u.id ? "sel" : ""}>
                    <td><input type="checkbox" className="adm-check" checked={selected.includes(u.id)} onChange={() => toggle(u.id)} aria-label={`Select ${u.fullName}`} /></td>
                    <td>
                      <button type="button" onClick={() => setOpen(u.id)} className="adm-person" style={{ border: 0, background: "none", padding: 0, cursor: "pointer", textAlign: "left", font: "inherit", color: "inherit" }}>
                        <span className="adm-avatar">{initials(u.fullName)}{u.status === "online" && <span className="on" />}</span>
                        <span style={{ minWidth: 0 }}><b>{u.fullName}</b><small>{u.email}</small></span>
                      </button>
                    </td>
                    <td style={{ color: "#5b6577" }} className="nowrap">{u.course?.name || "—"} · {u.level}L</td>
                    <td><span className={`adm-pill ${u.status}`} title={u.doing || undefined}><span className={`adm-dot dot-${u.status}`} style={{ width: 8, height: 8 }} />{statusText(u)}</span></td>
                    <td style={{ color: "#5b6577" }} className="nowrap">{u.lastLoginAt ? timeAgo(u.lastLoginAt) : "—"}</td>
                    <td className="num">{u.loginsLast30Days}</td>
                    <td className="num">{u.tests}</td>
                    <td className="num">{pctText(u.averageScore)}</td>
                    <td className="num">{u.perfectScores}</td>
                    <td style={{ color: "#5b6577" }} className="nowrap">{deviceText(u.device, u.installed)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data && (
            <div className="adm-pager">
              <span>{data.total ? `Showing ${(data.page - 1) * data.limit + 1}–${Math.min(data.page * data.limit, data.total)} of ${num(data.total)}` : "No results"}</span>
              <span style={{ display: "flex", gap: 8 }}>
                <button type="button" className="adm-btn sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
                <button type="button" className="adm-btn sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
              </span>
            </div>
          )}
        </div>
        {open && <StudentPanel key={open} id={open} onClose={() => setOpen(null)} onChanged={load} toast={toast} onEmail={(who, st) => setComposer({ recipients: [who], kind: kindFor(st) })} />}
      </div>
    </AdminLayout>
  );
}
