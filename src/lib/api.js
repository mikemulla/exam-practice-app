import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Routes that require the ADMIN token ───────────────────────────────────
// Only exact admin-only route segments — never user-facing ones.
const ADMIN_ROUTE_PATTERNS = [
  "/api/auth/admin-login",
  "/api/subjects/admin",
  "/api/topics/admin",
  "/api/questions/admin",
  "/api/questions/bulk",
  "/api/questions",
  "/api/requests",
  "/api/users/admin",
];

function isAdminRoute(url = "") {
  return ADMIN_ROUTE_PATTERNS.some(
    (pattern) => url === pattern || url.startsWith(pattern + "/"),
  );
}

// ── Request interceptor ───────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    // Explicit per-request override always wins
    if (config._tokenType === "admin") {
      const token = localStorage.getItem("adminToken");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    }

    if (config._tokenType === "user") {
      const token = localStorage.getItem("userToken");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    }

    // Heuristic: pick the right token based on the URL
    const token = isAdminRoute(url)
      ? localStorage.getItem("adminToken")
      : localStorage.getItem("userToken");

    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ──────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    if (status === 401) {
      if (isAdminRoute(url)) {
        localStorage.removeItem("adminToken");
        if (window.location.pathname !== "/admin-login") {
          window.location.href = "/admin-login";
        }
      } else {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userInfo");
        if (window.location.pathname !== "/user-login") {
          window.location.href = "/user-login";
        }
      }
    }

    // Normalise error so every caller gets a plain string from err.message
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    return Promise.reject(new Error(message));
  },
);

export default api;
