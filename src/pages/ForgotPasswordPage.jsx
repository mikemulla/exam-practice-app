import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setIsSubmitting(true);
      await api.post("/api/users/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <p style={labelTop}>Account recovery</p>
        <h1 style={titleStyle}>Forgot Password</h1>

        {sent ? (
          <>
            <div style={successBox}>
              <span style={{ fontSize: "20px" }}>✓</span>
              <div>
                <p
                  style={{
                    margin: "0 0 4px",
                    fontWeight: "600",
                    color: "#15803d",
                  }}
                >
                  Check your email
                </p>
                <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
                  If <strong>{email}</strong> is registered, you'll receive a
                  reset link shortly. Check your spam folder too.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/user-login")}
              style={{ ...primaryButton, marginTop: "8px" }}
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <p style={subtitleStyle}>
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            {error && <div style={errorBox}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <label style={labelStyle}>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                {isSubmitting ? "Sending…" : "Send Reset Link"}
              </button>
            </form>

            <button onClick={() => navigate("/user-login")} style={plainButton}>
              ← Back to Login
            </button>
          </>
        )}
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
  fontSize: "14px",
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
  marginBottom: "16px",
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

const plainButton = {
  width: "100%",
  marginTop: "12px",
  padding: "10px",
  border: "none",
  backgroundColor: "transparent",
  color: "#64748b",
  cursor: "pointer",
  fontSize: "14px",
};

const successBox = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  padding: "16px",
  borderRadius: "10px",
  background: "#f0fdf4",
  border: "1px solid #86efac",
  color: "#15803d",
  marginBottom: "20px",
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

export default ForgotPasswordPage;
