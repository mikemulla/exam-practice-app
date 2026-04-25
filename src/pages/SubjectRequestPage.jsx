import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M9 3L5 7l4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M11 14V4M7 8l4-4 4 4"
        stroke="#185FA5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 17h14"
        stroke="#185FA5"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={S.field}>
      <div style={S.labelRow}>
        <label style={S.label}>{label}</label>
        {hint && <span style={S.hint}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SubjectRequestPage() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [timer, setTimer] = useState(10);
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fileError, setFileError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("topic", topic);
    formData.append("timer", timer);
    if (file) formData.append("file", file);

    try {
      setIsSubmitting(true);
      await api.post("/api/requests/subject-request", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      setTimeout(() => {
        setSubject("");
        setTopic("");
        setTimer(10);
        setFile(null);
        setSuccess(false);
      }, 2200);
    } catch (error) {
      console.error("Error sending request:", error);
      alert("Failed to send request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateAndSetFile = (selected, inputRef) => {
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) {
      setFileError("File is too large. Maximum file size is 5 MB.");
      if (inputRef) inputRef.value = "";
      setFile(null);
      return;
    }
    setFileError("");
    setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    validateAndSetFile(dropped, null);
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes successPop {
          0%   { transform: scale(0.92); opacity: 0; }
          60%  { transform: scale(1.03); }
          100% { transform: scale(1); opacity: 1; }
        }
        .page-enter { animation: fadeUp 0.35s ease both; }
        .card-enter { animation: fadeUp 0.4s ease 0.05s both; }
        .success-banner { animation: successPop 0.35s ease both; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { opacity: 1; }
        input:focus, textarea:focus { outline: none; }
      `}</style>

      <div style={S.page}>
        <div style={S.inner}>
          {/* breadcrumb + back */}
          <div className="page-enter" style={S.topBar}>
            <button onClick={() => navigate("/user")} style={S.backBtn}>
              <ChevronLeft />
              Back
            </button>
            <span style={S.breadcrumb}>Dashboard / Subject request</span>
          </div>

          {/* heading */}
          <div
            className="page-enter"
            style={{ ...S.pageHeader, animationDelay: "0.04s" }}
          >
            <h1 style={S.heading}>Request a Subject</h1>
            <p style={S.subheading}>
              Tell the admin the subject, topic, and preferred test timer.
              Attach a file if you have reference material.
            </p>
          </div>

          {/* success banner */}
          {success && (
            <div className="success-banner" style={S.successBanner}>
              <span style={{ fontSize: "16px" }}>✓</span>
              Request sent successfully!
            </div>
          )}

          {/* file error banner */}
          {fileError && (
            <div style={S.errorBanner}>
              <span style={{ fontSize: "15px" }}>⚠</span>
              {fileError}
            </div>
          )}

          {/* card */}
          <div className="card-enter" style={S.card}>
            <form onSubmit={handleSubmit}>
              <div style={S.twoCol}>
                <Field label="Subject" hint="Required">
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Anatomy"
                    required
                    style={S.input}
                    onFocus={(e) => Object.assign(e.target.style, S.inputFocus)}
                    onBlur={(e) =>
                      Object.assign(e.target.style, {
                        borderColor: "rgba(0,0,0,0.12)",
                        boxShadow: "none",
                      })
                    }
                  />
                </Field>

                <Field label="Topic" hint="Required">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Upper limb"
                    required
                    style={S.input}
                    onFocus={(e) => Object.assign(e.target.style, S.inputFocus)}
                    onBlur={(e) =>
                      Object.assign(e.target.style, {
                        borderColor: "rgba(0,0,0,0.12)",
                        boxShadow: "none",
                      })
                    }
                  />
                </Field>
              </div>

              <Field label="Timer" hint="In minutes">
                <input
                  type="number"
                  value={timer}
                  onChange={(e) => setTimer(e.target.value)}
                  min="1"
                  required
                  style={{ ...S.input, maxWidth: "160px" }}
                  onFocus={(e) => Object.assign(e.target.style, S.inputFocus)}
                  onBlur={(e) =>
                    Object.assign(e.target.style, {
                      borderColor: "rgba(0,0,0,0.12)",
                      boxShadow: "none",
                    })
                  }
                />
              </Field>

              {/* file drop zone */}
              <Field label="Reference file" hint="Optional">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-input").click()}
                  style={{
                    ...S.dropZone,
                    borderColor: dragOver
                      ? "#185FA5"
                      : file
                        ? "#185FA5"
                        : "rgba(0,0,0,0.12)",
                    background: dragOver
                      ? "#E6F1FB"
                      : file
                        ? "#f0f7ff"
                        : "#fafafa",
                  }}
                >
                  <input
                    id="file-input"
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const selected = e.target.files[0];
                      validateAndSetFile(selected, e.target);
                    }}
                  />
                  <UploadIcon />
                  {file ? (
                    <div style={{ textAlign: "center" }}>
                      <p style={S.fileName}>{file.name}</p>
                      <p style={S.fileHint}>Click to replace</p>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <p style={S.dropLabel}>
                        Drag & drop or{" "}
                        <span style={{ color: "#185FA5", fontWeight: "600" }}>
                          browse
                        </span>
                      </p>
                      <p style={S.fileHint}>PDF, DOCX, images · max 5 MB</p>
                    </div>
                  )}
                </div>
              </Field>

              <div style={S.divider} />

              {/* actions */}
              <div style={S.actions}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    ...S.submitBtn,
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  {isSubmitting ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={S.spinner} /> Sending…
                    </span>
                  ) : (
                    "Send Request"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/user")}
                  style={S.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default SubjectRequestPage;

/* ─── styles ─── */
const S = {
  page: {
    minHeight: "100vh",
    background: "#f8f9fb",
    padding: "2rem 1.25rem 4rem",
  },
  inner: {
    maxWidth: "680px",
    margin: "0 auto",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.75rem",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "7px 12px",
    border: "0.5px solid rgba(0,0,0,0.12)",
    borderRadius: "8px",
    background: "#fff",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
  breadcrumb: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },
  pageHeader: {
    marginBottom: "1.5rem",
  },
  heading: {
    fontSize: "clamp(22px, 3.5vw, 28px)",
    fontWeight: "600",
    color: "#0f172a",
    margin: "0 0 0.5rem",
    letterSpacing: "-0.02em",
  },
  subheading: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.65",
    margin: 0,
    maxWidth: "500px",
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderRadius: "10px",
    background: "#fef2f2",
    border: "0.5px solid #fca5a5",
    color: "#b91c1c",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "1rem",
  },
  successBanner: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderRadius: "10px",
    background: "#f0fdf4",
    border: "0.5px solid #86efac",
    color: "#15803d",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "1rem",
  },
  card: {
    background: "#fff",
    border: "0.5px solid rgba(0,0,0,0.08)",
    borderRadius: "16px",
    padding: "2rem",
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "0 1.25rem",
  },
  field: {
    marginBottom: "1.25rem",
  },
  labelRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
    marginBottom: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#0f172a",
  },
  hint: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    padding: "10px 13px",
    borderRadius: "8px",
    border: "0.5px solid rgba(0,0,0,0.12)",
    fontSize: "14px",
    boxSizing: "border-box",
    color: "#0f172a",
    background: "#fafafa",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  inputFocus: {
    borderColor: "#185FA5",
    boxShadow: "0 0 0 3px rgba(24,95,165,0.10)",
    background: "#fff",
  },
  dropZone: {
    border: "1.5px dashed",
    borderRadius: "10px",
    padding: "2rem 1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    transition: "border-color 0.15s, background 0.15s",
  },
  dropLabel: {
    fontSize: "13px",
    color: "#475569",
    margin: "0 0 2px",
  },
  fileName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#185FA5",
    margin: "0 0 2px",
    wordBreak: "break-all",
  },
  fileHint: {
    fontSize: "11px",
    color: "#94a3b8",
    margin: 0,
  },
  divider: {
    height: "0.5px",
    background: "rgba(0,0,0,0.07)",
    margin: "0.5rem 0 1.5rem",
  },
  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  submitBtn: {
    padding: "10px 22px",
    border: "none",
    borderRadius: "8px",
    background: "#185FA5",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    letterSpacing: "-0.01em",
  },
  cancelBtn: {
    padding: "10px 18px",
    border: "0.5px solid rgba(0,0,0,0.15)",
    borderRadius: "8px",
    background: "#fff",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
  spinner: {
    display: "inline-block",
    width: "12px",
    height: "12px",
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};
