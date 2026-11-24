import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import "../styles/dashboard.css";
import "../styles/student.css";

// Opened from the "Turn off weekly emails" link. No login needed: the link itself is signed.
export default function EmailPreferencesPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [state, setState] = useState(token ? "working" : "error");
  const [subscribed, setSubscribed] = useState(false);
  const [message, setMessage] = useState(token ? "" : "This link is missing its code. Open it again from the email.");
  const started = useRef(false);

  const update = async (resubscribe) => {
    setState("working");
    try {
      const res = await api.post("/api/digest/unsubscribe", { token, resubscribe });
      setSubscribed(Boolean(res.data?.weeklyDigest));
      setState("done");
    } catch (err) {
      setMessage(err?.message || "This link is invalid or has expired.");
      setState("error");
    }
  };

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    api
      .post("/api/digest/unsubscribe", { token, resubscribe: false })
      .then((res) => {
        setSubscribed(Boolean(res.data?.weeklyDigest));
        setState("done");
      })
      .catch((err) => {
        setMessage(err?.message || "This link is invalid or has expired.");
        setState("error");
      });
  }, [token]);

  return (
    <div className="db" style={{ display: "grid", placeItems: "center", padding: 20 }}>
      <main className="st-panel" style={{ maxWidth: 460, width: "100%", textAlign: "center", gap: 14, padding: 28 }}>
        <div className="db-brand" style={{ margin: "0 auto", width: 52, height: 52, fontSize: 24 }} aria-hidden="true">B</div>
        {state === "working" && <p className="st-muted">One moment…</p>}
        {state === "done" && !subscribed && (
          <>
            <h1 style={{ margin: 0, fontSize: 22 }}>You won't get weekly emails</h1>
            <p className="st-sub">We've turned off your weekly progress email. Your account and progress aren't affected.</p>
            <button type="button" className="st-btn st-btn-outline" onClick={() => update(true)}>Turn them back on</button>
          </>
        )}
        {state === "done" && subscribed && (
          <>
            <h1 style={{ margin: 0, fontSize: 22 }}>Weekly emails are on</h1>
            <p className="st-sub">You'll get a short progress update on Sunday evenings.</p>
            <button type="button" className="st-btn st-btn-outline" onClick={() => update(false)}>Turn them off</button>
          </>
        )}
        {state === "error" && (
          <>
            <h1 style={{ margin: 0, fontSize: 22 }}>That link didn't work</h1>
            <p className="st-sub">{message} You can also switch weekly emails off from the account menu after logging in.</p>
          </>
        )}
        <Link to="/user-login" className="st-btn st-btn-text" style={{ alignSelf: "center" }}>Go to Bambo</Link>
      </main>
    </div>
  );
}
