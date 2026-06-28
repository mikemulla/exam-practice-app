import { useState } from "react";
import PublicFooter from "../components/PublicFooter";
import api from "../lib/api";

function ContactPage() {
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
           from  { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
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

        @media (max-width: 820px) {
          .contact-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .contact-page {
            padding: 28px 14px !important;
          }

          .contact-title {
            font-size  : 34px !important;
            line-height: 1.08 !important;
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

      <main className="contact-page" style={S.page}>
        <section className="contact-page-enter" style={S.hero}>
          <p style={S.eyebrow}>Support & Feedback</p>

          <h1 className="contact-title" style={S.title}>
            Contact Us
          </h1>

          <p className="contact-subtitle" style={S.subtitle}>
            Need help, found a bug, have a feature idea, or want to request new
            study material? Send us a message and we will review it.
          </p>
        </section>

        <section className="contact-layout contact-page-enter" style={S.layout}>
          <div className="contact-info-card" style={S.infoCard}>
            <h2 style={S.infoTitle}>How we can help</h2>

            <div style={S.infoList}>
              <p style={S.infoItem}>🐞 Report a bug</p>
              <p style={S.infoItem}>📚 Request study material</p>
              <p style={S.infoItem}>💡 Suggest a feature</p>
              <p style={S.infoItem}>👤 Get account support</p>
              <p style={S.infoItem}>🤝 Partnership or advertising enquiry</p>
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

                <h2 style={S.successTitle}>Message Received</h2>

                <p style={S.successText}>
                  Thank you for contacting us. Your message has been received
                  and will be reviewed as soon as possible.
                </p>

                <button
                  style={S.submitBtn}
                  onClick={() => setSuccess(false)}
                  type="button"
                >
                  Send Another Message
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
                  className="contact-submit"
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    ...S.submitBtn,
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </section>
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
    padding: "48px 18px",
    boxSizing: "border-box",
  },
  hero: {
    maxWidth: "960px",
    margin: "0 auto 24px",
  },
  eyebrow: {
    margin: "0 0 8px",
    color: "var(--button-primary)",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    color: "var(--text-primary)",
    fontSize: "clamp(32px, 6vw, 54px)",
    lineHeight: 1.05,
  },
  subtitle: {
    margin: "14px 0 0",
    color: "var(--text-secondary)",
    fontSize: "16px",
    lineHeight: 1.8,
    maxWidth: "720px",
  },
  layout: {
    maxWidth: "960px",
    margin: "0 auto",
  },
  infoCard: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "20px",
    padding: "24px",
    height: "fit-content",
    boxSizing: "border-box",
  },
  infoTitle: {
    margin: "0 0 14px",
    color: "var(--text-primary)",
    fontSize: "20px",
  },
  infoList: {
    color: "var(--text-secondary)",
    fontSize: "14px",
    lineHeight: 1.7,
  },
  infoItem: {
    margin: "0 0 10px",
  },
  responseBox: {
    marginTop: "18px",
    padding: "14px",
    borderRadius: "14px",
    background: "var(--surface-alt)",
    color: "var(--text-primary)",
    display: "grid",
    gap: "4px",
    fontSize: "14px",
  },
  card: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 18px 50px rgba(15,23,42,0.08)",
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
    fontWeight: 700,
    color: "var(--text-primary)",
  },
  hint: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    minWidth: 0,
    padding: "11px 13px",
    borderRadius: "10px",
    border: "1px solid var(--border-color)",
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
    border: "1px solid var(--border-color)",
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
    padding: "12px 18px",
    border: "none",
    borderRadius: "12px",
    background: "var(--button-primary)",
    color: "white",
    fontSize: "14px",
    fontWeight: 800,
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
  },
  successText: {
    color: "var(--text-secondary)",
    lineHeight: 1.7,
  },
};

export default ContactPage;
