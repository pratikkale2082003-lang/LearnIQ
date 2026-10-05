import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../CSS/Register.css";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
const MIN_PASSWORD_LENGTH = 4;

/* ---------- small inline icons ---------- */
const CapIcon = () => (
  <svg viewBox="0 0 64 44" fill="none">
    <path d="M32 2 2 16l30 14 30-14L32 2Z" fill="#2f7bf5" />
    <path d="M14 24v10c0 4 8 8 18 8s18-4 18-8V24l-18 8-18-8Z" fill="#1f5fd0" />
    <path d="M58 18v14" stroke="#2f7bf5" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
const EyeIcon = ({ off }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M3 3l18 18" />}
  </svg>
);
const CalendarIcon = () => (
  <svg className="rg-icon-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M3 9h18M8 2v4M16 2v4" />
  </svg>
);
const ImageIcon = () => (
  <svg className="rg-drop-icon" viewBox="0 0 64 64" fill="none">
    <rect x="5" y="7" width="54" height="50" rx="8" stroke="currentColor" strokeWidth="4" />
    <circle cx="22" cy="23" r="5" fill="currentColor" />
    <path d="M7 50l16-16 11 11 9-9 14 14" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" fill="rgba(47,123,245,0.18)" />
  </svg>
);
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 8.5 4 4 0 0 1 17.5 18" />
    <path d="M12 12v8M9 15l3-3 3 3" />
  </svg>
);

function Register() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    gender: "",
    mobile: "",
    dob: "",
    rollNo: "",
    password: "",
    confirmPassword: "",
    college: "",
    branch: "",
    role: "student",
  });
  const [image, setImage] = useState(null); // base64 data URL
  const [imageName, setImageName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  /* ---------- image handling ---------- */
  const handleFile = (file) => {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setErrors((p) => ({ ...p, image: "Only JPG and PNG images are allowed" }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((p) => ({ ...p, image: "Image must be 2MB or smaller" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setImageName(file.name);
      setErrors((p) => ({ ...p, image: "" }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImageName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  /* ---------- validation ---------- */
  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.gender) e.gender = "Please select your gender";
    if (!form.mobile.trim()) e.mobile = "Mobile number is required";
    else if (!/^[0-9]{10}$/.test(form.mobile)) e.mobile = "Enter a valid 10-digit mobile number";
    if (!form.dob) e.dob = "Date of birth is required";
    else if (new Date(form.dob) > new Date()) e.dob = "Date of birth cannot be in the future";
    if (!form.rollNo.trim()) e.rollNo = "Roll number is required";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < MIN_PASSWORD_LENGTH)
      e.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!form.college.trim()) e.college = "College name is required";
    if (!form.branch.trim()) e.branch = "Branch name is required";
    return e;
  };

  /* ---------- submit ---------- */
  const register = async () => {
    setBanner({ type: "", text: "" });
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    // "Full Name" -> firstname + lastname (backend stores them separately)
    const parts = form.fullName.trim().split(/\s+/);
    const firstname = parts[0];
    const lastname = parts.slice(1).join(" ");

    const payload = {
      firstname,
      lastname,
      email: form.email.trim(),
      gender: form.gender,
      mobile: form.mobile.trim(),
      dob: form.dob, // yyyy-mm-dd
      rollNo: form.rollNo.trim(),
      college: form.college.trim(),
      branch: form.branch.trim(),
      password: form.password,
      role: form.role,
      profileImage: image, // base64 data URL or null
    };

    setLoading(true);
    try {
      await api.post("/api/auth/register", payload);
      setBanner({ type: "ok", text: "Registered successfully! Redirecting to login..." });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        setErrors({ email: "This email is already registered" });
        setBanner({ type: "err", text: "This email is already registered. Please login instead." });
      } else {
        setBanner({ type: "err", text: "Registration failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (name) => `rg-input ${errors[name] ? "has-error" : ""}`;

  return (
    <div className="rg-page">
      {/* ===== LOGO ===== */}
      <Link to="/" className="rg-logo">
        <CapIcon />
        <div>Learn<span>IQ</span></div>
      </Link>

      {/* ===== CARD ===== */}
      <div className="rg-card">
        <h1 className="rg-title">Student Registration</h1>

        {banner.text && <div className={`rg-alert ${banner.type}`}>{banner.text}</div>}

        <div className="rg-grid">
          {/* Full Name */}
          <div>
            <label className="rg-label">Full Name</label>
            <input
              className={field("fullName")}
              name="fullName"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={handleChange}
            />
            {errors.fullName && <div className="rg-error">{errors.fullName}</div>}
          </div>

          {/* Email */}
          <div>
            <label className="rg-label">Email</label>
            <input
              className={field("email")}
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <div className="rg-error">{errors.email}</div>}
          </div>

          {/* Gender */}
          <div>
            <label className="rg-label">Gender</label>
            <select
              className={`${field("gender")} rg-select ${form.gender ? "" : "is-empty"}`}
              name="gender"
              value={form.gender}
              onChange={handleChange}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <div className="rg-error">{errors.gender}</div>}
          </div>

          {/* Mobile */}
          <div>
            <label className="rg-label">Mobile No</label>
            <input
              className={field("mobile")}
              name="mobile"
              inputMode="numeric"
              maxLength={10}
              placeholder="Enter your mobile number"
              value={form.mobile}
              onChange={(e) =>
                handleChange({ target: { name: "mobile", value: e.target.value.replace(/\D/g, "") } })
              }
            />
            {errors.mobile && <div className="rg-error">{errors.mobile}</div>}
          </div>

          {/* DOB */}
          <div>
            <label className="rg-label">Date of Birth (DOB)</label>
            <div className="rg-input-wrap">
              <input
                className={`${field("dob")} rg-date ${form.dob ? "" : "is-empty"}`}
                type="date"
                name="dob"
                max={new Date().toLocaleDateString("en-CA")}
                value={form.dob}
                onChange={handleChange}
              />
              <CalendarIcon />
            </div>
            {errors.dob && <div className="rg-error">{errors.dob}</div>}
          </div>

          {/* Roll No */}
          <div>
            <label className="rg-label">Roll No</label>
            <input
              className={field("rollNo")}
              name="rollNo"
              placeholder="Enter your roll number"
              value={form.rollNo}
              onChange={handleChange}
            />
            {errors.rollNo && <div className="rg-error">{errors.rollNo}</div>}
          </div>

          {/* Password */}
          <div>
            <label className="rg-label">Password</label>
            <div className="rg-input-wrap">
              <input
                className={field("password")}
                type={showPass ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
              />
              <button type="button" className="rg-eye" onClick={() => setShowPass(!showPass)}>
                <EyeIcon off={showPass} />
              </button>
            </div>
            {errors.password && <div className="rg-error">{errors.password}</div>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="rg-label">Confirm Password</label>
            <div className="rg-input-wrap">
              <input
                className={field("confirmPassword")}
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
              <button type="button" className="rg-eye" onClick={() => setShowConfirm(!showConfirm)}>
                <EyeIcon off={showConfirm} />
              </button>
            </div>
            {errors.confirmPassword && <div className="rg-error">{errors.confirmPassword}</div>}
          </div>

          {/* College */}
          <div>
            <label className="rg-label">College</label>
            <input
              className={field("college")}
              name="college"
              placeholder="Enter your college name"
              value={form.college}
              onChange={handleChange}
            />
            {errors.college && <div className="rg-error">{errors.college}</div>}
          </div>

          {/* Branch */}
          <div>
            <label className="rg-label">Branch</label>
            <input
              className={field("branch")}
              name="branch"
              placeholder="Enter your branch name"
              value={form.branch}
              onChange={handleChange}
            />
            {errors.branch && <div className="rg-error">{errors.branch}</div>}
          </div>

          {/* Upload Profile Image */}
          <div className="rg-full">
            <label className="rg-label">Upload Profile Image</label>
            <div
              className={`rg-drop ${dragging ? "drag" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
            >
              {image ? <img src={image} alt="Profile preview" className="rg-preview" /> : <ImageIcon />}

              <div className="rg-drop-text">
                <div className="rg-drop-title">
                  {image ? imageName : "Choose an image or drag and drop"}
                </div>
                <div className="rg-drop-hint">JPG, PNG (Max 2MB)</div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  hidden
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <button type="button" className="rg-file-btn" onClick={() => fileRef.current?.click()}>
                  <UploadIcon /> Choose File
                </button>
                {image && (
                  <button type="button" className="rg-remove" onClick={removeImage}>
                    Remove
                  </button>
                )}
              </div>
            </div>
            {errors.image && <div className="rg-error">{errors.image}</div>}
          </div>

          {/* Role */}
          <div className="rg-full">
            <label className="rg-label">Role</label>
            <div className="rg-role">
              <label className="rg-radio">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={form.role === "student"}
                  onChange={handleChange}
                />
                <span className="dot" /> Student
              </label>
              <label className="rg-radio">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={form.role === "admin"}
                  onChange={handleChange}
                />
                <span className="dot" /> Admin
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="rg-full">
            <button className="rg-btn" onClick={register} disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </div>

        <div className="rg-foot">
          Already have an account? <Link to="/login">Login Here</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;