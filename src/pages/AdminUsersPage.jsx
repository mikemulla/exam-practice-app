import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const apiArray = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Design tokens matching AdminPage
  const S = {
    container: {
      minHeight: "100vh",
      background: "#f8fafc",
      padding: "40px 20px",
    },
    maxWidth: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      marginBottom: "48px",
    },
    headerTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px",
      marginBottom: "16px",
    },
    headerTitle: {
      fontSize: `clamp(28px, 5vw, 36px)`,
      fontWeight: "600",
      margin: "0 0 8px",
      color: "#0f172a",
    },
    headerSubtitle: {
      fontSize: "15px",
      color: "#64748b",
      margin: "0",
    },
    headerDescription: {
      fontSize: "14px",
      color: "#475569",
      margin: "12px 0 0",
      lineHeight: "1.6",
    },
    backBtn: {
      padding: "10px 20px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      backgroundColor: "white",
      color: "#334155",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "16px",
      marginBottom: "32px",
    },
    statCard: {
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "20px",
      textAlign: "center",
    },
    statValue: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#185fa5",
      margin: "0 0 8px",
    },
    statLabel: {
      fontSize: "13px",
      color: "#64748b",
      margin: "0",
    },
    toolbar: {
      display: "grid",
      gridTemplateColumns: "1fr auto auto auto",
      gap: "12px",
      marginBottom: "24px",
      alignItems: "center",
    },
    toolbarMobile: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "10px",
    },
    searchBox: {
      padding: "11px 14px",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "14px",
      background: "white",
      outline: "none",
      color: "#0f172a",
      boxSizing: "border-box",
      transition: "border-color 0.2s",
    },
    searchBoxFocus: {
      borderColor: "#185fa5",
    },
    filterSelect: {
      padding: "11px 14px",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "14px",
      background: "white",
      outline: "none",
      color: "#0f172a",
      cursor: "pointer",
      transition: "border-color 0.2s",
    },
    card: {
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      overflow: "hidden",
    },
    tableHeader: {
      display: "grid",
      gridTemplateColumns: "2fr 2fr 1.5fr 1fr 100px",
      gap: "16px",
      padding: "16px 20px",
      background: "#f1f5f9",
      borderBottom: "1px solid #e2e8f0",
      fontSize: "12px",
      fontWeight: "600",
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    tableHeaderMobile: {
      display: "none",
    },
    row: {
      display: "grid",
      gridTemplateColumns: "2fr 2fr 1.5fr 1fr 100px",
      gap: "16px",
      padding: "16px 20px",
      borderBottom: "1px solid #e2e8f0",
      alignItems: "center",
      transition: "background 0.2s",
    },
    rowMobile: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      padding: "16px",
      borderBottom: "1px solid #e2e8f0",
    },
    rowHover: {
      backgroundColor: "#f8fafc",
    },
    avatar: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #185fa5 0%, #0e3d6e 100%)",
      color: "white",
      fontSize: "14px",
      fontWeight: "700",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    nameCell: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    nameCellMobile: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      flexDirection: "row",
    },
    name: {
      fontSize: "15px",
      fontWeight: "600",
      color: "#0f172a",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    email: {
      fontSize: "14px",
      color: "#64748b",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    coursePill: {
      display: "inline-flex",
      alignItems: "center",
      padding: "5px 12px",
      borderRadius: "20px",
      background: "#e0f2fe",
      color: "#185fa5",
      fontSize: "13px",
      fontWeight: "600",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    levelPill: {
      display: "inline-flex",
      alignItems: "center",
      padding: "5px 12px",
      borderRadius: "20px",
      background: "#e0fdf4",
      color: "#0d9488",
      fontSize: "13px",
      fontWeight: "600",
    },
    deleteBtn: {
      padding: "8px 14px",
      border: "1px solid #fecaca",
      borderRadius: "8px",
      background: "#fef2f2",
      color: "#b91c1c",
      fontSize: "13px",
      fontWeight: "600",
      cursor: "pointer",
      whiteSpace: "nowrap",
      transition: "all 0.2s",
    },
    deleteBtnHover: {
      backgroundColor: "#fee2e2",
      borderColor: "#fca5a5",
    },
    countBar: {
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid #e2e8f0",
      fontSize: "14px",
      color: "#64748b",
      fontWeight: "500",
    },
    empty: {
      padding: "48px 20px",
      textAlign: "center",
      color: "#94a3b8",
      fontSize: "14px",
    },
    emptyTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#0f172a",
      margin: "0 0 8px",
    },
    mobileLabel: {
      fontSize: "11px",
      fontWeight: "600",
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: "4px",
    },
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const adminToken = localStorage.getItem("adminToken");
      const response = await api.get(
        `/api/users/admin/all?page=${currentPage}&limit=50`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );

      // Handle the response structure
      const responseData = response.data;
      console.log("Full API Response:", responseData);

      // Extract the values - they might be at response.data or nested
      const users = responseData.users || responseData.data || [];
      const total = responseData.total || 0;
      const totalPages = responseData.totalPages || 1;

      console.log(
        "Extracted - Users:",
        users.length,
        "Total:",
        total,
        "Pages:",
        totalPages,
      );

      setUsers(users);
      setTotalUsers(total);
      setTotalPages(totalPages);
    } catch (err) {
      console.error("Error fetching users:", err);
      alert("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

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

  const getInitials = (name) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("");
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const UserRowDesktop = ({ user, onDelete }) => {
    const [hovered, setHovered] = useState(false);
    const courseName = user.courseId?.name || "No course";

    return (
      <div
        style={{
          ...S.row,
          ...(hovered && S.rowHover),
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={S.nameCell}>
          <div style={S.avatar}>{getInitials(user.fullName)}</div>
          <span style={S.name} title={user.fullName}>
            {user.fullName}
          </span>
        </div>

        <span style={S.email} title={user.email}>
          {user.email}
        </span>

        <span style={S.coursePill} title={courseName}>
          {courseName}
        </span>

        <span style={S.levelPill}>L{user.level}</span>

        <button
          style={S.deleteBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#fee2e2";
            e.currentTarget.style.borderColor = "#fca5a5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#fef2f2";
            e.currentTarget.style.borderColor = "#fecaca";
          }}
          onClick={() => onDelete(user._id, user.fullName)}
        >
          Remove
        </button>
      </div>
    );
  };

  const UserRowMobile = ({ user, onDelete }) => {
    const courseName = user.courseId?.name || "No course";

    return (
      <div style={S.rowMobile}>
        <div style={S.nameCellMobile}>
          <div style={S.avatar}>{getInitials(user.fullName)}</div>
          <div style={{ flex: 1 }}>
            <div style={S.name}>{user.fullName}</div>
            <div style={S.email}>{user.email}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <div style={S.mobileLabel}>Course</div>
            <span style={S.coursePill}>{courseName}</span>
          </div>
          <div>
            <div style={S.mobileLabel}>Level</div>
            <span style={S.levelPill}>L{user.level}</span>
          </div>
        </div>

        <button
          style={S.deleteBtn}
          onClick={() => onDelete(user._id, user.fullName)}
        >
          Remove User
        </button>
      </div>
    );
  };

  return (
    <div style={S.container}>
      <div style={S.maxWidth}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.headerTop}>
            <div style={{ flex: 1 }}>
              <p style={S.headerSubtitle}>User management</p>
              <h1 style={S.headerTitle}>Registered Users</h1>
              <p style={S.headerDescription}>
                View and manage all students registered on the platform.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin")}
              style={S.backBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f1f5f9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        {!isLoading && totalUsers > 0 && (
          <div style={S.statsGrid}>
            <div style={S.statCard}>
              <div style={S.statValue}>{totalUsers}</div>
              <p style={S.statLabel}>Total users</p>
            </div>
            <div style={S.statCard}>
              <div style={S.statValue}>{courses.length}</div>
              <p style={S.statLabel}>Courses</p>
            </div>
            <div style={S.statCard}>
              <div style={S.statValue}>{levels.length}</div>
              <p style={S.statLabel}>Active levels</p>
            </div>
            {topCourse && (
              <div style={S.statCard}>
                <div style={{ ...S.statValue, fontSize: "18px" }}>
                  {topCourse[0]}
                </div>
                <p style={S.statLabel}>
                  Most popular · {topCourse[1]} student
                  {topCourse[1] !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Toolbar */}
        <div style={isMobile ? S.toolbarMobile : S.toolbar}>
          <input
            style={S.searchBox}
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#185fa5";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
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
                Level {l}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div style={S.card}>
          {/* Header - Desktop only */}
          {!isMobile && (
            <div style={S.tableHeader}>
              <span>Name</span>
              <span>Email</span>
              <span>Course</span>
              <span>Level</span>
              <span>Action</span>
            </div>
          )}

          {/* Count bar */}
          <div style={S.countBar}>
            <span>
              {filtered.length} user{filtered.length !== 1 ? "s" : ""} on page{" "}
              {currentPage}
              {filtered.length !== users.length
                ? ` (filtered from ${users.length} on page)`
                : ""}
            </span>
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>
              {totalUsers} total users across {totalPages} page
              {totalPages !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Rows */}
          {isLoading ? (
            <div style={S.empty}>
              <p style={S.emptyTitle}>Loading users…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={S.empty}>
              <p style={S.emptyTitle}>No users found</p>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          ) : isMobile ? (
            filtered.map((user) => (
              <UserRowMobile
                key={user._id}
                user={user}
                onDelete={handleDelete}
              />
            ))
          ) : (
            filtered.map((user) => (
              <UserRowDesktop
                key={user._id}
                user={user}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "20px",
              justifyContent: "center",
              alignItems: "center",
              padding: "16px",
            }}
          >
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              style={{
                padding: "10px 16px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                background: currentPage === 1 ? "#f1f5f9" : "white",
                color: currentPage === 1 ? "#94a3b8" : "#334155",
                fontSize: "14px",
                fontWeight: "600",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (currentPage !== 1) {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.borderColor = "#cbd5e1";
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 1) {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }
              }}
            >
              ← Previous
            </button>

            <span
              style={{
                padding: "0 16px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#0f172a",
                minWidth: "100px",
                textAlign: "center",
              }}
            >
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              style={{
                padding: "10px 16px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                background: currentPage === totalPages ? "#f1f5f9" : "white",
                color: currentPage === totalPages ? "#94a3b8" : "#334155",
                fontSize: "14px",
                fontWeight: "600",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (currentPage !== totalPages) {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.borderColor = "#cbd5e1";
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== totalPages) {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsersPage;
