import { useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../lib/api";

function AdminLoginPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const response = await api.post("/api/auth/admin-login", {
        password,
      });

      localStorage.setItem("adminToken", response.data.token);

      alert("Login successful");

      navigate("/admin");
    } catch (error) {
      console.error("Admin login error:", error);

      alert("Invalid admin password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",

        background:
          "linear-gradient(135deg, #f8fbff 0%, #eef4ff 50%, #f7f9fc 100%)",

        padding: "32px 20px",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <div
          style={{
            backgroundColor: "white",

            border: "1px solid #e2e8f0",

            borderRadius: "20px",

            padding: "28px",

            boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
          }}
        >
          <p
            style={{
              margin: 0,

              color: "#64748b",

              fontSize: "14px",

              fontWeight: "600",
            }}
          >
            Admin access
          </p>

          <h1
            style={{
              margin: "10px 0 8px",

              color: "#0f172a",

              fontSize: "32px",
            }}
          >
            Admin Login
          </h1>

          <p
            style={{
              margin: "0 0 24px",

              color: "#64748b",

              lineHeight: "1.6",
            }}
          >
            Enter the admin password to manage subjects, topics, and questions.
          </p>

          <form onSubmit={handleLogin}>
            <label
              style={{
                display: "block",

                marginBottom: "8px",

                fontWeight: "600",

                color: "#0f172a",
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

                padding: "14px 16px",

                borderRadius: "10px",

                border: "1px solid #cbd5e1",

                fontSize: "15px",

                boxSizing: "border-box",

                marginBottom: "18px",
              }}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",

                padding: "14px 20px",

                border: "none",

                borderRadius: "10px",

                backgroundColor: "#185FA5",

                color: "white",

                fontSize: "15px",

                fontWeight: "700",

                cursor: isSubmitting ? "not-allowed" : "pointer",

                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              style={{
                width: "100%",

                marginTop: "12px",

                padding: "14px 20px",

                border: "1px solid #cbd5e1",

                borderRadius: "10px",

                backgroundColor: "white",

                color: "#0f172a",

                fontSize: "15px",

                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Back Home
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
