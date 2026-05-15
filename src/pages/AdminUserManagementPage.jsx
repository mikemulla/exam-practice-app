import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const LEVELS = [100, 200, 300, 400, 500, 600];

const getArray = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

function AdminUserManagementPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAllUsers = async () => {
    const allUsers = [];
    let page = 1;
    let totalPages = 1;

    do {
      const { data } = await api.get(
        `/api/users/admin/all?page=${page}&limit=100`,
        { _tokenType: "admin" },
      );

      allUsers.push(...getArray(data, "users"));
      totalPages = Number(data?.totalPages || 1);
      page += 1;
    } while (page <= totalPages);

    return allUsers;
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [usersData, coursesRes] = await Promise.all([
        fetchAllUsers(),
        api.get("/api/courses", { _tokenType: "admin" }),
      ]);

      setUsers(usersData);
      setCourses(getArray(coursesRes.data, "courses"));
    } catch (error) {
      console.error("Admin user management load error:", error);
      alert(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return users.filter((user) => {
      const courseId =
        typeof user.courseId === "object" ? user.courseId?._id : user.courseId;

      if (filterCourse && courseId !== filterCourse) return false;
      if (filterLevel && String(user.level) !== String(filterLevel))
        return false;

      if (q) {
        const searchText = `${user.fullName || ""} ${user.email || ""} ${
          user.courseId?.name || ""
        } ${user.level || ""}`.toLowerCase();

        if (!searchText.includes(q)) return false;
      }

      return true;
    });
  }, [users, search, filterCourse, filterLevel]);

  const selectedUsersOnThisPage = useMemo(
    () => filteredUsers.filter((user) => selectedUsers.includes(user._id)),
    [filteredUsers, selectedUsers],
  );

  const allFilteredSelected =
    filteredUsers.length > 0 &&
    selectedUsersOnThisPage.length === filteredUsers.length;

  const toggleUser = (id) => {
    setSelectedUsers((previous) =>
      previous.includes(id)
        ? previous.filter((userId) => userId !== id)
        : [...previous, id],
    );
  };

  const toggleAllFilteredUsers = () => {
    if (allFilteredSelected) {
      const filteredIds = new Set(filteredUsers.map((user) => user._id));
      setSelectedUsers((previous) =>
        previous.filter((id) => !filteredIds.has(id)),
      );
      return;
    }

    setSelectedUsers((previous) => {
      const next = new Set(previous);
      filteredUsers.forEach((user) => next.add(user._id));
      return Array.from(next);
    });
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const handleBulkUpdate = async () => {
    if (saving) return;

    if (selectedUsers.length === 0) {
      alert("Select at least one user.");
      return;
    }

    if (!selectedCourse && !selectedLevel) {
      alert("Select a course, level, or both.");
      return;
    }

    const confirmMessage = `Update ${selectedUsers.length} selected user${
      selectedUsers.length !== 1 ? "s" : ""
    }?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setSaving(true);

      const payload = {
        userIds: selectedUsers,
      };

      if (selectedCourse) payload.courseId = selectedCourse;
      if (selectedLevel) payload.level = Number(selectedLevel);

      const { data } = await api.patch(
        "/api/users/admin/bulk-update",
        payload,
        {
          _tokenType: "admin",
        },
      );

      alert(data?.message || "Users updated successfully.");

      setSelectedUsers([]);
      setSelectedCourse("");
      setSelectedLevel("");

      await fetchData();
    } catch (error) {
      console.error("Bulk update users error:", error);
      alert(error.message || "Failed to update users.");
    } finally {
      setSaving(false);
    }
  };

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
      marginBottom: "32px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "16px",
      flexWrap: "wrap",
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
    backButton: {
      padding: "10px 20px",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      backgroundColor: "#ffffff",
      color: "#0f172a",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    section: {
      marginBottom: "32px",
    },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#0f172a",
      margin: "0 0 16px",
    },
    card: {
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "24px",
    },
    statsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "16px",
      marginBottom: "24px",
    },
    statBox: {
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      padding: "16px",
      backgroundColor: "#f8fafc",
      textAlign: "center",
    },
    statValue: {
      display: "block",
      fontSize: "28px",
      fontWeight: "700",
      color: "#185fa5",
      margin: "0",
    },
    statLabel: {
      display: "block",
      marginTop: "6px",
      fontSize: "12px",
      color: "#64748b",
      fontWeight: "600",
      margin: "0",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "12px",
      marginBottom: "16px",
    },
    input: {
      width: "100%",
      padding: "11px 14px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      backgroundColor: "#ffffff",
      color: "#0f172a",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      transition: "all 0.2s",
    },
    inputFocus: {
      borderColor: "#185fa5",
      boxShadow: "0 0 0 3px rgba(24, 95, 165, 0.08)",
    },
    primaryButton: {
      padding: "11px 20px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "#185fa5",
      color: "#ffffff",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    primaryButtonHover: {
      backgroundColor: "#1445a0",
      boxShadow: "0 4px 12px rgba(24, 95, 165, 0.15)",
    },
    secondaryButton: {
      padding: "10px 16px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      backgroundColor: "#ffffff",
      color: "#0f172a",
      fontWeight: "600",
      fontSize: "13px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    secondaryButtonHover: {
      backgroundColor: "#f8fafc",
      borderColor: "#cbd5e1",
    },
    tableTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      marginBottom: "20px",
      flexWrap: "wrap",
    },
    actionRow: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    },
    tableWrap: {
      overflowX: "auto",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "700px",
    },
    th: {
      textAlign: "left",
      padding: "14px 16px",
      backgroundColor: "#f1f5f9",
      color: "#475569",
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      borderBottom: "1px solid #e2e8f0",
    },
    td: {
      padding: "14px 16px",
      borderBottom: "1px solid #e2e8f0",
      color: "#0f172a",
      fontSize: "14px",
      verticalAlign: "middle",
    },
    emptyCell: {
      padding: "40px 16px",
      textAlign: "center",
      color: "#64748b",
      fontSize: "14px",
    },
    loadingCell: {
      padding: "40px 16px",
      textAlign: "center",
      color: "#64748b",
      fontSize: "14px",
    },
    smallText: {
      margin: "8px 0 0",
      fontSize: "13px",
      color: "#64748b",
    },
  };

  return (
    <div style={S.container}>
      <div style={S.maxWidth}>
        {/* Header */}
        <div style={S.header}>
          <div>
            <p style={S.headerSubtitle}>Admin / User Management</p>
            <h1 style={S.headerTitle}>Bulk Manage Users</h1>
            <p style={S.headerDescription}>
              Select multiple users and update their course, level, or both at
              once.
            </p>
          </div>

          <button
            type="button"
            style={S.backButton}
            onClick={() => navigate("/admin")}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f1f5f9";
              e.currentTarget.style.borderColor = "#cbd5e1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ffffff";
              e.currentTarget.style.borderColor = "#cbd5e1";
            }}
          >
            ← Back to Admin
          </button>
        </div>

        {/* Stats */}
        <div style={S.section}>
          <div style={S.card}>
            <div style={S.statsRow}>
              <div style={S.statBox}>
                <p style={S.statValue}>{users.length}</p>
                <p style={S.statLabel}>Total Users</p>
              </div>

              <div style={S.statBox}>
                <p style={S.statValue}>{filteredUsers.length}</p>
                <p style={S.statLabel}>Filtered Users</p>
              </div>

              <div style={S.statBox}>
                <p style={S.statValue}>{selectedUsers.length}</p>
                <p style={S.statLabel}>Selected Users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div style={S.section}>
          <div style={S.card}>
            <h2 style={S.sectionTitle}>Filter users</h2>
            <div style={S.grid}>
              <input
                type="text"
                placeholder="Search name, email, course or level"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={S.input}
                onFocus={(e) => {
                  e.target.style.borderColor = "#185fa5";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(24, 95, 165, 0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />

              <select
                value={filterCourse}
                onChange={(event) => setFilterCourse(event.target.value)}
                style={S.input}
              >
                <option value="">Filter by course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>

              <select
                value={filterLevel}
                onChange={(event) => setFilterLevel(event.target.value)}
                style={S.input}
              >
                <option value="">Filter by level</option>
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    Level {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Update Section */}
        <div style={S.section}>
          <div style={S.card}>
            <h2 style={S.sectionTitle}>Bulk update selected users</h2>
            <div style={S.grid}>
              <select
                value={selectedCourse}
                onChange={(event) => setSelectedCourse(event.target.value)}
                style={S.input}
                disabled={saving}
              >
                <option value="">Do not change course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(event) => setSelectedLevel(event.target.value)}
                style={S.input}
                disabled={saving}
              >
                <option value="">Do not change level</option>
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    Level {level}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleBulkUpdate}
                disabled={saving}
                style={{
                  ...S.primaryButton,
                  opacity: saving ? 0.65 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.currentTarget.style.backgroundColor = "#1445a0";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(24, 95, 165, 0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#185fa5";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {saving ? "Updating..." : "Update Selected"}
              </button>
            </div>
          </div>
        </div>

        {/* Users Table Section */}
        <div style={S.section}>
          <div style={S.card}>
            <div style={S.tableTop}>
              <div>
                <h2 style={S.sectionTitle}>Users</h2>
                <p style={S.smallText}>
                  Showing {filteredUsers.length} of {users.length} users
                </p>
              </div>

              <div style={S.actionRow}>
                <button
                  type="button"
                  style={S.secondaryButton}
                  onClick={toggleAllFilteredUsers}
                  disabled={filteredUsers.length === 0}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = "#f1f5f9";
                      e.currentTarget.style.borderColor = "#cbd5e1";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                >
                  {allFilteredSelected
                    ? "Unselect Filtered"
                    : "Select Filtered"}
                </button>

                <button
                  type="button"
                  style={S.secondaryButton}
                  onClick={clearSelection}
                  disabled={selectedUsers.length === 0}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = "#f1f5f9";
                      e.currentTarget.style.borderColor = "#cbd5e1";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                >
                  Clear Selection
                </button>
              </div>
            </div>

            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Select</th>
                    <th style={S.th}>Name</th>
                    <th style={S.th}>Email</th>
                    <th style={S.th}>Course</th>
                    <th style={S.th}>Level</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td style={S.loadingCell} colSpan="5">
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td style={S.emptyCell} colSpan="5">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td style={S.td}>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => toggleUser(user._id)}
                          />
                        </td>
                        <td style={S.td}>{user.fullName || "Unnamed user"}</td>
                        <td style={S.td}>{user.email}</td>
                        <td style={S.td}>
                          {user.courseId?.name || "No course"}
                        </td>
                        <td style={S.td}>
                          {user.level ? `Level ${user.level}` : "No level"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUserManagementPage;
