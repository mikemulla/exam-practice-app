import { useState } from "react";
import emailjs from "@emailjs/browser";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "General Inquiry",
    subject: "",
    message: "",
  });

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSending(true);
    setSuccess("");

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID,
        {
          user_name: formData.name,
          user_email: formData.email,
          category: formData.category,
          subject: formData.subject,
          message: formData.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );

      setSuccess("Message sent successfully.");

      setFormData({
        name: "",
        email: "",
        category: "General Inquiry",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Contact Us</h1>

        <p style={styles.subtitle}>
          Have a question, suggestion, bug report, or content request? Send us a
          message.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={styles.group}>
            <label>Name</label>
            <input
              style={styles.input}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.group}>
            <label>Email</label>
            <input
              type="email"
              style={styles.input}
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.group}>
            <label>Category</label>
            <select
              style={styles.input}
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option>General Inquiry</option>
              <option>Bug Report</option>
              <option>Feature Request</option>
              <option>Content Request</option>
              <option>Account Issue</option>
            </select>
          </div>

          <div style={styles.group}>
            <label>Subject</label>
            <input
              style={styles.input}
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.group}>
            <label>Message</label>
            <textarea
              style={styles.textarea}
              name="message"
              rows={6}
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={sending} style={styles.button}>
            {sending ? "Sending..." : "Send Message"}
          </button>

          {success && <p style={styles.success}>{success}</p>}
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#08152f",
    padding: "40px 20px",
  },

  card: {
    maxWidth: "800px",
    margin: "0 auto",
    background: "#132547",
    padding: "32px",
    borderRadius: "16px",
    color: "#fff",
  },

  title: {
    marginBottom: "10px",
  },

  subtitle: {
    marginBottom: "30px",
    color: "#cbd5e1",
  },

  group: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "18px",
    gap: "6px",
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#fff",
  },

  textarea: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#fff",
    resize: "vertical",
  },

  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "#185FA5",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },

  success: {
    marginTop: "15px",
    color: "#22c55e",
    fontWeight: 600,
  },
};
