import { useState } from "react";
import { useNavigate } from "react-router-dom";
import S from "./errorStyles";
import { animationCss } from "./errorAnimations";

function ServerErrorPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");

  const retry = () => {
    setChecking(true);
    setMessage("");

    setTimeout(() => {
      setChecking(false);
      setMessage("If this keeps happening, wait a few minutes and try again.");
    }, 900);
  };

  return (
    <>
      <style>{animationCss}</style>
      <div style={S.page}>
        <div style={S.card}>
          <div style={{ ...S.icon, animation: "spinSoft 4s linear infinite" }}>⚙️</div>
          <p style={S.eyebrow}>Server error</p>
          <h1 style={S.code}>500</h1>
          <h2 style={S.title}>Something went wrong on our side.</h2>
          <p style={S.body}>
            The request could not be completed right now. You can retry or return
            to the dashboard.
          </p>

          {message && (
            <p style={{ color: "var(--text-secondary)", fontWeight: 700, fontSize: 13 }}>
              {message}
            </p>
          )}

          <div style={S.actions}>
            <button style={S.primaryButton} onClick={retry} disabled={checking}>
              {checking ? "Checking..." : "Try Again"}
            </button>
            <button style={S.secondaryButton} onClick={() => navigate("/user-dashboard")}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ServerErrorPage;
