import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post(`/api/users/reset-password/${token}`, { password });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
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
        <h1 style={titleStyle}>Reset Password</h1>

        {success ? (
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
                  Password updated!
                </p>
                <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
                  Your password has been reset successfully. You can now log in
                  with your new password.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/user-login")}
              style={primaryButton}
            >
              Go to Login
            </button>
          </>
        ) : (
          <>
            <p style={subtitleStyle}>Enter your new password below.</p>

            {error && <div style={errorBox}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <label style={labelStyle}>New Password</label>
              <div style={{ position: "relative", marginBottom: "16px" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    ...inputStyle,
                    marginBottom: 0,
                    paddingRight: "48px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={eyeBtn}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <label style={labelStyle}>Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Repeat your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={inputStyle}
              />

              {/* Strength indicator */}
              {password.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={strengthBarBg}>
                    <div
                      style={{
                        ...strengthBarFill,
                        width: strengthWidth(password),
                        background: strengthColor(password),
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: strengthColor(password),
                      margin: "4px 0 0",
                    }}
                  >
                    {strengthLabel(password)}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  ...primaryButton,
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
              >
                {isSubmitting ? "Resetting…" : "Reset Password"}
              </button>
            </form>

            <button
              onClick={() => navigate("/forgot-password")}
              style={plainButton}
            >
              ← Request a new link
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* Password strength helpers */
function strengthScore(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

function strengthWidth(pw) {
  const score = strengthScore(pw);
  return `${(score / 5) * 100}%`;
}

function strengthColor(pw) {
  const score = strengthScore(pw);
  if (score <= 1) return "#dc2626";
  if (score <= 2) return "#f97316";
  if (score <= 3) return "#eab308";
  return "#16a34a";
}

function strengthLabel(pw) {
  const score = strengthScore(pw);
  if (score <= 1) return "Weak";
  if (score <= 2) return "Fair";
  if (score <= 3) return "Good";
  return "Strong";
}

/* Styles */
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

const eyeBtn = {
  position: "absolute",
  right: "14px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  color: "#64748b",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600",
  padding: "4px",
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

const strengthBarBg = {
  height: "4px",
  background: "#e2e8f0",
  borderRadius: "999px",
  overflow: "hidden",
};

const strengthBarFill = {
  height: "100%",
  borderRadius: "999px",
  transition: "width 0.3s ease, background 0.3s ease",
};

export default ResetPasswordPage;
