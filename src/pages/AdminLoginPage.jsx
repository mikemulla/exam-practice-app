import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

function AdminLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setIsSubmitting(true);
      const response = await api.post("/api/auth/admin-login", { password });
      localStorage.setItem("adminToken", response.data.token);
      navigate("/admin");
    } catch (error) {
      console.error("Admin login error:", error);
      setError("Invalid admin password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
           from  { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-card { animation: fadeInUp 0.5s ease-out; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#f8f9fb",
          padding: "2rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle background accent */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(24, 95, 165, 0.04) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div
          className="auth-card"
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "#ffffff",
            border: "0.5px solid rgba(0,0,0,0.08)",
            borderRadius: "14px",
            padding: "2rem",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <p
              style={{
                margin: "0 0 0.75rem",
                color: "#94a3b8",
                fontSize: "12px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Admin Portal
            </p>
            <h1
              style={{
                margin: "0 0 0.5rem",
                color: "#0f172a",
                fontSize: "28px",
                fontWeight: "700",
                letterSpacing: "-0.02em",
              }}
            >
              Admin Login
            </h1>
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              Enter your admin password to manage the platform.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "8px",
                background: "#FEE2E2",
                border: "1px solid #FCA5A5",
                color: "#DC2626",
                fontSize: "13px",
                marginBottom: "1.5rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#0f172a",
                  fontSize: "14px",
                }}
              >
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "8px",
                  border: "0.5px solid rgba(0,0,0,0.12)",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  background: "#fff",
                  color: "#0f172a",
                  transition: "all 0.2s",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(24, 95, 165, 0.3)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(24, 95, 165, 0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "11px 16px",
                border: "none",
                borderRadius: "8px",
                backgroundColor: "#185FA5",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
                transition: "all 0.2s",
                marginBottom: "1rem",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = "#0e3d6e";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(24, 95, 165, 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#185FA5";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            {/* Back button */}
            <button
              type="button"
              onClick={() => navigate("/")}
              style={{
                width: "100%",
                padding: "11px 16px",
                border: "0.5px solid rgba(0,0,0,0.12)",
                borderRadius: "8px",
                backgroundColor: "#fff",
                color: "#334155",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f1f5f9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#fff";
              }}
            >
              ← Back to home
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AdminLoginPage;
