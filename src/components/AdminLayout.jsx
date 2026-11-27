import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { ADMIN, badgeCache } from "../lib/adminKit";
import "../styles/admin.css";

const I = {
  home: "M3 12l9-8 9 8M5 10v10h14V10",
  users: "M9 12a4 4 0 100-8 4 4 0 000 8zM2 21c0-4 3-6 7-6s7 2 7 6M17 11a3 3 0 100-6M22 21c0-3-2-5-4-5.5",
  inbox: "M4 4h16v12H8l-4 4z",
  book: "M4 19V5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 19a2 2 0 002 2h13",
  q: "M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 9a2.5 2.5 0 115 .5c0 1.5-2.5 2-2.5 3.5M12 17h.01",
  plus: "M12 5v14M5 12h14",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  flag: "M4 21V4h12l-1 4 1 4H4",
  bell: "M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 004 0",
  mail: "M3 5h18v14H3zM3 7l9 6 9-6",
};
const Icon = ({ d }) => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const NAV = [
  { to: "/admin", label: "Overview", icon: I.home, end: true },
  { head: "Students" },
  { to: "/admin-users", label: "Students", icon: I.users },
  { to: "/admin-requests", label: "Subject requests", icon: I.inbox, badge: "requests" },
  { head: "Content" },
  { to: "/admin-courses", label: "Courses & subjects", icon: I.book },
  { to: "/manage-questions", label: "Questions", icon: I.q },
  { to: "/add-question", label: "Add questions", icon: I.plus },
  { to: "/admin-quick-reviews", label: "Quick reviews", icon: I.list },
  { to: "/admin-reports", label: "Reported questions", icon: I.flag, badge: "reports" },
  { head: "Messages" },
  { to: "/admin-notifications", label: "Notify students", icon: I.bell },
  { to: "/admin-digest", label: "Weekly email", icon: I.mail },
];


export default function AdminLayout({ title, subtitle, actions, children }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [badges, setBadges] = useState(badgeCache.value);

  useEffect(() => {
    if (Date.now() - badgeCache.at < 60000) return;
    let alive = true;
    Promise.allSettled([
      api.get("/api/reports/admin?status=open", ADMIN),
      api.get("/api/requests?status=pending&limit=1", ADMIN),
    ]).then(([rep, req]) => {
      const value = {
        reports: rep.status === "fulfilled" ? Number(rep.value.data?.openCount || 0) : 0,
        requests: req.status === "fulfilled" ? Number(req.value.data?.total || 0) : 0,
      };
      badgeCache.at = Date.now();
      badgeCache.value = value;
      if (alive) setBadges(value);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (title) document.title = `${title} · Bambo admin`;
  }, [title]);

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  return (
    <div className="adm">
      <header className="adm-topbar">
        <button type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
          <Icon d="M4 6h16M4 12h16M4 18h16" />
        </button>
        <div className="adm-brand"><span className="adm-brand-mark">B</span><b>Admin</b></div>
        <span style={{ width: 44 }} />
      </header>
      <nav className={`adm-side${open ? " open" : ""}`} aria-label="Admin">
        <div className="adm-brand">
          <span className="adm-brand-mark">B</span>
          <span><b>Bambo</b><small>Admin</small></span>
        </div>
        {NAV.map((item) =>
          item.head ? (
            <div key={item.head} className="adm-nav-head">{item.head.toUpperCase()}</div>
          ) : (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `adm-nav-link${isActive ? " active" : ""}`} onClick={() => setOpen(false)}>
              <Icon d={item.icon} />
              {item.label}
              {item.badge && badges[item.badge] > 0 && <span className="adm-badge">{badges[item.badge]}</span>}
            </NavLink>
          ),
        )}
        <div className="adm-side-foot">
          <span>Signed in as admin</span>
          <button type="button" onClick={logout}>Log out</button>
        </div>
      </nav>
      {open && <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "transparent", border: 0, zIndex: 45 }} />}
      <main className="adm-main" id="main">
        {(title || actions) && (
          <div className="adm-head">
            <div>
              {title && <h1>{title}</h1>}
              {subtitle && <p className="adm-sub">{subtitle}</p>}
            </div>
            {actions && <div className="adm-actions">{actions}</div>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
