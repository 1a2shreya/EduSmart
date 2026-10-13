import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "./Api";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/dashboard");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await api.post("/api/login/", {
        username: username.trim(),
        password: password.trim(),
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);

      if (!res.data.is_verified) {
        setMessage({ type: "warning", text: "Please verify the OTP sent to your email." });
        navigate("/verify");
      } else {
        setMessage({ type: "success", text: "Login successful!" });
        setTimeout(() => navigate("/dashboard"), 500);
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Invalid login credentials.";
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
          <h2 className="fw-bold mb-1">Welcome Back</h2>
          <p className="text-muted">Sign in to continue your learning journey</p>
        </div>

        <div className="glass-card-static p-4 fade-in-up fade-in-up-delay-1"
          style={{ borderTop: "2px solid var(--accent-primary)" }}>

          {message.text && (
            <div className={`alert alert-${message.type} mb-3`} style={{ fontSize: "0.9rem" }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <div className="position-relative">
                <i className="bi bi-person position-absolute" style={{
                  left: 14, top: "50%", transform: "translateY(-50%)",
                  color: "var(--text-muted)", fontSize: "1.1rem"
                }}></i>
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: "2.5rem" }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  autoFocus
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
                  className="form-control"
                  style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
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
            </div>

            <div className="text-end mb-4">
              <Link to="/forgot-password" className="text-muted" style={{ fontSize: "0.85rem" }}>
                Forgot password?
              </Link>
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
                <i className="bi bi-arrow-right-circle me-2"></i>
              )}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="separator"></div>

          <div className="text-center">
            <p className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>Don't have an account?</p>
            <Link to="/register" className="btn btn-outline-primary w-100 py-2 fw-semibold">
              <i className="bi bi-person-plus me-1"></i> Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}