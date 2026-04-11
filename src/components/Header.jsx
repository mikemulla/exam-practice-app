import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "white",
        borderBottom: "1px solid #e2e8f0",
        padding: "14px 24px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Logo / Title */}
      <h2
        onClick={() => navigate("/")}
        style={{
          margin: 0,
          cursor: "pointer",
          color: "#185FA5",
          fontWeight: "700",
        }}
      >
        Exam Practice
      </h2>

      {/* Optional nav */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={() => navigate("/user")}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            backgroundColor: "white",
            cursor: "pointer",
          }}
        >
          User
        </button>

        <button
          onClick={() => navigate("/admin")}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#185FA5",
            color: "white",
            cursor: "pointer",
          }}
        >
          Admin
        </button>
      </div>
    </div>
  );
}

export default Header;
