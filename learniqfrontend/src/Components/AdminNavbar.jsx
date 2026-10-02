import { useNavigate } from "react-router-dom";

function AdminNavbar() {
  const navigate = useNavigate();

  // Email from localStorage
  const email = localStorage.getItem("email") || "pratik@gmail.com";

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 sticky-top">
      <span className="navbar-brand fw-bold">
        🛠 Admin Panel
      </span>

      <div className="ms-auto">
        <span className="text-white">
          {email} |{" "}
          <span
            style={{
              cursor: "pointer",
              textDecoration: "underline"
            }}
            onClick={logout}
          >
            Logout
          </span>
        </span>
      </div>
    </nav>
  );
}

export default AdminNavbar;
