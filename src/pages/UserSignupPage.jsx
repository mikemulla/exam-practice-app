import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const apiArray = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};


function UserSignupPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [courseId, setCourseId] = useState("");
  const [level, setLevel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/api/courses");
        setCourses(apiArray(response.data, "courses"));
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const response = await api.post("/api/users/signup", {
        fullName,
        email,
        password,
        courseId,
        level,
      });

      localStorage.setItem("userToken", response.data.token);
      localStorage.setItem("userInfo", JSON.stringify(response.data.user));

      alert("Signup successful");
      navigate("/user-dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      alert(error.response?.data?.message || "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <p style={labelTop}>Student access</p>
        <h1 style={titleStyle}>Create Account</h1>
        <p style={subtitleStyle}>
          Sign up with your course and level so you only see subjects that apply
          to you.
        </p>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
            style={inputStyle}
          />

          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
            style={inputStyle}
          >
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            required
            style={inputStyle}
          >
            <option value="">Select level</option>
            {[100, 200, 300, 400, 500, 600].map((item) => (
              <option key={item} value={item}>
                {item} Level
              </option>
            ))}
          </select>

          <button type="submit" disabled={isSubmitting} style={primaryButton}>
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <button onClick={() => navigate("/user-login")} style={secondaryButton}>
          Already have an account? Login
        </button>

        <button onClick={() => navigate("/")} style={plainButton}>
          Back Home
        </button>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  background: "linear-gradient(135deg, #f8fbff 0%, #eef4ff 50%, #f7f9fc 100%)",
};

const cardStyle = {
  width: "100%",
  maxWidth: "460px",
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "20px",
  padding: "28px",
  boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
};

const labelTop = {
  margin: 0,
  color: "#64748b",
  fontSize: "14px",
  fontWeight: "700",
};

const titleStyle = {
  margin: "10px 0 8px",
  color: "#0f172a",
  fontSize: "32px",
};

const subtitleStyle = {
  margin: "0 0 22px",
  color: "#64748b",
  lineHeight: "1.6",
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  marginBottom: "14px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
  backgroundColor: "white",
};

const primaryButton = {
  width: "100%",
  padding: "14px",
  border: "none",
  borderRadius: "10px",
  backgroundColor: "#185FA5",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
};

const secondaryButton = {
  width: "100%",
  marginTop: "12px",
  padding: "14px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  backgroundColor: "white",
  fontWeight: "600",
  cursor: "pointer",
};

const plainButton = {
  width: "100%",
  marginTop: "10px",
  padding: "10px",
  border: "none",
  backgroundColor: "transparent",
  color: "#64748b",
  cursor: "pointer",
};

export default UserSignupPage;
