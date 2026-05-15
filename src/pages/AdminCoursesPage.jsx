import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

function AdminCoursesPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/courses", {
        _tokenType: "admin",
      });

      setCourses(data.courses || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async () => {
    if (!newCourse.trim()) {
      return alert("Enter a course name");
    }

    try {
      setSaving(true);

      await api.post(
        "/api/courses",
        {
          name: newCourse.trim(),
        },
        {
          _tokenType: "admin",
        },
      );

      setNewCourse("");

      await fetchCourses();

      alert("Course added successfully");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to create course");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (id, name) => {
    const confirmed = window.confirm(`Delete ${name}?`);

    if (!confirmed) return;

    try {
      await api.delete(`/api/courses/${id}`, {
        _tokenType: "admin",
      });

      await fetchCourses();

      alert("Course deleted successfully");
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Failed to delete course");
    }
  };

  // Design tokens matching AdminPage
  const S = {
    container: {
      minHeight: "100vh",
      background: "#f8fafc",
      padding: "40px 20px",
    },
    maxWidth: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      marginBottom: "32px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "16px",
      flexWrap: "wrap",
    },
    headerTitle: {
      fontSize: `clamp(28px, 5vw, 36px)`,
      fontWeight: "600",
      margin: "0 0 8px",
      color: "#0f172a",
    },
    headerSubtitle: {
      fontSize: "15px",
      color: "#64748b",
      margin: "0",
    },
    headerDescription: {
      fontSize: "14px",
      color: "#475569",
      margin: "8px 0 0",
      lineHeight: "1.6",
    },
    backButton: {
      padding: "10px 20px",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      backgroundColor: "#ffffff",
      color: "#0f172a",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    section: {
      marginBottom: "24px",
    },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#0f172a",
      margin: "0 0 16px",
    },
    card: {
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "24px",
    },
    input: {
      padding: "11px 14px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      backgroundColor: "#ffffff",
      color: "#0f172a",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      transition: "all 0.2s",
      flex: "1 1 auto",
      minWidth: "250px",
    },
    inputFocus: {
      borderColor: "#185fa5",
      boxShadow: "0 0 0 3px rgba(24, 95, 165, 0.08)",
    },
    primaryButton: {
      padding: "11px 20px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "#185fa5",
      color: "#ffffff",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    primaryButtonHover: {
      backgroundColor: "#1445a0",
      boxShadow: "0 4px 12px rgba(24, 95, 165, 0.15)",
    },
    deleteButton: {
      padding: "10px 16px",
      borderRadius: "8px",
      border: "1px solid #fecaca",
      backgroundColor: "#fef2f2",
      color: "#b91c1c",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    deleteButtonHover: {
      backgroundColor: "#fee2e2",
      borderColor: "#fbcacb",
    },
    courseItem: {
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      padding: "16px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
      backgroundColor: "#ffffff",
      transition: "all 0.2s",
    },
    courseItemHover: {
      borderColor: "#cbd5e1",
      backgroundColor: "#f8fafc",
    },
    courseName: {
      fontWeight: "700",
      fontSize: "15px",
      color: "#0f172a",
      margin: "0",
    },
    emptyState: {
      padding: "32px 20px",
      textAlign: "center",
      border: "1px dashed #cbd5e1",
      borderRadius: "10px",
      backgroundColor: "#f8fafc",
    },
    emptyStateText: {
      fontSize: "14px",
      color: "#64748b",
      margin: "0",
    },
    loadingState: {
      padding: "32px 20px",
      textAlign: "center",
      color: "#64748b",
      fontSize: "14px",
    },
    courseGrid: {
      display: "grid",
      gap: "12px",
    },
    inputGrid: {
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
      alignItems: "stretch",
    },
  };

  return (
    <div style={S.container}>
      <div style={S.maxWidth}>
        {/* Header */}
        <div style={S.header}>
          <div>
            <p style={S.headerSubtitle}>Admin / Course Management</p>
            <h1 style={S.headerTitle}>Manage Courses</h1>
            <p style={S.headerDescription}>
              Add and manage available courses for your exam platform.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin")}
            style={S.backButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f1f5f9";
              e.currentTarget.style.borderColor = "#cbd5e1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ffffff";
              e.currentTarget.style.borderColor = "#cbd5e1";
            }}
          >
            ← Back to Admin
          </button>
        </div>

        {/* Add Course Section */}
        <div style={S.section}>
          <div style={S.card}>
            <h2 style={S.sectionTitle}>Add new course</h2>

            <div style={S.inputGrid}>
              <input
                type="text"
                placeholder="Enter course name"
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                style={S.input}
                onFocus={(e) => {
                  e.target.style.borderColor = "#185fa5";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(24, 95, 165, 0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />

              <button
                onClick={handleAddCourse}
                disabled={saving}
                style={{
                  ...S.primaryButton,
                  opacity: saving ? 0.65 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.currentTarget.style.backgroundColor = "#1445a0";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(24, 95, 165, 0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#185fa5";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {saving ? "Adding..." : "Add Course"}
              </button>
            </div>
          </div>
        </div>

        {/* Courses List Section */}
        <div style={S.section}>
          <div style={S.card}>
            <h2 style={S.sectionTitle}>Available courses</h2>

            {loading ? (
              <div style={S.loadingState}>Loading courses...</div>
            ) : courses.length === 0 ? (
              <div style={S.emptyState}>
                <p style={S.emptyStateText}>
                  No courses found. Create one to get started.
                </p>
              </div>
            ) : (
              <div style={S.courseGrid}>
                {courses.map((course) => (
                  <div
                    key={course._id}
                    style={S.courseItem}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#cbd5e1";
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.backgroundColor = "#ffffff";
                    }}
                  >
                    <p style={S.courseName}>{course.name}</p>

                    <button
                      onClick={() =>
                        handleDeleteCourse(course._id, course.name)
                      }
                      style={S.deleteButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#fee2e2";
                        e.currentTarget.style.borderColor = "#fbcacb";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#fef2f2";
                        e.currentTarget.style.borderColor = "#fecaca";
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminCoursesPage;
