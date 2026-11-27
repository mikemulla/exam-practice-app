// Small helpers shared by the admin pages.
export const ADMIN = { _tokenType: "admin" };

export const listOf = (data, key) =>
  Array.isArray(data) ? data : Array.isArray(data?.[key]) ? data[key] : Array.isArray(data?.data) ? data.data : [];

export const errorText = (err, fallback = "Something went wrong. Please try again.") =>
  err?.data?.message || err?.message || fallback;

export const idOf = (ref) => (ref && typeof ref === "object" ? ref._id || ref.id : ref) || "";

export const LEVELS = [100, 200, 300, 400, 500, 600];

export function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}

export function fmtDate(value, withTime = false) {
  if (!value) return "—";
  const d = new Date(value);
  const opts = { day: "numeric", month: "short", year: "numeric" };
  if (withTime) Object.assign(opts, { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleString("en-GB", opts);
}

export function timeAgo(value, now = Date.now()) {
  if (!value) return "never";
  const s = Math.max(0, Math.round((now - new Date(value).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 31) return `${d} day${d === 1 ? "" : "s"} ago`;
  return fmtDate(value);
}

export const STATUS_LABEL = {
  online: "Online now",
  today: "Active today",
  week: "This week",
  month: "This month",
  inactive: "Inactive",
  never: "Never came back",
};

export function statusText(student, now = Date.now()) {
  if (student.status === "online") return "Online now";
  if (student.status === "never") return "Never came back";
  if (!student.lastSeenAt) return "Not seen yet";
  const ago = timeAgo(student.lastSeenAt, now);
  if (student.status === "today") return `Active ${ago}`;
  return `${student.lastSeenEstimated ? "Last test" : "Seen"} ${ago}`;
}

export const DEVICE_LABEL = { phone: "Phone", tablet: "Tablet", computer: "Computer" };

export function deviceText(device, installed) {
  if (!device) return "—";
  return `${DEVICE_LABEL[device] || device}${installed ? " · app" : ""}`;
}

export const pctText = (n) => (n == null ? "—" : `${n}%`);
export const num = (n) => (n == null ? "—" : Number(n).toLocaleString("en-GB"));

// Sidebar badge counts, shared across admin pages and refreshed at most once a minute.
export const badgeCache = { at: 0, value: { reports: 0, requests: 0 } };
export function refreshAdminBadges() {
  badgeCache.at = 0;
}
