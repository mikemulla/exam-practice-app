import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  if (!token) return <Navigate to="/admin-login" replace />;

  try {
    const decoded = jwtDecode(token);
    const expired = decoded.exp && decoded.exp * 1000 < Date.now();

    if (expired || decoded.role !== "admin") {
      localStorage.removeItem("adminToken");
      return <Navigate to="/admin-login" replace />;
    }

    return children;
  } catch (err) {
    console.error("JWT decode error:", err);
    localStorage.removeItem("adminToken");
    return <Navigate to="/admin-login" replace />;
  }
}
