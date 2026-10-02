import { useNavigate } from "react-router-dom";

function StudentNavbar() {
  const navigate = useNavigate();

  // Student email OR name
  const email = localStorage.getItem("email") || "student@gmail.com";

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4 sticky-top">
      <span className="navbar-brand fw-bold">
        🎓 Student Panel
      </span>

      <div className="ms-auto">
        <span className="text-white">
          {email} |{" "}
          <span
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={logout}
          >
            Logout
          </span>
        </span>
      </div>
    </nav>
  );
}

export default StudentNavbar;
