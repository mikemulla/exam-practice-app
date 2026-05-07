import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

function AdminPage() {
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  const fetchRecentActivity = async () => {
    try {
      setActivityLoading(true);
      const res = await api.get("/api/results/admin/recent-activity?limit=8", {
        _tokenType: "admin",
      });
      setRecentActivity(res.data.activities || res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch recent activity:", error);
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeTaken = (seconds) => {
    const totalSeconds = Number(seconds || 0);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    if (minutes <= 0) return `${remainingSeconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Design tokens
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
    headerTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px",
      marginBottom: "16px",
    },
    logoutBtn: {
      padding: "10px 20px",
      borderRadius: "8px",
      border: "1px solid #fecaca",
      backgroundColor: "#fef2f2",
      color: "#b91c1c",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    section: {
      marginBottom: "48px",
    },
    sectionTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#0f172a",
      margin: "0 0 24px",
      paddingBottom: "12px",
      borderBottom: "2px solid #185fa5",
      display: "inline-block",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      marginBottom: "24px",
    },
    gridWide: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: "16px",
    },
    card: {
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "20px",
      transition: "all 0.2s ease",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
    },
    cardHover: {
      "&:hover": {
        borderColor: "#185fa5",
        boxShadow: "0 4px 12px rgba(24, 95, 165, 0.08)",
      },
    },
    cardTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#0f172a",
      margin: "0 0 8px",
    },
    cardDescription: {
      fontSize: "13px",
      color: "#64748b",
      margin: "0 0 16px",
      flex: 1,
    },
    button: {
      width: "100%",
      padding: "11px 16px",
      border: "none",
      borderRadius: "8px",
      backgroundColor: "#185fa5",
      color: "white",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s",
      marginTop: "auto",
    },
    activityCard: {
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "28px",
    },
    activityHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px",
      marginBottom: "24px",
    },
    refreshBtn: {
      padding: "10px 18px",
      borderRadius: "8px",
      border: "1px solid #bfdbfe",
      backgroundColor: "#eff6ff",
      color: "#185fa5",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    activityItem: {
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: "16px",
      alignItems: "flex-start",
      padding: "16px",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      backgroundColor: "#ffffff",
      marginBottom: "12px",
    },
    activityItemLast: {
      marginBottom: "0",
    },
    userName: {
      fontSize: "15px",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 6px",
    },
    userAction: {
      fontSize: "14px",
      color: "#475569",
      margin: "0 0 6px",
      lineHeight: "1.5",
    },
    userMeta: {
      fontSize: "13px",
      color: "#94a3b8",
      margin: "0",
    },
    scoreContainer: {
      minWidth: "85px",
      textAlign: "right",
    },
    scoreValue: {
      fontSize: "24px",
      fontWeight: "800",
      margin: "0 0 4px",
    },
    scoreLabel: {
      fontSize: "12px",
      color: "#64748b",
      fontWeight: "700",
      margin: "0",
    },
    emptyState: {
      padding: "32px 20px",
      textAlign: "center",
      border: "1px dashed #cbd5e1",
      borderRadius: "10px",
      backgroundColor: "#f8fafc",
    },
    emptyStateTitle: {
      fontSize: "15px",
      fontWeight: "700",
      color: "#0f172a",
      margin: "0 0 6px",
    },
    emptyStateText: {
      fontSize: "14px",
      color: "#64748b",
      margin: "0",
    },
    loadingState: {
      padding: "32px 20px",
      textAlign: "center",
      border: "1px dashed #cbd5e1",
      borderRadius: "10px",
      backgroundColor: "#f8fafc",
      color: "#64748b",
      fontSize: "14px",
    },
  };

  // Menu items grouped by category
  const createMenuItems = [
    {
      title: "Add Subject",
      description: "Create a new subject with timer settings.",
      icon: "📚",
      path: "/add-subject",
    },
    {
      title: "Add Topic",
      description: "Create topics under existing subjects.",
      icon: "🏷️",
      path: "/add-topic",
    },
    {
      title: "Add Question",
      description: "Manually add a single question.",
      icon: "❓",
      path: "/add-question",
    },
    {
      title: "Bulk Import",
      description: "Import many questions at once.",
      icon: "📤",
      path: "/bulk-import",
    },
  ];

  const manageMenuItems = [
    {
      title: "Manage Subjects",
      description: "Edit, update, or remove subjects.",
      icon: "⚙️",
      path: "/manage-subjects",
    },
    {
      title: "Manage Topics",
      description: "Edit, update, or remove topics.",
      icon: "⚙️",
      path: "/manage-topics",
    },
    {
      title: "Manage Questions",
      description: "Edit, delete, or bulk delete questions.",
      icon: "⚙️",
      path: "/manage-questions",
    },
  ];

  const otherMenuItems = [
    {
      title: "Subject Requests",
      description: "View requests submitted by users.",
      icon: "📋",
      path: "/admin-requests",
    },
    {
      title: "Registered Users",
      description: "View and manage student accounts.",
      icon: "👥",
      path: "/admin-users",
    },
  ];

  const getScoreColor = (percent) => {
    if (percent >= 70) return "#16a34a";
    if (percent >= 50) return "#f59e0b";
    return "#dc2626";
  };

  const MenuCard = ({ item }) => (
    <div
      style={S.card}
      onClick={() => navigate(item.path)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#185fa5";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(24, 95, 165, 0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ fontSize: "28px", marginBottom: "12px" }}>{item.icon}</div>
      <h3 style={S.cardTitle}>{item.title}</h3>
      <p style={S.cardDescription}>{item.description}</p>
      <button style={S.button}>Go →</button>
    </div>
  );

  return (
    <div style={S.container}>
      <div style={S.maxWidth}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.headerTop}>
            <div>
              <p style={S.headerSubtitle}>Admin dashboard</p>
              <h1 style={S.headerTitle}>Manage exam content</h1>
              <p style={S.headerDescription}>
                Create and organize subjects, topics, and questions for your
                exam preparation platform.
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={S.logoutBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#fee2e2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#fef2f2";
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Create Section */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Create content</div>
          <div style={S.grid}>
            {createMenuItems.map((item) => (
              <MenuCard key={item.path} item={item} />
            ))}
          </div>
        </div>

        {/* Manage Section */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Manage content</div>
          <div style={S.grid}>
            {manageMenuItems.map((item) => (
              <MenuCard key={item.path} item={item} />
            ))}
          </div>
        </div>

        {/* Other Section */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Other</div>
          <div style={S.grid}>
            {otherMenuItems.map((item) => (
              <MenuCard key={item.path} item={item} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ ...S.section, marginBottom: "0" }}>
          <div style={S.activityCard}>
            <div style={S.activityHeader}>
              <div>
                <h2 style={{ ...S.sectionTitle, marginBottom: "0" }}>
                  Recent activity
                </h2>
                <p style={S.headerDescription} style={{ marginTop: "8px" }}>
                  Latest completed tests from all registered users.
                </p>
              </div>
              <button
                onClick={fetchRecentActivity}
                style={S.refreshBtn}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#dbeafe";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#eff6ff";
                }}
              >
                ↻ Refresh
              </button>
            </div>

            {activityLoading ? (
              <div style={S.loadingState}>Loading recent activity...</div>
            ) : recentActivity.length === 0 ? (
              <div style={S.emptyState}>
                <p style={S.emptyStateTitle}>No recent activity yet</p>
                <p style={S.emptyStateText}>
                  Completed tests will appear here once users start practicing.
                </p>
              </div>
            ) : (
              <div>
                {recentActivity.map((item, index) => {
                  const percent = item.total
                    ? Math.round(
                        (Number(item.score) / Number(item.total)) * 100,
                      )
                    : 0;

                  return (
                    <div
                      key={item._id}
                      style={{
                        ...S.activityItem,
                        ...(index === recentActivity.length - 1 &&
                          S.activityItemLast),
                      }}
                    >
                      <div>
                        <p style={S.userName}>
                          {item.userId?.fullName || "Unknown User"}
                        </p>
                        <p style={S.userAction}>
                          Completed{" "}
                          {item.mode === "topic"
                            ? "a topic test"
                            : "a subject test"}{" "}
                          in {item.subjectId?.name || "Unknown Subject"}
                          {item.topicId?.name ? ` • ${item.topicId.name}` : ""}
                        </p>
                        <p style={S.userMeta}>
                          {item.userId?.email || "No email"}
                          {" • "}
                          {item.userId?.courseId?.name || "Unknown Course"}
                          {" • "}
                          Level {item.userId?.level || "-"}
                          {" • "}
                          {formatTimeTaken(item.timeTaken)}
                          {" • "}
                          {formatDate(item.createdAt)}
                        </p>
                      </div>

                      <div style={S.scoreContainer}>
                        <p
                          style={{
                            ...S.scoreValue,
                            color: getScoreColor(percent),
                          }}
                        >
                          {percent}%
                        </p>
                        <p style={S.scoreLabel}>
                          {item.score}/{item.total}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
