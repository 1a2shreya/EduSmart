import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "./Api";

export default function Verify() {
  const navigate = useNavigate();
  const [username] = useState(localStorage.getItem("username") || "");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await api.post("/api/verify-otp/", { username, otp });
      setMessage({ type: "success", text: "Account verified successfully!" });
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      const msg = err.response?.data?.error || "Invalid OTP, please try again.";
      setMessage({ type: "danger", text: msg });
    }
    setLoading(false);
  };

  const handleResend = async () => {
    try {
      await api.post("/api/resend-otp/", { username });
      setMessage({ type: "info", text: "OTP resent to your registered email." });
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to resend OTP.";
      setMessage({ type: "danger", text: msg });
    }
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
          <h2 className="fw-bold mb-1">Verify Account</h2>
          <p className="text-muted">Enter the OTP sent to <strong>{username}</strong></p>
        </div>

        <div className="glass-card-static p-4 fade-in-up fade-in-up-delay-1"
          style={{ borderTop: "2px solid var(--accent-success)" }}>

          {message.text && (
            <div className={`alert alert-${message.type} mb-3`} style={{ fontSize: "0.9rem" }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div className="mb-4">
              <label className="form-label">OTP Code</label>
              <div className="position-relative">
                <i className="bi bi-shield-lock position-absolute" style={{
                  left: 14, top: "50%", transform: "translateY(-50%)",
                  color: "var(--text-muted)", fontSize: "1.1rem"
                }}></i>
                <input
                  type="text"
                  className="form-control text-center"
                  style={{ paddingLeft: "2.5rem", fontSize: "1.2rem", letterSpacing: "0.3em" }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  placeholder="000000"
                  maxLength="6"
                  autoFocus
                />
              </div>
            </div>

            <button type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold ripple"
              disabled={loading} style={{ fontSize: "0.95rem" }}>
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i className="bi bi-check-circle me-2"></i>
              )}
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>

          <div className="separator"></div>

          <div className="text-center">
            <p className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>Didn't receive the OTP?</p>
            <button className="btn btn-outline-primary w-100 py-2 fw-semibold" onClick={handleResend}>
              <i className="bi bi-arrow-repeat me-1"></i> Resend OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}