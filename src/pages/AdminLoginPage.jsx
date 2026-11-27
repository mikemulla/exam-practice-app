import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import "../styles/admin.css";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Sign in · Bambo admin";
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!password) return setError("Enter the admin password.");
    setError("");
    setBusy(true);
    try {
      const res = await api.post("/api/auth/admin-login", { password });
      localStorage.setItem("adminToken", res.data.token);
      navigate("/admin");
    } catch (err) {
      setError(
        err?.status === 429
          ? "Too many tries. Wait 15 minutes, then try again."
          : err?.status === 401 || err?.status === 400
            ? "That password isn't right."
            : "Couldn't reach the server. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-login">
      <section className="adm-login-art">
        <svg className="spiral" aria-hidden="true" viewBox="0 0 400 400">
          <path d="M200 190a10 10 0 1 1-1 0M200 160a40 40 0 1 1-1 0M200 120a80 80 0 1 1-1 0M200 70a130 130 0 1 1-1 0M200 10a190 190 0 1 1-1 0" fill="none" stroke="#93c5fd" strokeWidth="3" />
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: "#185fa5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22 }}>B</span>
          <span style={{ fontSize: 20, fontWeight: 700 }}>Bambo Admin</span>
        </div>
        <div>
          <h1>See how your students are doing, live.</h1>
          <p>Analytics, who's online, questions, quick reviews, reports and emails, all in one place.</p>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "#93c5fd" }}>For Bambo staff only</p>
      </section>
      <section className="adm-login-form-wrap">
        <form className="adm-login-form" onSubmit={submit} noValidate>
          <div>
            <h2>Sign in</h2>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#5b6577" }}>Enter the admin password</p>
          </div>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "#334155" }}>
            Password
            <span className="adm-pass">
              <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" autoFocus aria-invalid={Boolean(error)} aria-describedby={error ? "login-error" : undefined} />
              <button type="button" onClick={() => setShow((v) => !v)} aria-pressed={show}>{show ? "Hide" : "Show"}</button>
            </span>
          </label>
          {error && <p id="login-error" role="alert" style={{ margin: 0, fontSize: 13, color: "#b91c1c", background: "#fef2f2", borderRadius: 10, padding: "10px 12px" }}>{error}</p>}
          <button type="submit" disabled={busy} style={{ minHeight: 48, border: 0, borderRadius: 12, background: "#185fa5", color: "#fff", fontWeight: 700, fontSize: 15, cursor: busy ? "wait" : "pointer" }}>{busy ? "Signing in…" : "Sign in"}</button>
          <Link to="/" style={{ fontSize: 13, textAlign: "center", color: "#185fa5" }}>Back to the student site</Link>
        </form>
      </section>
    </div>
  );
}
