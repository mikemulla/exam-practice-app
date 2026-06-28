import { useNavigate } from "react-router-dom";
import S from "./errorStyles";
import { animationCss } from "./errorAnimations";

function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <>
      <style>{animationCss}</style>
      <div style={S.page}>
        <div style={S.card}>
          <div style={S.icon}>🔒</div>
          <p style={S.eyebrow}>Access restricted</p>
          <h1 style={S.code}>403</h1>
          <h2 style={S.title}>You do not have permission to view this page.</h2>
          <p style={S.body}>
            This area is protected. Return to your dashboard or log in with an
            account that has permission.
          </p>

          <div style={S.actions}>
            <button style={S.primaryButton} onClick={() => navigate("/user-dashboard")}>
              User Dashboard
            </button>
            <button style={S.secondaryButton} onClick={() => navigate("/admin-login")}>
              Admin Login
            </button>
            <button style={S.secondaryButton} onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccessDeniedPage;
