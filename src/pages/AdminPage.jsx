import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import AdminLayout from "../components/AdminLayout";
import { ADMIN, LEVELS, errorText, initials, listOf, num, pctText, timeAgo } from "../lib/adminKit";

const RANGES = [
  { id: "today", label: "Today" },
  { id: "7", label: "7 days" },
  { id: "30", label: "30 days" },
  { id: "90", label: "90 days" },
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEAT = ["#f1f5f9", "#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#2b7bd0", "#185fa5"];

function change(now, before, unit = "") {
  if (now == null || before == null) return { text: "", cls: "" };
  const diff = now - before;
  if (diff === 0) return { text: "same as before", cls: "" };
  return { text: `${diff > 0 ? "+" : ""}${diff}${unit} on the period before`, cls: diff > 0 ? "up" : "down" };
}

function shortDay(key) {
  return new Date(`${key}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function LineChart({ daily }) {
  const W = 720, H = 230, L = 40, B = 200, T = 20;
  const max = Math.max(4, ...daily.map((d) => Math.max(d.active, d.tests)));
  const nice = Math.ceil(max / 4) * 4;
  const x = (i) => L + (daily.length === 1 ? 0 : (i * (W - L - 4)) / (daily.length - 1));
  const y = (v) => B - ((B - T) * v) / nice;
  const pts = (key) => daily.map((d, i) => `${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(" ");
  const ticks = [0, nice / 2, nice];
  const labels = [0, Math.floor((daily.length - 1) / 2), daily.length - 1];
  const last = daily[daily.length - 1];
  return (
    <svg role="img" aria-label={`Daily active students and tests over ${daily.length} days. Latest day: ${last?.active || 0} active students, ${last?.tests || 0} tests.`} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", marginTop: 12 }}>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={L} y1={y(v)} x2={W} y2={y(v)} stroke="#eef1f5" />
          <text x={0} y={y(v) + 4} fontSize="11" fill="#7a8496">{v}</text>
        </g>
      ))}
      {labels.map((i, k) => (
        <text key={k} x={Math.min(x(i), W - 44)} y={H - 6} fontSize="11" fill="#7a8496">{daily[i] ? shortDay(daily[i].day) : ""}</text>
      ))}
      <polyline points={pts("tests")} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinejoin="round" />
      <polyline points={pts("active")} fill="none" stroke="#185fa5" strokeWidth="3" strokeLinejoin="round" />
      {last && <circle cx={x(daily.length - 1)} cy={y(last.active)} r="5" fill="#185fa5" stroke="#fff" strokeWidth="2" />}
    </svg>
  );
}

export default function AdminPage() {
  const [range, setRange] = useState("30");
  const [courseId, setCourseId] = useState("");
  const [level, setLevel] = useState("");
  const [courses, setCourses] = useState([]);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [feed, setFeed] = useState([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    api.get("/api/courses?limit=100").then((r) => setCourses(listOf(r.data, "courses"))).catch(() => {});
    api.get("/api/results/admin/recent-activity?limit=8", ADMIN).then((r) => setFeed(listOf(r.data, "activities"))).catch(() => {});
  }, [tick]);

  useEffect(() => {
    let alive = true;
    const q = new URLSearchParams({ range });
    if (courseId) q.set("courseId", courseId);
    if (level) q.set("level", level);
    api
      .get(`/api/admin/analytics?${q}`, ADMIN)
      .then((r) => {
        if (!alive) return;
        setData(r.data);
        setError("");
      })
      .catch((err) => alive && setError(errorText(err, "Couldn't load analytics.")));
    return () => {
      alive = false;
    };
  }, [range, courseId, level, tick]);

  // Refresh every minute so "online now" stays current.
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const k = data?.kpis;
  const kpis = useMemo(() => {
    if (!k) return [];
    const newCh = change(k.newStudents, k.newStudentsBefore);
    const weekCh = change(k.activeWeek, k.activeWeekBefore);
    const avgCh = change(k.averageScore, k.averageScoreBefore, " pts");
    const rangeText = range === "today" ? "today" : `in ${range} days`;
    return [
      { label: "Students", value: num(k.students), note: `+${num(k.newStudents)} new ${rangeText}`, cls: k.newStudents ? "up" : "", dot: "#185fa5", hint: newCh.text },
      { label: "Online now", value: num(k.onlineNow), note: "active in the last 5 min", dot: "#16a34a" },
      { label: "Active today", value: num(k.activeToday), note: k.students ? `${Math.round((k.activeToday / k.students) * 100)}% of students` : "", dot: "#60a5fa" },
      { label: "Active this week", value: num(k.activeWeek), note: weekCh.text, cls: weekCh.cls, dot: "#93c5fd" },
      { label: "Tests finished", value: num(k.tests), note: rangeText, dot: "#f59e0b" },
      { label: "Average score", value: pctText(k.averageScore), note: avgCh.text, cls: avgCh.cls, dot: "#a855f7" },
      { label: "Perfect scores", value: num(k.perfectScores), note: `100% on 5+ questions, ${rangeText}`, dot: "#15803d" },
      { label: "Never came back", value: num(k.neverCameBack), note: "signed up, no test yet", cls: k.neverCameBack ? "down" : "", dot: "#c2410c" },
    ];
  }, [k, range]);

  const signupMax = Math.max(1, ...(data?.daily || []).map((d) => d.signups));
  const heatMax = Math.max(1, ...(data?.heat || []).flat());
  const scoreMax = Math.max(1, ...(data?.scoreBuckets || []));
  const subjMax = Math.max(1, ...(data?.subjects || []).map((s) => s.tests));
  const peak = useMemo(() => {
    if (!data) return null;
    let best = { v: 0 };
    data.heat.forEach((row, d) => row.forEach((v, b) => { if (v > best.v) best = { v, d, b }; }));
    if (!best.v) return null;
    const from = best.b * 2, to = from + 2;
    const fmt = (h) => `${h % 12 || 12}${h < 12 || h === 24 ? " am" : " pm"}`;
    return `${DAYS[best.d]} ${fmt(from)}–${fmt(to)}`;
  }, [data]);
  const totalSignups = (data?.daily || []).reduce((s, d) => s + d.signups, 0);
  const a = data?.attention;

  return (
    <AdminLayout
      title="Overview"
      subtitle={data ? `How students are using Bambo · updated ${timeAgo(data.generatedAt)}${data.trackingSince ? ` · online tracking since ${shortDay(data.trackingSince)}` : ""}` : "How students are using Bambo"}
      actions={
        <>
          <div className="adm-seg" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <button key={r.id} type="button" aria-pressed={range === r.id} onClick={() => setRange(r.id)}>{r.label}</button>
            ))}
          </div>
          <label className="adm-field" style={{ flexDirection: "row", alignItems: "center", fontWeight: 500, color: "#5b6577" }}>
            Course
            <select className="adm-in" style={{ width: "auto" }} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">All courses</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </label>
          <label className="adm-field" style={{ flexDirection: "row", alignItems: "center", fontWeight: 500, color: "#5b6577" }}>
            Level
            <select className="adm-in" style={{ width: "auto" }} value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">All levels</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
        </>
      }
    >
      {error && <div className="adm-note bad" role="alert">{error}</div>}
      {!data && !error && <div className="adm-card adm-empty">Loading analytics…</div>}

      {data && (
        <>
          <section aria-label="Key numbers" className="adm-grid c4">
            {kpis.map((x) => (
              <div key={x.label} className="adm-card tight adm-kpi" title={x.hint || undefined}>
                <div className="lbl"><span className="adm-dot" style={{ background: x.dot }} />{x.label}</div>
                <div className="val">{x.value}</div>
                <div className={`note ${x.cls || ""}`}>{x.note || " "}</div>
              </div>
            ))}
          </section>

          <section className="adm-grid c3">
            <div className="adm-card adm-span2">
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div><h2>Daily activity</h2><p className="adm-sub">Students active each day and tests finished</p></div>
                <div className="adm-legend"><span><i style={{ background: "#185fa5" }} />Active students</span><span><i style={{ background: "#f59e0b" }} />Tests finished</span></div>
              </div>
              <LineChart daily={data.daily} />
            </div>
            <div className="adm-card">
              <h2>Online now</h2>
              <p className="adm-sub">{data.kpis.onlineNow} student{data.kpis.onlineNow === 1 ? "" : "s"} · active in the last 5 min</p>
              {data.online.length === 0 ? (
                <p className="adm-empty">Nobody right now.</p>
              ) : (
                <ul className="adm-list">
                  {data.online.map((o) => (
                    <li key={o.id} className="adm-person">
                      <span className="adm-avatar">{initials(o.fullName)}<span className="on" /></span>
                      <span style={{ flex: 1, minWidth: 0 }}><b>{o.fullName}</b><small>{o.doing}</small></span>
                      <small style={{ color: "#5b6577" }}>{o.level}L</small>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/admin-users?status=online" style={{ display: "inline-block", marginTop: 14, fontSize: 13, fontWeight: 600 }}>See all students →</Link>
            </div>
          </section>

          <section className="adm-grid c3">
            <div className="adm-card">
              <h2>New sign-ups</h2>
              <p className="adm-sub">{totalSignups} in the last {data.daily.length} days</p>
              <div className="adm-bars" role="img" aria-label={`Sign-ups per day, ${totalSignups} in total`}>
                {data.daily.map((d) => <span key={d.day} title={`${shortDay(d.day)}: ${d.signups}`} style={{ height: `${(d.signups / signupMax) * 100}%` }} />)}
              </div>
            </div>
            <div className="adm-card">
              <h2>Busiest hours</h2>
              <p className="adm-sub">Tests finished, Lagos time · each square is 2 hours</p>
              <div className="adm-heat" role="img" aria-label={peak ? `Busiest time: ${peak}` : "No tests in this range"}>
                {data.heat.map((row, d) => (
                  <FragmentRow key={d} label={DAYS[d]} cells={row.map((v) => HEAT[v ? Math.max(1, Math.round((v / heatMax) * 6)) : 0])} />
                ))}
              </div>
              <p className="adm-sub" style={{ marginTop: 10 }}>{peak ? `Peak: ${peak}` : "No tests in this range yet"}</p>
            </div>
            <div className="adm-card">
              <h2>Score spread</h2>
              <p className="adm-sub">{num(data.kpis.tests)} tests in this range</p>
              <div className="adm-hist" role="img" aria-label="How many tests scored 0–9%, 10–19% and so on up to 90–100%">
                {data.scoreBuckets.map((v, i) => (
                  <div key={i} title={`${i * 10}–${i === 9 ? 100 : i * 10 + 9}%: ${v}`}>
                    <span style={{ height: `${(v / scoreMax) * 100}%`, background: i >= 9 ? "#15803d" : i >= 5 ? "#185fa5" : "#93c5fd" }} />
                    <small>{i * 10}</small>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="adm-grid c3">
            <div className="adm-card">
              <h2>Most-practised subjects</h2>
              <p className="adm-sub">Tests finished · average score</p>
              {data.subjects.length === 0 ? <p className="adm-empty">No tests in this range.</p> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
                  {data.subjects.map((s) => (
                    <div key={s.subjectId}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13 }}>
                        <b style={{ fontWeight: 600 }}>{s.name}{s.level ? ` · ${s.level}L` : ""}</b>
                        <span style={{ color: "#5b6577" }}>{num(s.tests)} · {s.averageScore}%</span>
                      </div>
                      <div className="adm-meter"><span style={{ width: `${(s.tests / subjMax) * 100}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="adm-card">
              <h2>Hardest questions</h2>
              <p className="adm-sub">Lowest % right, 20+ attempts in this range</p>
              {data.hardest.length === 0 ? <p className="adm-empty">Not enough answers yet.</p> : (
                <ol className="adm-list" style={{ gap: 10 }}>
                  {data.hardest.map((q) => (
                    <li key={q.questionId} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span className="adm-pill bad" style={{ borderRadius: 8 }}>{q.correctRate}%</span>
                      <span style={{ fontSize: 13, lineHeight: 1.4 }}><span className="adm-clamp3" title={q.questionText}>{q.questionText}</span><small style={{ display: "block", color: "#5b6577" }}>{[q.subject, q.topic].filter(Boolean).join(" · ")} · {q.attempts} answers</small></span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div className="adm-card">
              <h2>Needs attention</h2>
              <p className="adm-sub">Things waiting on you</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
                <Link className="adm-todo" to="/admin-reports"><b style={{ color: a.openReports ? "#c2410c" : "#15803d" }}>{a.openReports}</b><span>Reported questions to check</span><span aria-hidden="true">›</span></Link>
                <Link className="adm-todo" to="/admin-requests"><b style={{ color: "#185fa5" }}>{a.pendingRequests}</b><span>Subject requests waiting</span><span aria-hidden="true">›</span></Link>
                <Link className="adm-todo" to="/admin-quick-reviews"><b style={{ color: "#185fa5" }}>{a.topicsWithoutReview}</b><span>Topics with no quick review</span><span aria-hidden="true">›</span></Link>
                <Link className="adm-todo" to="/admin-digest"><b style={{ color: "#15803d" }}>Sun</b><span>Weekly email · {num(a.weeklyEmailSubscribers)} subscribed</span><span aria-hidden="true">›</span></Link>
              </div>
            </div>
          </section>

          <section className="adm-card">
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div><h2>Recent tests</h2><p className="adm-sub">The latest tests students finished</p></div>
            </div>
            <div className="adm-table-wrap" style={{ marginTop: 8 }}>
              <table className="adm-table" style={{ minWidth: 620 }}>
                <thead><tr><th>Student</th><th>Topic</th><th>Result</th><th>When</th></tr></thead>
                <tbody>
                  {feed.length === 0 && <tr><td colSpan={4} className="adm-empty">No tests yet.</td></tr>}
                  {feed.map((r) => {
                    const p = r.total ? Math.round((r.score / r.total) * 100) : 0;
                    return (
                      <tr key={r._id}>
                        <td><b style={{ fontWeight: 600 }}>{r.userId?.fullName || "Deleted student"}</b></td>
                        <td style={{ color: "#5b6577" }}>{r.topicId?.name || r.subjectId?.name || "Mixed test"}</td>
                        <td><b style={{ color: p === 100 ? "#15803d" : p < 50 ? "#b91c1c" : "#185fa5" }}>{r.score}/{r.total} · {p}%</b></td>
                        <td style={{ color: "#5b6577" }} className="nowrap">{timeAgo(r.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </AdminLayout>
  );
}

function FragmentRow({ label, cells }) {
  return (
    <>
      <span style={{ background: "transparent", height: "auto" }}>{label}</span>
      {cells.map((bg, i) => <span key={i} style={{ background: bg }} />)}
    </>
  );
}
