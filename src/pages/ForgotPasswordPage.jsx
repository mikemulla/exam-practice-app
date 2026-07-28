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
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes driftA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(26px, -20px) scale(1.05); }
        }
        @keyframes driftB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-18px, 16px) scale(1.04); }
        }
        .blob-a {
          position  : absolute; top: -130px; right: -160px;
          width     : 380px; height: 380px;
          background: 
            radial-gradient(circle at 27% 24%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 24%),
            radial-gradient(circle at 62% 70%, #7dd8ff 0%, #33b5f0 32%, #1a7fd4 58%, #0f5aa6 80%, #0a3f7a 100%);
          border-radius: 58% 42% 65% 35% / 45% 55% 45% 55%;
          filter       : blur(1px);
          box-shadow   : 0 60px 110px -25px rgba(15, 90, 166, 0.4);
          animation    : driftA 18s ease-in-out infinite;
        }
        .blob-b {
          position  : absolute; bottom: -60px; left: -70px;
          width     : 200px; height   : 200px;
          background: 
            radial-gradient(circle at 30% 26%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 26%),
            radial-gradient(circle at 62% 68%, #66cdf4 0%, #1f8fdc 45%, #0e5a9e 100%);
          border-radius: 50%;
          filter       : blur(0.5px);
          box-shadow   : 0 22px 42px -12px rgba(15, 90, 166, 0.4);
          animation    : driftB 13s ease-in-out infinite;
        }
      `}</style>
      <div style={pageStyle}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <div className="blob-a" />
          <div className="blob-b" />
        </div>
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
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                    }}
                  >
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

              <button
                onClick={() => navigate("/user-login")}
                style={plainButton}
              >
                ← Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  background: "var(--bg-primary)",
  position: "relative",
  overflow: "hidden",
};

const cardStyle = {
  width: "100%",
  maxWidth: "440px",
  background: "var(--bg-secondary)",
  border: "1px solid var(--border-color)",
  borderRadius: "20px",
  padding: "28px",
  boxShadow: "var(--card-shadow)",
  position: "relative",
  zIndex: 1,
};

const labelTop = {
  margin: 0,
  color: "var(--text-secondary)",
  fontSize: "14px",
  fontWeight: "700",
};

const titleStyle = {
  margin: "10px 0 8px",
  color: "var(--text-primary)",
  fontSize: "32px",
};

const subtitleStyle = {
  margin: "0 0 22px",
  color: "var(--text-secondary)",
  lineHeight: "1.6",
  fontSize: "14px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
  color: "var(--text-primary)",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  marginBottom: "16px",
  borderRadius: "10px",
  border: "1px solid var(--border-strong)",
  boxSizing: "border-box",
  fontSize: "15px",
  outline: "none",
  background: "var(--input-bg)",
  color: "var(--text-primary)",
};

const primaryButton = {
  width: "100%",
  padding: "14px",
  border: "none",
  borderRadius: "10px",
  backgroundColor: "var(--button-primary)",
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
  color: "var(--text-secondary)",
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
