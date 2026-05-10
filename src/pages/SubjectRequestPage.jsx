import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const MAX_FILE_SIZE = 15 * 1024 * 1024;

const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/png",
];

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
        stroke="var(--button-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 17h14"
        stroke="var(--button-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path
        d="M1.5 6.5L6.5 2l5 4.5V11.5a.5.5 0 01-.5.5H8.5v-3h-3v3H2a.5.5 0 01-.5-.5V6.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
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

  const validateAndSetFile = (selectedFile, inputElement = null) => {
    if (!selectedFile) {
      setFileError("Please upload a reference file before submitting.");
      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError("File is too large. Maximum allowed size is 15MB.");
      setFile(null);
      if (inputElement) inputElement.value = "";
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setFileError(
        "Unsupported file type. Please upload PDF, DOC, DOCX, TXT, JPG, or PNG.",
      );
      setFile(null);
      if (inputElement) inputElement.value = "";
      return;
    }

    setFileError("");
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (fileError) {
      alert("Please fix the file upload issue before submitting.");
      return;
    }

    if (!file) {
      setFileError("Please upload a reference file before submitting.");
      alert("Please upload a reference file before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("subject", subject.trim());
    formData.append("topic", topic.trim());
    formData.append("timer", timer);
    if (file) formData.append("file", file);

    try {
      setIsSubmitting(true);
      await api.post("/api/requests/subject-request", formData, {
        _tokenType: "user",
      });

      setSuccess(true);
      setTimeout(() => {
        setSubject("");
        setTopic("");
        setTimer(10);
        setFile(null);
        setFileError("");
        setSuccess(false);
      }, 2200);
    } catch (error) {
      console.error("Error sending request:", error);
      alert(error.message || "Failed to send request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes successPop {
          0% { transform: scale(0.92); opacity: 0; }
          60% { transform: scale(1.03); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .page-enter { animation: fadeUp 0.35s ease both; }
        .card-enter { animation: fadeUp 0.4s ease 0.05s both; }
        .success-banner { animation: successPop 0.35s ease both; }
        input:focus { outline: none; }
        @media (max-width: 640px) {
          .subject-request-card { padding: 1.25rem !important; }
          .subject-request-actions { flex-direction: column !important; }
          .subject-request-actions button { width: 100% !important; }
        }
      `}</style>

      <div style={S.page}>
        <div style={S.inner}>
          <div className="page-enter" style={S.topBar}>
            <button onClick={() => navigate("/user")} style={S.backBtn}>
              <ChevronLeft />
              Back
            </button>
            <span style={S.breadcrumb}>Dashboard / Subject request</span>
          </div>

          <div className="page-enter" style={S.pageHeader}>
            <h1 style={S.heading}>Request a Subject</h1>
            <p style={S.subheading}>
              Tell the admin the subject, topic, and preferred test timer.
              Attach a reference file if you have one.
            </p>
          </div>

          {success && (
            <div className="success-banner" style={S.successBanner}>
              <span style={{ fontSize: "16px" }}>✓</span>
              Request sent successfully.
            </div>
          )}

          {fileError && (
            <div style={S.errorBanner}>
              <span style={{ fontSize: "15px" }}>⚠</span>
              {fileError}
            </div>
          )}

          <div className="card-enter subject-request-card" style={S.card}>
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
                        borderColor: "var(--border-color)",
                        boxShadow: "none",
                        background: "var(--input-bg)",
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
                        borderColor: "var(--border-color)",
                        boxShadow: "none",
                        background: "var(--input-bg)",
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
                      borderColor: "var(--border-color)",
                      boxShadow: "none",
                      background: "var(--input-bg)",
                    })
                  }
                />
              </Field>

              <Field label="Reference file" hint="Required">
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
                      ? "var(--button-primary)"
                      : file
                        ? "var(--button-primary)"
                        : "var(--border-color)",
                    background: dragOver
                      ? "var(--surface-alt)"
                      : file
                        ? "#f0f7ff"
                        : "var(--input-bg)",
                  }}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    onChange={(e) =>
                      validateAndSetFile(e.target.files[0], e.target)
                    }
                  />
                  <UploadIcon />
                  {file ? (
                    <div style={{ textAlign: "center" }}>
                      <p style={S.fileName}>{file.name}</p>
                      <p style={S.fileHint}>
                        {(file.size / (1024 * 1024)).toFixed(2)} MB · click to
                        replace
                      </p>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <p style={S.dropLabel}>
                        File is required. Drag and drop or{" "}
                        <span style={{ color: "var(--button-primary)", fontWeight: "600" }}>
                          browse
                        </span>
                      </p>
                      <p style={S.fileHint}>
                        PDF, DOC, DOCX, TXT, JPG, PNG · max 15MB
                      </p>
                    </div>
                  )}
                </div>
              </Field>

              <div style={S.divider} />

              <div className="subject-request-actions" style={S.actions}>
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
                      <span style={S.spinner} />
                      Sending...
                    </span>
                  ) : (
                    "Send Request"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  style={S.homeBtn}
                >
                  <HomeIcon />
                  Back Home
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

const S = {
  page: {
    minHeight: "100vh",
    background: "var(--bg-primary)",
    padding: "2rem 1.25rem 4rem",
  },
  inner: { maxWidth: "680px", margin: "0 auto" },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "1.75rem",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "7px 12px",
    border: "0.5px solid var(--border-color)",
    borderRadius: "8px",
    background: "var(--bg-secondary)",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
  breadcrumb: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },
  pageHeader: { marginBottom: "1.5rem" },
  heading: {
    fontSize: "clamp(22px, 3.5vw, 28px)",
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: "0 0 0.5rem",
    letterSpacing: "-0.02em",
  },
  subheading: {
    fontSize: "14px",
    color: "var(--text-secondary)",
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
    background: "var(--bg-secondary)",
    border: "0.5px solid var(--border-color)",
    borderRadius: "16px",
    padding: "2rem",
    boxShadow: "0 2px 12px var(--border-color)",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "0 1.25rem",
  },
  field: { marginBottom: "1.25rem" },
  labelRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
    marginBottom: "6px",
  },
  label: { fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" },
  hint: { fontSize: "11px", color: "var(--text-secondary)", fontWeight: "500" },
  input: {
    width: "100%",
    padding: "10px 13px",
    borderRadius: "8px",
    border: "0.5px solid var(--border-color)",
    fontSize: "14px",
    boxSizing: "border-box",
    color: "var(--text-primary)",
    background: "var(--input-bg)",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  inputFocus: {
    borderColor: "var(--button-primary)",
    boxShadow: "0 0 0 3px rgba(24,95,165,0.10)",
    background: "var(--bg-secondary)",
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
  dropLabel: { fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 2px" },
  fileName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--button-primary)",
    margin: "0 0 2px",
    wordBreak: "break-all",
  },
  fileHint: { fontSize: "11px", color: "var(--text-secondary)", margin: 0 },
  divider: {
    height: "0.5px",
    background: "var(--border-color)",
    margin: "0.5rem 0 1.5rem",
  },
  actions: { display: "flex", gap: "10px", flexWrap: "wrap" },
  submitBtn: {
    padding: "10px 22px",
    border: "none",
    borderRadius: "8px",
    background: "var(--button-primary)",
    color: "var(--bg-secondary)",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    letterSpacing: "-0.01em",
    cursor: "pointer",
  },
  homeBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 18px",
    border: "0.5px solid var(--border-color)",
    borderRadius: "8px",
    background: "var(--bg-secondary)",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
  spinner: {
    display: "inline-block",
    width: "12px",
    height: "12px",
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "var(--bg-secondary)",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};
