import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "./Api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await api.post("/api/forgot-password/", { email });
      setMessage({ type: "success", text: res.data.message || "OTP sent to your email." });
      setStep(2);
    } catch (err) {
      setMessage({ type: "danger", text: err.response?.data?.error || "Failed to send OTP." });
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "danger", text: "Passwords do not match." });
      return;
    }
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await api.post("/api/reset-password/", {
        email, otp, new_password: newPassword
      });
      setMessage({ type: "success", text: res.data.message || "Password reset successful!" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage({ type: "danger", text: err.response?.data?.error || "Password reset failed." });
    }
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5">
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
          <h2 className="fw-bold mb-1">{step === 1 ? "Forgot Password" : "Reset Password"}</h2>
          <p className="text-muted">
            {step === 1 ? "Enter your email to receive a reset OTP" : "Enter OTP and your new password"}
          </p>
        </div>

        <div className="glass-card-static p-4 fade-in-up fade-in-up-delay-1"
          style={{ borderTop: "2px solid var(--accent-primary)" }}>

          {message.text && (
            <div className={`alert alert-${message.type} mb-3`} style={{ fontSize: "0.9rem" }}>
              {message.text}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <label className="form-label">Email Address</label>
                <div className="position-relative">
                  <i className="bi bi-envelope position-absolute" style={{
                    left: 14, top: "50%", transform: "translateY(-50%)",
                    color: "var(--text-muted)", fontSize: "1.1rem"
                  }}></i>
                  <input type="email" className="form-control" style={{ paddingLeft: "2.5rem" }}
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email" required autoFocus />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold ripple"
                disabled={loading} style={{ fontSize: "0.95rem" }}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> :
                  <i className="bi bi-send me-2"></i>}
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword}>
              <div className="mb-3">
                <label className="form-label">OTP Code</label>
                <div className="position-relative">
                  <i className="bi bi-shield-lock position-absolute" style={{
                    left: 14, top: "50%", transform: "translateY(-50%)",
                    color: "var(--text-muted)", fontSize: "1.1rem"
                  }}></i>
                  <input type="text" className="form-control" style={{ paddingLeft: "2.5rem" }}
                    value={otp} onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP" required autoFocus maxLength="6" />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <div className="position-relative">
                  <i className="bi bi-lock position-absolute" style={{
                    left: 14, top: "50%", transform: "translateY(-50%)",
                    color: "var(--text-muted)", fontSize: "1.1rem"
                  }}></i>
                  <input type="password" className="form-control" style={{ paddingLeft: "2.5rem" }}
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password" required />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label">Confirm Password</label>
                <div className="position-relative">
                  <i className="bi bi-lock-fill position-absolute" style={{
                    left: 14, top: "50%", transform: "translateY(-50%)",
                    color: "var(--text-muted)", fontSize: "1.1rem"
                  }}></i>
                  <input type="password" className="form-control" style={{ paddingLeft: "2.5rem" }}
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password" required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold ripple"
                disabled={loading} style={{ fontSize: "0.95rem" }}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> :
                  <i className="bi bi-key me-2"></i>}
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              <button type="button" className="btn btn-outline-secondary w-100 mt-2 py-2"
                onClick={() => setStep(1)}>
                <i className="bi bi-arrow-left me-1"></i> Back
              </button>
            </form>
          )}

          <div className="separator"></div>

          <div className="text-center">
            <p className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>Remember your password?</p>
            <Link to="/login" className="btn btn-outline-primary w-100 py-2 fw-semibold">
              <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}