import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const apiArray = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};


const S = {
  page: {
    minHeight: "100vh",
    background: "#F6F5F1",
    padding: "40px 24px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  inner: { maxWidth: "1000px", margin: "0 auto" },
  breadcrumb: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "10px",
  },
  heading: {
    fontSize: "clamp(26px, 4vw, 38px)",
    fontWeight: "600",
    color: "#0f172a",
    margin: "0 0 6px",
    letterSpacing: "-0.02em",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  subheading: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.6",
    margin: "0 0 28px",
  },
  toolbar: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: "20px",
  },
  searchBox: {
    flex: 1,
    minWidth: "200px",
    padding: "10px 14px",
    border: "0.5px solid rgba(0,0,0,0.15)",
    borderRadius: "10px",
    fontSize: "14px",
    background: "#fff",
    outline: "none",
    color: "#0f172a",
    boxSizing: "border-box",
  },
  filterSelect: {
    padding: "10px 14px",
    border: "0.5px solid rgba(0,0,0,0.15)",
    borderRadius: "10px",
    fontSize: "13px",
    background: "#fff",
    outline: "none",
    color: "#0f172a",
    cursor: "pointer",
  },
  backBtn: {
    padding: "10px 16px",
    border: "0.5px solid rgba(0,0,0,0.15)",
    borderRadius: "10px",
    background: "#fff",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
  card: {
    background: "#fff",
    border: "0.5px solid rgba(0,0,0,0.08)",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "2fr 2fr 1.5fr 1fr 80px",
    gap: "12px",
    padding: "14px 24px",
    background: "#F9F8F5",
    borderBottom: "0.5px solid rgba(0,0,0,0.08)",
  },
  thLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    fontFamily: "'DM Mono', monospace",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "2fr 2fr 1.5fr 1fr 80px",
    gap: "12px",
    padding: "16px 24px",
    borderBottom: "0.5px solid rgba(0,0,0,0.06)",
    alignItems: "center",
    transition: "background 0.12s",
  },
  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #185FA5 0%, #0e3d6e 100%)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    letterSpacing: "0.02em",
  },
  nameCell: { display: "flex", alignItems: "center", gap: "10px" },
  name: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  email: {
    fontSize: "13px",
    color: "#64748b",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  coursePill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: "999px",
    background: "#E6F1FB",
    color: "#185FA5",
    fontSize: "12px",
    fontWeight: "500",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  },
  levelPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: "999px",
    background: "#EAF3DE",
    color: "#3B6D11",
    fontSize: "12px",
    fontWeight: "600",
    fontFamily: "'DM Mono', monospace",
  },
  deleteBtn: {
    padding: "7px 12px",
    border: "0.5px solid #fca5a5",
    borderRadius: "8px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  empty: {
    padding: "60px 24px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px",
  },
  countBar: {
    padding: "12px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "0.5px solid rgba(0,0,0,0.08)",
  },
  countLabel: {
    fontSize: "12px",
    color: "#94a3b8",
    fontFamily: "'DM Mono', monospace",
  },
  statStrip: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  statCard: {
    background: "#fff",
    border: "0.5px solid rgba(0,0,0,0.08)",
    borderRadius: "12px",
    padding: "16px 20px",
    minWidth: "120px",
    flex: "1",
  },
  statVal: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#0f172a",
    lineHeight: 1.1,
    marginBottom: "4px",
    fontFamily: "'DM Mono', monospace",
  },
  statLabel: { fontSize: "12px", color: "#94a3b8" },
};

function getInitials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

function UserRow({ user, index, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const courseName = user.courseId?.name || "No course";
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      style={{
        ...S.row,
        background: hovered ? "#FAFAF8" : "transparent",
        animation: `fadeUp 0.25s ease ${Math.min(index * 0.04, 0.4)}s both`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Name + avatar */}
      <div style={S.nameCell}>
        <div style={S.avatar}>{getInitials(user.fullName)}</div>
        <span style={S.name} title={user.fullName}>
          {user.fullName}
        </span>
      </div>

      {/* Email */}
      <span style={S.email} title={user.email}>
        {user.email}
      </span>

      {/* Course */}
      <span style={S.coursePill} title={courseName}>
        {courseName}
      </span>

      {/* Level */}
      <span style={S.levelPill}>{user.level}L</span>

      {/* Delete */}
      <button
        style={S.deleteBtn}
        onClick={() => onDelete(user._id, user.fullName)}
      >
        Remove
      </button>
    </div>
  );
}

function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const adminToken = localStorage.getItem("adminToken");
      const { data } = await api.get("/api/users/admin/all", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setUsers(apiArray(data, "users"));
    } catch (err) {
      console.error("Error fetching users:", err);
      alert("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from the platform?`)) return;
    try {
      const adminToken = localStorage.getItem("adminToken");
      await api.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const courses = useMemo(
    () => [...new Set(users.map((u) => u.courseId?.name).filter(Boolean))],
    [users],
  );

  const levels = useMemo(
    () =>
      [...new Set(users.map((u) => u.level).filter(Boolean))].sort(
        (a, b) => a - b,
      ),
    [users],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (filterCourse && u.courseId?.name !== filterCourse) return false;
      if (filterLevel && String(u.level) !== filterLevel) return false;
      if (q) {
        const hay = `${u.fullName} ${u.email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [users, search, filterCourse, filterLevel]);

  // Stats
  const courseBreakdown = useMemo(() => {
    const m = {};
    users.forEach((u) => {
      const c = u.courseId?.name || "Unknown";
      m[c] = (m[c] || 0) + 1;
    });
    return m;
  }, [users]);

  const topCourse = Object.entries(courseBreakdown).sort(
    (a, b) => b[1] - a[1],
  )[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .user-row-enter { animation: fadeUp 0.3s ease both; }
      `}</style>

      <div style={S.page}>
        <div style={S.inner}>
          <div style={S.breadcrumb}>Admin / User management</div>
          <h1 style={S.heading}>Registered Users</h1>
          <p style={S.subheading}>
            View and manage all students registered on the platform.
          </p>

          {/* Stats strip */}
          {!isLoading && (
            <div style={S.statStrip}>
              <div style={S.statCard}>
                <div style={S.statVal}>{users.length}</div>
                <div style={S.statLabel}>Total users</div>
              </div>
              <div style={S.statCard}>
                <div style={S.statVal}>{courses.length}</div>
                <div style={S.statLabel}>Courses represented</div>
              </div>
              <div style={S.statCard}>
                <div style={S.statVal}>{levels.length}</div>
                <div style={S.statLabel}>Levels active</div>
              </div>
              {topCourse && (
                <div style={{ ...S.statCard, flex: "2" }}>
                  <div
                    style={{
                      ...S.statVal,
                      fontSize: "16px",
                      marginBottom: "2px",
                    }}
                  >
                    {topCourse[0]}
                  </div>
                  <div style={S.statLabel}>
                    Most popular course · {topCourse[1]} student
                    {topCourse[1] !== 1 ? "s" : ""}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Toolbar */}
          <div style={S.toolbar}>
            <input
              style={S.searchBox}
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              style={S.filterSelect}
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
            >
              <option value="">All courses</option>
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              style={S.filterSelect}
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="">All levels</option>
              {levels.map((l) => (
                <option key={l} value={l}>
                  {l} Level
                </option>
              ))}
            </select>
            <button style={S.backBtn} onClick={() => navigate("/admin")}>
              ← Back to Admin
            </button>
          </div>

          {/* Table */}
          <div style={S.card}>
            {/* Header */}
            <div style={S.tableHeader}>
              <span style={S.thLabel}>Name</span>
              <span style={S.thLabel}>Email</span>
              <span style={S.thLabel}>Course</span>
              <span style={S.thLabel}>Level</span>
              <span style={S.thLabel}>Action</span>
            </div>

            {/* Count bar */}
            <div style={S.countBar}>
              <span style={S.countLabel}>
                {filtered.length} user{filtered.length !== 1 ? "s" : ""}
                {filtered.length !== users.length
                  ? ` (filtered from ${users.length})`
                  : ""}
              </span>
            </div>

            {/* Rows */}
            {isLoading ? (
              <div style={S.empty}>Loading users…</div>
            ) : filtered.length === 0 ? (
              <div style={S.empty}>No users found.</div>
            ) : (
              filtered.map((user, i) => (
                <UserRow
                  key={user._id}
                  user={user}
                  index={i}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminUsersPage;
