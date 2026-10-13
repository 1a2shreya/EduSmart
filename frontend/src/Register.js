import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "./Api";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "", email: "", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { username, email, password, confirmPassword } = formData;
    if (!username || !email || !password || !confirmPassword)
      return "All fields are required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Please enter a valid email address.";
    if (password.length < 8)
      return "Password must be at least 8 characters.";
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/.test(password))
      return "Password needs uppercase, number & special character.";
    if (password !== confirmPassword)
      return "Passwords do not match.";
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: "danger", text: validationError });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/register/", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.user.username);

      setMessage({ type: "success", text: "Registration successful! Please verify your OTP." });
      setTimeout(() => navigate("/verify"), 1500);
    } catch (err) {
      const data = err.response?.data || {};
      const msg = data.username?.[0] || data.email?.[0] || data.error || "Registration failed.";
      setMessage({ type: "danger", text: msg });
    }
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5">
      {/* Background effects */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.08), transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(139,92,246,0.06), transparent 60%)"
      }}></div>

      <div className="container position-relative" style={{ zIndex: 1, maxWidth: "440px" }}>
        <div className="text-center mb-4 fade-in-up">
          <Link to="/" className="text-decoration-none">
            <div className="d-inline-flex align-items-center mb-3">
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: "var(--gradient-primary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.2rem", color: "white", boxShadow: "0 0 20px rgba(99,102,241,0.3)"
              }}>
                <i className="bi bi-mortarboard-fill"></i>
              </div>
              <span className="ms-2 fw-bold fs-4 gradient-text">EduSmart</span>
            </div>
          </Link>
          <h2 className="fw-bold mb-1">Create Account</h2>
          <p className="text-muted">Join EduSmart and start your learning journey</p>
        </div>

        <div className="glass-card-static p-4 fade-in-up fade-in-up-delay-1"
          style={{ borderTop: "2px solid var(--accent-success)" }}>

          {message.text && (
            <div className={`alert alert-${message.type} mb-3`} style={{ fontSize: "0.9rem" }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <div className="position-relative">
                <i className="bi bi-person position-absolute" style={{
                  left: 14, top: "50%", transform: "translateY(-50%)",
                  color: "var(--text-muted)", fontSize: "1.1rem"
                }}></i>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  style={{ paddingLeft: "2.5rem" }}
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <div className="position-relative">
                <i className="bi bi-envelope position-absolute" style={{
                  left: 14, top: "50%", transform: "translateY(-50%)",
                  color: "var(--text-muted)", fontSize: "1.1rem"
                }}></i>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  style={{ paddingLeft: "2.5rem" }}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="position-relative">
                <i className="bi bi-lock position-absolute" style={{
                  left: 14, top: "50%", transform: "translateY(-50%)",
                  color: "var(--text-muted)", fontSize: "1.1rem"
                }}></i>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control"
                  style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter strong password"
                  required
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute p-0"
                  style={{ right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
              <small style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                Min 8 chars, include uppercase, number & special character.
              </small>
            </div>

            <div className="mb-4">
              <label className="form-label">Confirm Password</label>
              <div className="position-relative">
                <i className="bi bi-lock-fill position-absolute" style={{
                  left: 14, top: "50%", transform: "translateY(-50%)",
                  color: "var(--text-muted)", fontSize: "1.1rem"
                }}></i>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="form-control"
                  style={{ paddingLeft: "2.5rem" }}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold ripple"
              disabled={loading}
              style={{ fontSize: "0.95rem" }}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i className="bi bi-person-plus me-2"></i>
              )}
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="separator"></div>

          <div className="text-center">
            <p className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>Already have an account?</p>
            <Link to="/login" className="btn btn-outline-primary w-100 py-2 fw-semibold">
              <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}