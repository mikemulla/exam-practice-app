import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedUserRoute({ children }) {
  const token = localStorage.getItem("userToken");
  if (!token) return <Navigate to="/user-login" replace />;

  try {
    const decoded = jwtDecode(token);
    const expired = decoded.exp && decoded.exp * 1000 < Date.now();

    if (expired || !decoded.userId || decoded.role !== "user") {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userInfo");
      return <Navigate to="/user-login" replace />;
    }

    return children;
  } catch (err) {
    console.error("JWT decode error:", err);
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    return <Navigate to="/user-login" replace />;
  }
}
