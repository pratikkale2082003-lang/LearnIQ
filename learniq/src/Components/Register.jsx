import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    role: "student",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const register = async () => {
    if (!user.firstname || !user.lastname || !user.email || !user.password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        "http://localhost:8086/api/auth/register",
        user,
        { headers: { "Content-Type": "application/json" } }
      );

      alert("Registered Successfully ✅");

      // 🔀 Role based redirect
      if (user.role === "student") {
        navigate("/student");
      } else {
        navigate("/admin");
      }

    } catch (error) {
      console.error(error);
      alert("Registration failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 mx-auto mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="text-center mb-3">Register</h3>

      <input
        type="text"
        name="firstname"
        className="form-control mb-2"
        placeholder="First Name"
        value={user.firstname}
        onChange={handleChange}
      />

      <input
        type="text"
        name="lastname"
        className="form-control mb-2"
        placeholder="Last Name"
        value={user.lastname}
        onChange={handleChange}
      />

      <input
        type="email"
        name="email"
        className="form-control mb-2"
        placeholder="Email"
        value={user.email}
        onChange={handleChange}
      />

      <input
        type="password"
        name="password"
        className="form-control mb-2"
        placeholder="Password"
        value={user.password}
        onChange={handleChange}
      />

      <select
        name="role"
        className="form-control mb-3"
        value={user.role}
        onChange={handleChange}
      >
        <option value="student">Student</option>
        <option value="admin">Admin</option>
      </select>

      <button
        className="btn btn-success w-100"
        onClick={register}
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
}

export default Register;
