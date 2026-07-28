import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicFooter from "../components/PublicFooter";
import api from "../lib/api";

function ContactPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "General Inquiry",
    subject: "",
    message: "",
    website: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.category.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      alert("Please complete all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      await api.post("/api/contact", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        category: formData.category.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        website: formData.website,
      });

      setSuccess(true);

      setFormData({
        name: "",
        email: "",
        category: "General Inquiry",
        subject: "",
        message: "",
        website: "",
      });
    } catch (error) {
      console.error("Error sending contact message:", error);
      alert(error.message || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputFocus = (e) => Object.assign(e.target.style, S.inputFocus);

  const inputBlur = (e) =>
    Object.assign(e.target.style, {
      borderColor: "var(--border-color)",
      boxShadow: "none",
      background: "var(--input-bg)",
    });

  return (
    <>
      <style>{`
        @keyframes fadeUp {
            from   { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes driftA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(28px, -22px) scale(1.05); }
        }
        @keyframes driftB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-20px, 20px) scale(1.04); }
        }

        .contact-page-enter {
          animation: fadeUp 0.35s ease both;
        }

        .contact-layout {
          display              : grid;
          grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
          gap                  : 18px;
        }

        .contact-two-col {
          display              : grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap                  : 0 1rem;
        }

        input   : focus,
        textarea: focus,
        select  : focus {
          outline: none;
        }

        .contact-submit-btn: hover: not(:disabled) { background-color: #0e3d6e; }

        .blob-a {
          position  : absolute; top: -150px; right: -140px;
          width     : 460px; height: 460px;
          background: 
            radial-gradient(circle at 27% 24%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 24%),
            radial-gradient(circle at 62% 70%, #7dd8ff 0%, #33b5f0 32%, #1a7fd4 58%, #0f5aa6 80%, #0a3f7a 100%);
          border-radius: 58% 42% 63% 37% / 46% 54% 46% 54%;
          filter       : blur(1px);
          box-shadow   : 0 60px 110px -25px rgba(15, 90, 166, 0.4);
          animation    : driftA 16s ease-in-out infinite;
        }
        .blob-b {
          position  : absolute; top: 40px; right: 30px;
          width     : 100px; height: 100px;
          background: 
            radial-gradient(circle at 30% 26%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 26%),
            radial-gradient(circle at 62% 68%, #66cdf4 0%, #1f8fdc 45%, #0e5a9e 100%);
          border-radius: 50%;
          filter       : blur(0.5px);
          box-shadow   : 0 24px 46px -12px rgba(15, 90, 166, 0.45);
          animation    : driftB 13s ease-in-out infinite;
        }

        @media (max-width: 820px) {
          .contact-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .contact-inner {
            padding: 1.5rem 1rem 3rem !important;
          }

          .contact-title {
            font-size  : 30px !important;
            line-height: 1.12 !important;
          }

          .contact-subtitle {
            font-size  : 14px !important;
            line-height: 1.7 !important;
          }

          .contact-card,
          .contact-info-card {
            padding      : 18px !important;
            border-radius: 16px !important;
          }

          .contact-two-col {
            grid-template-columns: 1fr;
            gap                  : 0;
          }

          .contact-input,
          .contact-textarea {
            font-size : 16px !important;
            width     : 100% !important;
            box-sizing: border-box !important;
          }

          .contact-submit {
            width: 100% !important;
          }
        }
      `}</style>

      <main style={S.page}>
        <div style={S.blobField}>
          <div className="blob-a" />
          <div className="blob-b" />
        </div>

        <div className="contact-inner" style={S.inner}>
          <button
            onClick={() => navigate("/")}
            style={S.backBtn}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--surface-alt)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")
            }
          >
            ← Back
          </button>

          <section className="contact-page-enter" style={S.hero}>
            <span style={S.eyebrow}>Support & Feedback</span>

            <h1 className="contact-title" style={S.title}>
              Contact us
            </h1>

            <p className="contact-subtitle" style={S.subtitle}>
              Need help, found a bug, have a feature idea, or want to request
              new study material? Send us a message and we will review it.
            </p>
          </section>

          <section
            className="contact-layout contact-page-enter"
            style={S.layout}
          >
            <div className="contact-info-card" style={S.infoCard}>
              <h2 style={S.infoTitle}>How we can help</h2>

              <div style={S.infoList}>
                {[
                  ["🐞", "Report a bug"],
                  ["📚", "Request study material"],
                  ["💡", "Suggest a feature"],
                  ["👤", "Get account support"],
                  ["🤝", "Partnership or advertising enquiry"],
                ].map(([icon, text]) => (
                  <div style={S.infoItem} key={text}>
                    <span style={S.infoIcon}>{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <div style={S.responseBox}>
                <strong>Typical response time</strong>
                <span>24 to 48 hours</span>
              </div>
            </div>

            <div className="contact-card" style={S.card}>
              {success ? (
                <div style={S.successPanel}>
                  <div style={S.successIcon}>✓</div>

                  <h2 style={S.successTitle}>Message received</h2>

                  <p style={S.successText}>
                    Thank you for contacting us. Your message has been received
                    and will be reviewed as soon as possible.
                  </p>

                  <button
                    className="contact-submit-btn"
                    style={S.submitBtn}
                    onClick={() => setSuccess(false)}
                    type="button"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    style={{ display: "none" }}
                    tabIndex="-1"
                    autoComplete="off"
                  />

                  <div className="contact-two-col">
                    <Field label="Name" hint="Required">
                      <input
                        className="contact-input"
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Your name"
                        required
                        style={S.input}
                        onFocus={inputFocus}
                        onBlur={inputBlur}
                      />
                    </Field>

                    <Field label="Email" hint="Required">
                      <input
                        className="contact-input"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="Your email address"
                        required
                        style={S.input}
                        onFocus={inputFocus}
                        onBlur={inputBlur}
                      />
                    </Field>
                  </div>

                  <Field label="Category" hint="Required">
                    <select
                      className="contact-input"
                      value={formData.category}
                      onChange={(e) => updateField("category", e.target.value)}
                      required
                      style={S.input}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Bug Report">Bug Report</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Content Request">Content Request</option>
                      <option value="Account Issue">Account Issue</option>
                      <option value="Advertising / Partnership">
                        Advertising / Partnership
                      </option>
                    </select>
                  </Field>

                  <Field label="Subject" hint="Required">
                    <input
                      className="contact-input"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => updateField("subject", e.target.value)}
                      placeholder="Brief message subject"
                      required
                      style={S.input}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                    />
                  </Field>

                  <Field label="Message" hint="Required">
                    <textarea
                      className="contact-textarea"
                      value={formData.message}
                      onChange={(e) => updateField("message", e.target.value)}
                      placeholder="Write your message here"
                      required
                      rows={7}
                      style={S.textarea}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                    />
                  </Field>

                  <button
                    className="contact-submit contact-submit-btn"
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      ...S.submitBtn,
                      opacity: isSubmitting ? 0.7 : 1,
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                    }}
                  >
                    {isSubmitting ? "Sending..." : "Send message"}
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </>
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

const S = {
  page: {
    minHeight: "100vh",
    background: "var(--bg-primary)",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  blobField: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    overflow: "hidden",
    pointerEvents: "none",
  },
  inner: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "2.5rem 1.25rem 4rem",
    boxSizing: "border-box",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "1.5rem",
    padding: "7px 14px",
    border: "0.5px solid var(--border-color)",
    borderRadius: "8px",
    background: "var(--bg-secondary)",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  hero: {
    marginBottom: "1.5rem",
  },
  eyebrow: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--button-primary)",
    background: "var(--surface-alt)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    padding: "6px 12px",
    borderRadius: "999px",
    marginBottom: "1rem",
  },
  title: {
    margin: 0,
    color: "var(--text-primary)",
    fontSize: "clamp(30px, 5.5vw, 46px)",
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
    fontWeight: 600,
  },
  subtitle: {
    margin: "1rem 0 0",
    color: "var(--text-secondary)",
    fontSize: "15px",
    lineHeight: 1.75,
    maxWidth: "620px",
  },
  layout: {},
  infoCard: {
    background: "var(--bg-secondary)",
    border: "0.5px solid var(--border-color)",
    borderRadius: "16px",
    padding: "1.5rem",
    height: "fit-content",
    boxSizing: "border-box",
  },
  infoTitle: {
    margin: "0 0 1rem",
    color: "var(--text-primary)",
    fontSize: "17px",
    fontWeight: 600,
  },
  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "var(--text-secondary)",
    fontSize: "13.5px",
    lineHeight: 1.6,
  },
  infoIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    borderRadius: "9px",
    background: "var(--surface-alt)",
    fontSize: "14px",
    flexShrink: 0,
  },
  responseBox: {
    marginTop: "1.25rem",
    padding: "14px",
    borderRadius: "12px",
    background: "var(--surface-alt)",
    color: "var(--text-primary)",
    display: "grid",
    gap: "4px",
    fontSize: "13.5px",
  },
  card: {
    background: "var(--bg-secondary)",
    border: "0.5px solid var(--border-color)",
    borderRadius: "16px",
    padding: "1.75rem",
    boxSizing: "border-box",
    minWidth: 0,
  },
  field: {
    marginBottom: "1.15rem",
  },
  labelRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
    marginBottom: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  hint: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    fontWeight: 500,
  },
  input: {
    width: "100%",
    minWidth: 0,
    padding: "11px 13px",
    borderRadius: "10px",
    border: "0.5px solid var(--border-color)",
    fontSize: "14px",
    boxSizing: "border-box",
    color: "var(--text-primary)",
    background: "var(--input-bg)",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  textarea: {
    width: "100%",
    minWidth: 0,
    padding: "11px 13px",
    borderRadius: "10px",
    border: "0.5px solid var(--border-color)",
    fontSize: "14px",
    boxSizing: "border-box",
    color: "var(--text-primary)",
    background: "var(--input-bg)",
    transition: "border-color 0.15s, box-shadow 0.15s",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: 1.6,
  },
  inputFocus: {
    borderColor: "var(--button-primary)",
    boxShadow: "0 0 0 3px rgba(24,95,165,0.10)",
    background: "var(--bg-secondary)",
  },
  submitBtn: {
    width: "100%",
    padding: "11px 16px",
    border: "none",
    borderRadius: "10px",
    background: "var(--button-primary)",
    color: "#fff",
    fontSize: "13.5px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.15s",
    letterSpacing: "-0.01em",
  },
  successPanel: {
    textAlign: "center",
    padding: "20px 0",
  },
  successIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#16a34a",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: 900,
  },
  successTitle: {
    color: "var(--text-primary)",
    margin: "14px 0 8px",
    fontSize: "18px",
    fontWeight: 600,
  },
  successText: {
    color: "var(--text-secondary)",
    lineHeight: 1.7,
    fontSize: "14px",
  },
};

export default ContactPage;
