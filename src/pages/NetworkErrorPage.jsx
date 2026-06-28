import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import S from "./errorStyles";
import { animationCss } from "./errorAnimations";

function NetworkErrorPage() {
  const navigate = useNavigate();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <>
      <style>{animationCss}</style>
      <div style={S.page}>
        <div style={S.card}>
          <div style={{ ...S.icon, animation: "signal 2s ease-in-out infinite" }}>📡</div>
          <p style={S.eyebrow}>{online ? "Connection restored" : "Network error"}</p>
          <h1 style={S.code}>{online ? "Online" : "Offline"}</h1>
          <h2 style={S.title}>
            {online ? "Your internet connection appears to be back." : "Your connection seems unstable."}
          </h2>
          <p style={S.body}>
            {online
              ? "You can return to the dashboard and continue practising."
              : "Please check your internet connection. If you were taking a test, avoid refreshing until your connection is stable."}
          </p>

          <div style={local.statusPill}>
            <span style={{ ...local.statusDot, background: online ? "#22c55e" : "#ef4444" }} />
            {online ? "Connected" : "Disconnected"}
          </div>

          <div style={S.actions}>
            <button style={S.primaryButton} onClick={() => window.location.reload()}>
              Reload Page
            </button>
            <button style={S.secondaryButton} onClick={() => navigate("/user-dashboard")}>
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const local = {
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "var(--surface-alt)",
    border: "1px solid var(--border-color)",
    borderRadius: "999px",
    padding: "8px 12px",
    color: "var(--text-primary)",
    fontSize: "13px",
    fontWeight: 800,
    marginBottom: "18px",
  },
  statusDot: { width: "10px", height: "10px", borderRadius: "50%" },
};

export default NetworkErrorPage;
