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
        err.message || "Login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <p style={labelTop}>Student access</p>
        <h1 style={titleStyle}>Login</h1>
        <p style={subtitleStyle}>Log in to continue practicing.</p>

        {error && <div style={errorBox}>{error}</div>}

        <form onSubmit={handleLogin}>
          <label style={labelStyle}>Email address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              style={forgotLink}
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
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...primaryButton,
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <button
          onClick={() => navigate("/user-signup")}
          style={secondaryButton}
        >
          Create new account
        </button>

        <button onClick={() => navigate("/")} style={plainButton}>
          Back Home
        </button>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  background: "linear-gradient(135deg, #f8fbff 0%, #eef4ff 50%, #f7f9fc 100%)",
};

const cardStyle = {
  width: "100%",
  maxWidth: "440px",
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "20px",
  padding: "28px",
  boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
};

const labelTop = {
  margin: 0,
  color: "#64748b",
  fontSize: "14px",
  fontWeight: "700",
};

const titleStyle = {
  margin: "10px 0 8px",
  color: "#0f172a",
  fontSize: "32px",
};

const subtitleStyle = {
  margin: "0 0 22px",
  color: "#64748b",
  lineHeight: "1.6",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
  color: "#0f172a",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  marginBottom: "14px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
  fontSize: "15px",
  outline: "none",
};

const primaryButton = {
  width: "100%",
  padding: "14px",
  border: "none",
  borderRadius: "10px",
  backgroundColor: "#185FA5",
  color: "white",
  fontWeight: "700",
  fontSize: "15px",
  cursor: "pointer",
};

const secondaryButton = {
  width: "100%",
  marginTop: "12px",
  padding: "14px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  backgroundColor: "white",
  fontWeight: "600",
  cursor: "pointer",
};

const plainButton = {
  width: "100%",
  marginTop: "10px",
  padding: "10px",
  border: "none",
  backgroundColor: "transparent",
  color: "#64748b",
  cursor: "pointer",
};

const forgotLink = {
  background: "none",
  border: "none",
  color: "#185FA5",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  padding: 0,
};

const errorBox = {
  padding: "12px 16px",
  borderRadius: "10px",
  background: "#fef2f2",
  border: "1px solid #fca5a5",
  color: "#b91c1c",
  fontSize: "14px",
  marginBottom: "16px",
};

export default UserLoginPage;
