import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "../CSS/Login.css";

const MIN_PASSWORD_LENGTH = 4;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Forgot password
  const [showForgot, setShowForgot] = useState(false);
  const [fp, setFp] = useState({
    email: "",
    newPassword: "",
    confirm: "",
  });
  const [fpShow, setFpShow] = useState(false);
  const [fpLoading, setFpLoading] = useState(false);
  const [fpMsg, setFpMsg] = useState({ type: "", text: "" });

  const navigate = useNavigate();

  const login = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", { email, password });
      console.log("Login response:", res.data); // check the id key here

      const data = res.data;
      const role = data.role;
      const studentId = data.userId ?? data.id ?? data.userid ?? data.user_id;

      if (studentId === undefined || studentId === null) {
        setError("User ID not found in the server response (check the console)");
        return;
      }

      localStorage.clear(); // clear previous user data
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", role.toLowerCase());
      localStorage.setItem("email", email);
      localStorage.setItem("studentId", String(studentId));

      navigate(role.toLowerCase() === "admin" ? "/admin" : "/student");
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const openForgot = () => {
    setFp({ email, newPassword: "", confirm: "" });
    setFpMsg({ type: "", text: "" });
    setShowForgot(true);
  };

  const handleFp = (e) => setFp({ ...fp, [e.target.name]: e.target.value });

  const resetPassword = async () => {
    setFpMsg({ type: "", text: "" });

    if (!fp.email || !fp.newPassword || !fp.confirm) {
      setFpMsg({ type: "err", text: "Please fill in all fields" });
      return;
    }
    if (fp.newPassword.length < MIN_PASSWORD_LENGTH) {
      setFpMsg({
        type: "err",
        text: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
      return;
    }
    if (fp.newPassword !== fp.confirm) {
      setFpMsg({ type: "err", text: "Passwords do not match" });
      return;
    }

    setFpLoading(true);
    try {
      await api.post("/api/auth/forgot-password", {
        email: fp.email,
        newPassword: fp.newPassword,
      });
      setFpMsg({
        type: "ok",
        text: "Password reset successfully. Please login with your new password.",
      });
      setEmail(fp.email);
      setPassword("");
      setTimeout(() => setShowForgot(false), 1800);
    } catch (err) {
      console.error(err);
      setFpMsg({
        type: "err",
        text: "This email is not registered. Please check and try again.",
      });
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <div className="lg-wrap">
      {/* ===== LEFT: BRAND ===== */}
      <div className="lg-brand">
        <div className="lg-logo">🎓 Learni<span>Q</span></div>
        <div className="lg-tag">Learn • Practice • Grow</div>

        <h2>
          Online Aptitude Tests,
          <br />
          made simple.
        </h2>

        <ul className="lg-points">
          <li><span className="dot">📝</span> Practice & scheduled tests</li>
          <li><span className="dot">⚡</span> Instant results with answer review</li>
          <li><span className="dot">📄</span> Download your result as PDF</li>
        </ul>
      </div>

      {/* ===== RIGHT: FORM ===== */}
      <div className="lg-form-side">
        <div className="lg-card">
          <h3>Welcome Back 👋</h3>
          <p className="lg-sub">Login to access your dashboard</p>

          {error && <div className="lg-alert err">{error}</div>}

          <div className="lg-field">
            <label>Email</label>
            <div className="lg-input">
              <span className="ico">✉️</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
              />
            </div>
          </div>

          <div className="lg-field">
            <label>Password</label>
            <div className="lg-input">
              <span className="ico">🔒</span>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
              />
              <button
                type="button"
                className="lg-eye"
                onClick={() => setShowPass(!showPass)}
                title={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="lg-row">
            <button type="button" className="lg-link" onClick={openForgot}>
              Forgot password?
            </button>
          </div>

          <button className="lg-btn" onClick={login} disabled={loading}>
            {loading ? "Logging in..." : "Login →"}
          </button>

          <p className="lg-foot">
            Don't have an account?{" "}
            <Link to="/register" className="lg-link">Register</Link>
          </p>
          <Link to="/" className="lg-link lg-home">← Back to Home</Link>
        </div>
      </div>

      {/* ===== FORGOT PASSWORD MODAL ===== */}
      {showForgot && (
        <div className="lg-overlay" onClick={() => setShowForgot(false)}>
          <div className="lg-modal" onClick={(e) => e.stopPropagation()}>
            <button className="lg-close" onClick={() => setShowForgot(false)}>✕</button>

            <h4>🔑 Reset Password</h4>
            <p className="lg-sub">
              Enter your registered email and set a new password.
            </p>

            {fpMsg.text && <div className={`lg-alert ${fpMsg.type}`}>{fpMsg.text}</div>}

            <div className="lg-field">
              <label>Email</label>
              <div className="lg-input">
                <span className="ico">✉️</span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={fp.email}
                  onChange={handleFp}
                />
              </div>
            </div>

            <div className="lg-field">
              <label>New Password</label>
              <div className="lg-input">
                <span className="ico">🔒</span>
                <input
                  type={fpShow ? "text" : "password"}
                  name="newPassword"
                  placeholder={`Minimum ${MIN_PASSWORD_LENGTH} characters`}
                  value={fp.newPassword}
                  onChange={handleFp}
                />
                <button type="button" className="lg-eye" onClick={() => setFpShow(!fpShow)}>
                  {fpShow ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="lg-field">
              <label>Confirm Password</label>
              <div className="lg-input">
                <span className="ico">🔒</span>
                <input
                  type={fpShow ? "text" : "password"}
                  name="confirm"
                  placeholder="Re-enter your new password"
                  value={fp.confirm}
                  onChange={handleFp}
                  onKeyDown={(e) => e.key === "Enter" && resetPassword()}
                />
              </div>
            </div>

            <button className="lg-btn" onClick={resetPassword} disabled={fpLoading}>
              {fpLoading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;