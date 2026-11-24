import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import StudentHeader from "../components/StudentHeader";
import "../styles/dashboard.css";
import "../styles/student.css";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/png",
];

const fmtSize = (bytes) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

export default function SubjectRequestPage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [timer, setTimer] = useState(10);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorText, setErrorText] = useState("");

  const pickFile = (f) => {
    if (!f) return;
    if (f.size > MAX_FILE_SIZE) {
      setFile(null);
      setFileError("That file is too large. The limit is 15 MB.");
    } else if (!ALLOWED_TYPES.includes(f.type)) {
      setFile(null);
      setFileError("Please upload a PDF, Word document, text file, JPG or PNG.");
    } else {
      setFile(f);
      setFileError("");
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      setFileError("Please add a reference file, such as your lecture notes.");
      return;
    }
    const form = new FormData();
    form.append("subject", subject.trim());
    form.append("topic", topic.trim());
    form.append("timer", timer);
    form.append("file", file);
    setStatus("sending");
    setErrorText("");
    try {
      await api.post("/api/requests/subject-request", form, { _tokenType: "user" });
      setStatus("sent");
      setSubject("");
      setTopic("");
      setTimer(10);
      setFile(null);
    } catch (err) {
      console.error("Error sending request:", err);
      setErrorText((err?.data?.message ?? err?.response?.data?.message) || "We couldn't send your request. Check your connection and try again.");
      setStatus("error");
    }
  };

  return (
    <div className="db">
      <StudentHeader />
      <main className="st-main" style={{ maxWidth: 720 }}>
        <div>
          <h1 className="st-h1">Request a subject</h1>
          <p className="st-sub">Can't find a subject or topic you need? Send us your lecture material and we'll turn it into practice questions.</p>
        </div>

        {status === "sent" && (
          <div className="rs-perfect" role="status" style={{ background: "#f0fdf4", borderColor: "#86efac", color: "#14532d" }}>
            <span aria-hidden="true" style={{ fontSize: 20 }}>✓</span>
            <span>Request sent. Thank you! We'll let you know when it's ready.</span>
          </div>
        )}
        {status === "error" && <div className="rs-banner" role="alert">{errorText}</div>}

        <form className="st-panel" onSubmit={submit} style={{ gap: 18 }}>
          <div className="rq-row">
            <label className="rq-field">
              <span>Subject <small>Required</small></span>
              <input type="text" required value={subject} placeholder="e.g. Anatomy" onChange={(e) => setSubject(e.target.value)} />
            </label>
            <label className="rq-field">
              <span>Topic <small>Required</small></span>
              <input type="text" required value={topic} placeholder="e.g. Upper limb" onChange={(e) => setTopic(e.target.value)} />
            </label>
          </div>
          <label className="rq-field" style={{ maxWidth: 220 }}>
            <span>Timer <small>Minutes for the test</small></span>
            <input type="number" min="1" max="300" required value={timer} onChange={(e) => setTimer(e.target.value)} />
          </label>

          <div className="rq-field">
            <span>Reference file <small>PDF, Word, text, JPG or PNG · up to 15 MB</small></span>
            <div
              className={`rq-drop${dragOver ? " over" : ""}${fileError ? " bad" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                pickFile(e.dataTransfer.files[0]);
              }}
            >
              {file ? (
                <div className="rq-file">
                  <span aria-hidden="true">📄</span>
                  <div><strong>{file.name}</strong><small>{fmtSize(file.size)}</small></div>
                  <button type="button" className="st-btn st-btn-text" onClick={() => setFile(null)}>Remove</button>
                </div>
              ) : (
                <>
                  <p>Drag a file here, or</p>
                  <button type="button" className="st-btn st-btn-outline" onClick={() => inputRef.current?.click()}>Choose a file</button>
                </>
              )}
              <input ref={inputRef} type="file" hidden accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" onChange={(e) => pickFile(e.target.files[0])} />
            </div>
            {fileError && <small className="rq-error" role="alert">{fileError}</small>}
          </div>

          <div className="st-actions" style={{ justifyContent: "flex-start" }}>
            <button type="submit" className="st-btn" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send request"}</button>
            <button type="button" className="st-btn st-btn-outline" onClick={() => navigate("/user")}>Back to subjects</button>
          </div>
        </form>
      </main>
    </div>
  );
}
