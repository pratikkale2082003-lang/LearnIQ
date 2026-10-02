import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) {
      alert("Please enter email and password ❌");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", { email, password });
      console.log("Login response:", res.data); // id cha key ithe disel

      const data = res.data;
      const role = data.role;
      const studentId = data.userId ?? data.id ?? data.userid ?? data.user_id;

      if (studentId === undefined || studentId === null) {
        alert("User id response madhe nahi ❌ (console baghat)");
        return;
      }

      localStorage.clear(); // junya user cha data kaadhun taka
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", role.toLowerCase());
      localStorage.setItem("email", email);
      localStorage.setItem("studentId", String(studentId));

      navigate(role.toLowerCase() === "admin" ? "/admin" : "/student");
    } catch (err) {
      console.error(err);
      alert("Invalid credentials ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(to right, #4e73df, #1cc88a)",
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          width: "100%",
          maxWidth: "400px",
          borderRadius: "15px",
        }}
      >
        <h3 className="text-center mb-4 fw-bold text-primary">
          Welcome Back 👋
        </h3>

        <div className="mb-3">
          <label className="form-label fw-semibold">Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
        </div>

        <button
          className="btn btn-primary w-100 fw-semibold mb-3"
          onClick={login}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center mb-0">
          Don't have an account?{" "}
          <Link to="/register" className="fw-semibold text-decoration-none">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;