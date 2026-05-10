import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const apiArray = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const COURSE_CACHE_KEY = "signupCoursesCache";

function UserSignupPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState(() => {
    try {
      const cached = localStorage.getItem(COURSE_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [courseId, setCourseId] = useState("");
  const [level, setLevel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(
    courses.length === 0,
  );
  const [courseError, setCourseError] = useState("");

  const fetchCourses = async () => {
    try {
      setCourseError("");
      setIsLoadingCourses(true);
      const response = await api.get("/api/courses?limit=100");
      const list = apiArray(response.data, "courses");
      setCourses(list);
      localStorage.setItem(COURSE_CACHE_KEY, JSON.stringify(list));

      if (list.length === 0) {
        setCourseError("No courses found. Please contact the admin.");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourseError(
        error.message || "Could not load courses. Please try again.",
      );
    } finally {
      setIsLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!courseId) {
      alert("Please select a course");
      return;
    }

    if (!level) {
      alert("Please select a level");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post("/api/users/signup", {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        courseId,
        level: Number(level),
      });

      localStorage.setItem("userToken", response.data.token);
      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      navigate("/user-dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      alert(error.message || "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const courseSelectLabel = isLoadingCourses
    ? "Loading courses..."
    : courses.length === 0
      ? "No courses available"
      : "Select course";

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
            from   { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-card { animation: fadeInUp 0.5s ease-out; }
        
        /* Input field styling for dark mode visibility */
        input[type="text"],
        input[type="email"],
        input[type="password"] {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          border: 0.5px solid var(--border-color);
          caret-color: var(--button-primary);
        }
        
        input[type="text"]:focus,
        input[type="email"]:focus,
        input[type="password"]:focus {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          border-color: var(--button-primary);
          box-shadow: 0 0 0 3px rgba(24, 95, 165, 0.08);
          outline: none;
        }
        
        input[type="text"]::placeholder,
        input[type="email"]::placeholder,
        input[type="password"]::placeholder {
          color: var(--text-secondary);
          opacity: 0.7;
        }
        
        /* Dropdown styling for dark mode visibility */
        select {
          color-scheme: light dark;
        }
        
        select option {
          background: var(--bg-secondary);
          color: var(--text-primary);
          padding: 8px;
        }
        
        select option:checked {
          background: var(--button-primary);
          color: #fff;
        }
        
        select option:hover {
          background: var(--surface-alt);
          color: var(--text-primary);
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-primary)",
          padding: "2rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle background accent */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(24, 95, 165, 0.04) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div
          className="auth-card"
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "var(--bg-secondary)",
            border: "0.5px solid rgba(0,0,0,0.08)",
            borderRadius: "14px",
            padding: "2rem",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <p
              style={{
                margin: "0 0 0.75rem",
                color: "var(--text-secondary)",
                fontSize: "12px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Student Access
            </p>
            <h1
              style={{
                margin: "0 0 0.5rem",
                color: "var(--text-primary)",
                fontSize: "28px",
                fontWeight: "700",
                letterSpacing: "-0.02em",
              }}
            >
              Get started
            </h1>
            <p
              style={{
                margin: 0,
                color: "var(--text-secondary)",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              Create your account and start practicing today.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup}>
            {/* Full Name */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              >
                Full name
              </label>
              <input
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              >
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              >
                Password
              </label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                style={inputStyle}
              />
            </div>

            {/* Course */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              >
                Course
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                disabled={isLoadingCourses || courses.length === 0}
                style={{
                  ...inputStyle,
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='var(--text-secondary)' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  paddingRight: "36px",
                }}
              >
                <option value="">{courseSelectLabel}</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>

              {courseError && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "8px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    backgroundColor: "var(--surface-alt)",
                    color: "#92400E",
                    fontSize: "13px",
                    border: "1px solid #FDE68A",
                  }}
                >
                  <span>{courseError}</span>
                  <button
                    type="button"
                    onClick={fetchCourses}
                    style={{
                      border: "none",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      backgroundColor: "var(--button-primary)",
                      color: "white",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "12px",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--button-primary-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--button-primary)";
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            {/* Level */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              >
                Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                required
                style={{
                  ...inputStyle,
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='var(--text-secondary)' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  paddingRight: "36px",
                  marginBottom: "0",
                }}
              >
                <option value="">Select level</option>
                {[100, 200, 300, 400, 500, 600].map((item) => (
                  <option key={item} value={item}>
                    {item} Level
                  </option>
                ))}
              </select>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={
                isSubmitting || isLoadingCourses || courses.length === 0
              }
              style={{
                width: "100%",
                padding: "11px 16px",
                border: "none",
                borderRadius: "8px",
                backgroundColor: "var(--button-primary)",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor:
                  isSubmitting || isLoadingCourses || courses.length === 0
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  isSubmitting || isLoadingCourses || courses.length === 0
                    ? 0.6
                    : 1,
                transition: "all 0.2s",
                marginBottom: "1rem",
              }}
              onMouseEnter={(e) => {
                if (
                  !(isSubmitting || isLoadingCourses || courses.length === 0)
                ) {
                  e.currentTarget.style.backgroundColor =
                    "var(--button-primary-hover)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(24, 95, 165, 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--button-primary)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "1.5rem 0",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "0.5px",
                background: "var(--border-color)",
              }}
            />
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                fontWeight: "500",
              }}
            >
              Have an account?
            </span>
            <div
              style={{
                flex: 1,
                height: "0.5px",
                background: "var(--border-color)",
              }}
            />
          </div>

          {/* Login button */}
          <button
            type="button"
            onClick={() => navigate("/user-login")}
            style={{
              width: "100%",
              padding: "11px 16px",
              border: "0.5px solid rgba(0,0,0,0.12)",
              borderRadius: "8px",
              backgroundColor: "#fff",
              color: "var(--text-secondary)",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
              marginBottom: "1rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--surface-alt)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
            }}
          >
            Login instead
          </button>

          {/* Home button */}
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              width: "100%",
              padding: "10px 16px",
              border: "none",
              background: "none",
              color: "var(--text-secondary)",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            ← Back to home
          </button>
        </div>
      </div>
    </>
  );
}

const inputStyle = {
  width          : "100%",
  padding        : "11px 14px",
  borderRadius   : "8px",
  border         : "0.5px solid var(--border-color)",
  fontSize       : "14px",
  boxSizing      : "border-box",
  backgroundColor: "var(--bg-secondary)",
  color          : "var(--text-primary)",
  transition     : "all 0.2s",
  outline        : "none",
  marginBottom   : "0",
};

export default UserSignupPage;
