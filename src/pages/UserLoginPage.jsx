import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

function UserLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setIsSubmitting(true);
      const response = await api.post("/api/users/login", { email, password });
      localStorage.setItem("userToken", response.data.token);
      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      navigate("/user-dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.message || "Login failed. Please check your email and password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
            from   { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-card { animation: fadeInUp 0.5s ease-out; }
        
        /* Input field styling for dark mode visibility */
        input[type="email"],
        input[type="password"] {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          border: 0.5px solid var(--border-color);
          caret-color: var(--button-primary);
        }
        
        input[type="email"]:focus,
        input[type="password"]:focus {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          border-color: var(--button-primary);
          box-shadow: 0 0 0 3px rgba(24, 95, 165, 0.08);
          outline: none;
        }
        
        input[type="email"]::placeholder,
        input[type="password"]::placeholder {
          color: var(--text-secondary);
          opacity: 0.7;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-primary)",
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
            background: "var(--bg-secondary)",
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
                color: "var(--text-secondary)",
                fontSize: "12px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Student Access
            </p>
            <h1
              style={{
                margin: "0 0 0.5rem",
                color: "var(--text-primary)",
                fontSize: "28px",
                fontWeight: "700",
                letterSpacing: "-0.02em",
              }}
            >
              Welcome back
            </h1>
            <p
              style={{
                margin: 0,
                color: "var(--text-secondary)",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              Log in to continue practicing and tracking your progress.
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
            {/* Email */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              >
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "8px",
                  border: "0.5px solid rgba(0,0,0,0.12)",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  background: "#fff",
                  color: "var(--text-primary)",
                  transition: "all 0.2s",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--button-primary)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(24, 95, 165, 0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <label
                  style={{
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                  }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--button-primary)",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: 0,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--button-primary-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--button-primary)";
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "8px",
                  border: "0.5px solid rgba(0,0,0,0.12)",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  background: "#fff",
                  color: "var(--text-primary)",
                  transition: "all 0.2s",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--button-primary)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(24, 95, 165, 0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
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
                backgroundColor: "var(--button-primary)",
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
                  e.currentTarget.style.backgroundColor =
                    "var(--button-primary-hover)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(24, 95, 165, 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--button-primary)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "1.5rem 0",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "0.5px",
                background: "var(--border-color)",
              }}
            />
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                fontWeight: "500",
              }}
            >
              New here?
            </span>
            <div
              style={{
                flex: 1,
                height: "0.5px",
                background: "var(--border-color)",
              }}
            />
          </div>

          {/* Sign up button */}
          <button
            type="button"
            onClick={() => navigate("/user-signup")}
            style={{
              width: "100%",
              padding: "11px 16px",
              border: "0.5px solid rgba(0,0,0,0.12)",
              borderRadius: "8px",
              backgroundColor: "#fff",
              color: "var(--button-primary)",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
              marginBottom: "1rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--surface-alt)";
              e.currentTarget.style.borderColor = "rgba(24, 95, 165, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.borderColor = "var(--border-color)";
            }}
          >
            Create new account
          </button>

          {/* Home button */}
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              width: "100%",
              padding: "10px 16px",
              border: "none",
              background: "none",
              color: "var(--text-secondary)",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            ← Back to home
          </button>
        </div>
      </div>
    </>
  );
}

export default UserLoginPage;
