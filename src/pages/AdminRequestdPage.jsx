import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const apiArray = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not available";

const fmtSize = (bytes) => {
  if (!bytes) return null;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
};

const initials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/* ─── Icons ─────────────────────────────────────────────────────────────── */

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
);

const PaperclipIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.41 17.41a2 2 0 01-2.83-2.83l8.49-8.48" />
  </svg>
);

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const S = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: "32px 20px",
  },
  inner: { maxWidth: "780px", margin: "0 auto" },

  eyebrow: {
    margin: 0,
    fontSize: "11px",
    fontWeight: 600,
    color: "#94a3b8",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "6px",
  },
  heading: {
    margin: "0 0 4px",
    fontSize: "26px",
    fontWeight: 700,
    color: "#0f172a",
  },
  subheading: {
    margin: "0 0 24px",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "20px",
  },
  statCard: {
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "14px 16px",
  },
  statLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: 600,
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: "0 0 4px",
  },
  statValue: { fontSize: "22px", fontWeight: 700, margin: 0 },

  filterRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "20px",
    alignItems: "center",
  },
  pill: (active) => ({
    padding: "8px 16px",
    borderRadius: "999px",
    border: active ? "none" : "1px solid #e2e8f0",
    backgroundColor: active ? "#185FA5" : "white",
    color: active ? "white" : "#475569",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  }),
  backBtn: {
    marginLeft: "auto",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    backgroundColor: "white",
    color: "#475569",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  list: { display: "flex", flexDirection: "column", gap: "12px" },

  card: {
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    gap: "12px",
  },
  badge: (status) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
    backgroundColor: status === "pending" ? "#fff7ed" : "#f0fdf4",
    color: status === "pending" ? "#c2410c" : "#15803d",
    textTransform: "capitalize",
  }),
  badgeDot: (status) => ({
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: status === "pending" ? "#c2410c" : "#15803d",
    flexShrink: 0,
  }),

  subject: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 12px",
    textTransform: "capitalize",
  },

  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "10px 20px",
    marginBottom: "12px",
  },
  metaItem: { display: "flex", flexDirection: "column", gap: "2px" },
  metaLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  metaValue: { fontSize: "13px", color: "#334155" },

  fileChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    backgroundColor: "#f1f5f9",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#475569",
    marginBottom: "12px",
    maxWidth: "100%",
    overflow: "hidden",
  },
  fileName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },
  fileSize: { color: "#94a3b8", flexShrink: 0 },

  divider: { height: "1px", backgroundColor: "#f1f5f9", margin: "14px 0" },

  userRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
  },
  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    backgroundColor: "#dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: 700,
    color: "#1d4ed8",
    flexShrink: 0,
  },
  userName: { fontSize: "13px", fontWeight: 600, color: "#0f172a", margin: 0 },
  userEmail: { fontSize: "12px", color: "#94a3b8", margin: 0 },

  actionsRow: { display: "flex", gap: "8px", flexWrap: "wrap" },

  reviewBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#185FA5",
    color: "white",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
  },
  deleteBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 14px",
    borderRadius: "8px",
    border: "1px solid #fecaca",
    backgroundColor: "#fff5f5",
    color: "#dc2626",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
  },

  empty: {
    color: "#94a3b8",
    textAlign: "center",
    padding: "40px 0",
    fontSize: "14px",
  },

  toastWrap: {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9999,
    pointerEvents: "none",
  },
  toast: (visible) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 18px",
    borderRadius: "10px",
    backgroundColor: "#0f172a",
    color: "white",
    fontSize: "13px",
    fontWeight: 500,
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(8px)",
    transition: "opacity 0.25s, transform 0.25s",
    whiteSpace: "nowrap",
  }),
};

/* ─── Toast ─────────────────────────────────────────────────────────────── */

function Toast({ message, visible }) {
  return (
    <div style={S.toastWrap}>
      <div style={S.toast(visible)}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4ade80"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {message}
      </div>
    </div>
  );
}

/* ─── RequestRow ─────────────────────────────────────────────────────────── */

function RequestRow({ request, onMarkReviewed, onDelete }) {
  const u = request.userId || {};
  const courseName = u.courseId?.name || "Not available";
  const level = u.level || "Not available";
  const fullName = u.fullName || "Unknown user";
  const email = u.email || "No email";

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;
    onDelete(request._id);
  };

  const handleReview = () => {
    if (
      !window.confirm(
        `Mark "${request.subject}" as reviewed?\n\nThis will send a notification email to ${fullName} (${email}).`,
      )
    )
      return;
    onMarkReviewed(request._id);
  };

  return (
    <div style={S.card}>
      <div style={S.cardTop}>
        <span style={S.badge(request.status)}>
          <span style={S.badgeDot(request.status)} />
          {request.status}
        </span>
      </div>

      <p style={S.subject}>{request.subject}</p>

      <div style={S.metaGrid}>
        {[
          ["Course", courseName],
          ["Level", level],
          ["Topic", request.topic],
          ["Timer", `${request.timer} min`],
          ["Submitted", fmtDate(request.createdAt)],
        ].map(([label, value]) => (
          <div key={label} style={S.metaItem}>
            <span style={S.metaLabel}>{label}</span>
            <span style={S.metaValue}>{value}</span>
          </div>
        ))}
      </div>

      {request.fileName && (
        <div style={S.fileChip}>
          <PaperclipIcon />
          <span style={S.fileName}>{request.fileName}</span>
          {request.fileSize && (
            <span style={S.fileSize}>{fmtSize(request.fileSize)}</span>
          )}
        </div>
      )}

      <div style={S.divider} />

      <div style={S.userRow}>
        <div style={S.avatar}>{initials(fullName)}</div>
        <div>
          <p style={S.userName}>{fullName}</p>
          <p style={S.userEmail}>{email}</p>
        </div>
      </div>

      <div style={S.actionsRow}>
        {request.status !== "reviewed" && (
          <button onClick={handleReview} style={S.reviewBtn}>
            <CheckIcon /> Mark as reviewed
          </button>
        )}
        <button onClick={handleDelete} style={S.deleteBtn}>
          <TrashIcon /> Delete
        </button>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

function AdminRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  };

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/api/requests", { _tokenType: "admin" });
      setRequests(apiArray(data, "requests"));
    } catch (err) {
      console.error("Error fetching requests:", err);
      alert(err.message || "Failed to load requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(
    () =>
      filter === "all" ? requests : requests.filter((r) => r.status === filter),
    [requests, filter],
  );

  const markReviewed = async (id) => {
    try {
      await api.put(`/api/requests/${id}/reviewed`, null, {
        _tokenType: "admin",
      });
      showToast("Request marked as reviewed");
      fetchRequests();
    } catch (err) {
      console.error("Error marking request reviewed:", err);
      alert(err.message || "Failed to update request");
    }
  };

  const deleteRequest = async (id) => {
    try {
      await api.delete(`/api/requests/${id}`, { _tokenType: "admin" });
      showToast("Request deleted");
      fetchRequests();
    } catch (err) {
      console.error("Error deleting request:", err);
      alert(err.message || "Failed to delete request");
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const reviewedCount = requests.filter((r) => r.status === "reviewed").length;

  return (
    <div style={S.page}>
      <div style={S.inner}>
        <p style={S.eyebrow}>Admin · Subject requests</p>
        <h1 style={S.heading}>Request inbox</h1>
        <p style={S.subheading}>
          View and manage subject requests submitted by users.
        </p>

        <div style={S.stats}>
          {[
            ["Total", requests.length, "#0f172a"],
            ["Pending", pendingCount, "#c2410c"],
            ["Reviewed", reviewedCount, "#15803d"],
          ].map(([label, value, color]) => (
            <div key={label} style={S.statCard}>
              <p style={S.statLabel}>{label}</p>
              <p style={{ ...S.statValue, color }}>{value}</p>
            </div>
          ))}
        </div>

        <div style={S.filterRow}>
          {[
            ["all", `All (${requests.length})`],
            ["pending", `Pending (${pendingCount})`],
            ["reviewed", `Reviewed (${reviewedCount})`],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={S.pill(filter === key)}
            >
              {label}
            </button>
          ))}
          <button onClick={() => navigate("/admin")} style={S.backBtn}>
            ← Back to admin
          </button>
        </div>

        <div style={S.list}>
          {isLoading ? (
            <p style={S.empty}>Loading requests…</p>
          ) : filteredRequests.length === 0 ? (
            <p style={S.empty}>No requests found.</p>
          ) : (
            filteredRequests.map((request) => (
              <RequestRow
                key={request._id}
                request={request}
                onMarkReviewed={markReviewed}
                onDelete={deleteRequest}
              />
            ))
          )}
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}

export default AdminRequestsPage;
