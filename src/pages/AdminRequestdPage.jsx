import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const S = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f8fbff 0%, #eef4ff 50%, #f7f9fc 100%)",
    padding: "32px 20px",
  },
  inner: { maxWidth: "1050px", margin: "0 auto" },
  eyebrow: { margin: 0, color: "#64748b", fontSize: "14px", fontWeight: "600" },
  heading: { margin: "10px 0 8px", fontSize: "36px", color: "#0f172a" },
  subheading: { margin: 0, color: "#475569", lineHeight: "1.6" },
  filterRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  card: {
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
  },
  row: { borderBottom: "1px solid #e2e8f0", padding: "18px 0" },
  rowInner: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  rowLeft: { flex: 1, minWidth: "240px" },
  rowActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  empty: { color: "#64748b" },
  filterBtn: (active) => ({
    padding: "11px 16px",
    borderRadius: "10px",
    border: active ? "none" : "1px solid #cbd5e1",
    backgroundColor: active ? "#185FA5" : "white",
    color: active ? "white" : "#0f172a",
    fontWeight: "700",
    cursor: "pointer",
  }),
  secondaryBtn: {
    padding: "11px 16px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    backgroundColor: "white",
    color: "#0f172a",
    fontWeight: "700",
    cursor: "pointer",
  },
  actionBtn: (color) => ({
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: color,
    color: "white",
    fontWeight: "700",
    cursor: "pointer",
  }),
  badge: (status) => ({
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    backgroundColor: status === "pending" ? "#fff7ed" : "#f0fdf4",
    color: status === "pending" ? "#c2410c" : "#15803d",
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "10px",
    textTransform: "capitalize",
  }),
  subject: { margin: "0 0 8px", color: "#0f172a", textTransform: "capitalize" },
  info: { margin: "0 0 6px", color: "#475569", lineHeight: "1.6" },
};

const formatFileSize = (bytes) =>
  bytes ? `${(bytes / (1024 * 1024)).toFixed(2)} MB` : "No file";

function RequestRow({ request, onMarkReviewed, onDelete }) {
  return (
    <div style={S.row}>
      <div style={S.rowInner}>
        <div style={S.rowLeft}>
          <span style={S.badge(request.status)}>{request.status}</span>
          <h3 style={S.subject}>{request.subject}</h3>
          <p style={S.info}>
            <strong>Topic:</strong> {request.topic}
          </p>
          <p style={S.info}>
            <strong>Timer:</strong> {request.timer} minutes
          </p>
          <p style={S.info}>
            <strong>File:</strong>{" "}
            {request.fileName
              ? `${request.fileName} (${formatFileSize(request.fileSize)})`
              : "No file uploaded"}
          </p>
          <p style={S.info}>
            <strong>Submitted:</strong>{" "}
            {new Date(request.createdAt).toLocaleString()}
          </p>
        </div>
        <div style={S.rowActions}>
          {request.status !== "reviewed" && (
            <button
              onClick={() => onMarkReviewed(request._id)}
              style={S.actionBtn("#15803d")}
            >
              Mark Reviewed
            </button>
          )}
          <button
            onClick={() => onDelete(request._id)}
            style={S.actionBtn("#dc2626")}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/api/requests");
      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
      alert("Failed to load requests");
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
      await api.put(`/api/requests/${id}/reviewed`);
      fetchRequests();
    } catch (err) {
      console.error("Error marking request reviewed:", err);
      alert("Failed to update request");
    }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;
    try {
      await api.delete(`/api/requests/${id}`);
      fetchRequests();
    } catch (err) {
      console.error("Error deleting request:", err);
      alert("Failed to delete request");
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div style={S.page}>
      <div style={S.inner}>
        <div style={{ marginBottom: "24px" }}>
          <p style={S.eyebrow}>Admin / Subject requests</p>
          <h1 style={S.heading}>Request Inbox</h1>
          <p style={S.subheading}>View subject requests submitted by users.</p>
        </div>

        <div style={S.filterRow}>
          <button
            onClick={() => setFilter("all")}
            style={S.filterBtn(filter === "all")}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            style={S.filterBtn(filter === "pending")}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("reviewed")}
            style={S.filterBtn(filter === "reviewed")}
          >
            Reviewed
          </button>
          <button onClick={() => navigate("/admin")} style={S.secondaryBtn}>
            Back to Admin
          </button>
        </div>

        <div style={S.card}>
          {isLoading ? (
            <p style={S.empty}>Loading requests...</p>
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
    </div>
  );
}

export default AdminRequestsPage;
