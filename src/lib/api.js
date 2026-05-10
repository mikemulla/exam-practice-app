import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const ADMIN_ROUTE_PATTERNS = [
  "/api/auth/admin-login",
  "/api/subjects/admin",
  "/api/topics/admin",
  "/api/questions/admin",
  "/api/questions/bulk",
  "/api/requests",
  "/api/users/admin",
  "/api/notifications",
];

const ADMIN_MUTATION_ROUTES = [
  { method: "post", path: "/api/subjects" },
  { method: "put", path: "/api/subjects" },
  { method: "delete", path: "/api/subjects" },
  { method: "post", path: "/api/topics" },
  { method: "put", path: "/api/topics" },
  { method: "delete", path: "/api/topics" },
  { method: "post", path: "/api/questions" },
  { method: "put", path: "/api/questions" },
  { method: "delete", path: "/api/questions" },
  { method: "post", path: "/api/courses" },
  { method: "delete", path: "/api/courses" },
];

function normalizeUrl(url = "") {
  if (!url) return "";

  try {
    if (url.startsWith("http")) {
      return new URL(url).pathname;
    }
  } catch (_error) {
    return url;
  }

  return url.split("?")[0];
}

function isAdminRoute(url = "", method = "get") {
  const path = normalizeUrl(url);
  const lowerMethod = String(method || "get").toLowerCase();

  const adminReadRoute = ADMIN_ROUTE_PATTERNS.some(
    (pattern) => path === pattern || path.startsWith(pattern + "/"),
  );

  if (adminReadRoute) return true;

  return ADMIN_MUTATION_ROUTES.some(
    (route) =>
      lowerMethod === route.method &&
      (path === route.path || path.startsWith(route.path + "/")),
  );
}

api.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    const method = config.method || "get";

    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isFormData && config.headers) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

    if (config._tokenType === "admin") {
      const token = localStorage.getItem("adminToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn(
          "Admin token missing for request:",
          method?.toUpperCase(),
          url,
        );
      }

      return config;
    }

    if (config._tokenType === "user") {
      const token = localStorage.getItem("userToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn(
          "User token missing for request:",
          method?.toUpperCase(),
          url,
        );
      }

      return config;
    }

    const token = isAdminRoute(url, method)
      ? localStorage.getItem("adminToken")
      : localStorage.getItem("userToken");

    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const method = error.config?.method || "get";
    const tokenType = error.config?._tokenType;

    console.error("API ERROR:", {
      method: method?.toUpperCase(),
      url,
      status,
      tokenType,
      data: error.response?.data,
      message: error.message,
    });

    if (status === 401 || status === 403) {
      const adminRequest = tokenType === "admin" || isAdminRoute(url, method);

      if (adminRequest) {
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

    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    const normalisedError = new Error(message);
    normalisedError.status = status;
    normalisedError.data = error.response?.data;
    normalisedError.originalError = error;

    return Promise.reject(normalisedError);
  },
);

export default api;
