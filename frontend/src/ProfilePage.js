import React, { useState, useEffect } from "react";
import api from "./Api";

export default function ProfilePage() {
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/profile/")
      .then((res) => {
        setProfile(res.data);
        setFormData({ username: res.data.username || "", email: res.data.email || "" });
        setLoading(false);
      })
      .catch(() => {
        setMessage({ type: "danger", text: "Could not load profile." });
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setFormData({ ...formData, [name]: files[0] });
      setPreviewImage(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = async () => {
    const body = new FormData();
    Object.entries(formData).forEach(([key, value]) => body.append(key, value));

    try {
      const res = await api.put("/api/profile/edit/", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(res.data);
      if (res.data.username) localStorage.setItem("username", res.data.username);
      setEditMode(false);
      setPreviewImage(null);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "danger", text: err.response?.data?.error || "Failed to update profile." });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border" style={{ color: "var(--accent-primary)" }} role="status"></div>
      </div>
    );
  }

  const initials = (profile.username || "U").slice(0, 2).toUpperCase();

  return (
    <div className="container py-5" style={{ maxWidth: "600px" }}>
      {/* Page Header */}
      <div className="text-center mb-4 fade-in-up">
        <h2 className="fw-bold mb-1">
          My <span className="gradient-text">Profile</span>
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>Manage your account settings</p>
      </div>

      {/* Alerts */}
      {message.text && (
        <div className={`alert alert-${message.type} fade-in-up`} role="alert" style={{ fontSize: "0.9rem" }}>
          <div className="d-flex align-items-center justify-content-between">
            {message.text}
            <button type="button" className="btn-close" onClick={() => setMessage({ type: "", text: "" })}></button>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="glass-card-static p-4 fade-in-up fade-in-up-delay-1"
        style={{ borderTop: "2px solid var(--accent-primary)" }}>

        {/* Avatar */}
        <div className="text-center mb-4">
          {previewImage || profile.avatar ? (
            <img
              src={previewImage || profile.avatar}
              alt="Profile"
              style={{
                width: 100, height: 100, borderRadius: "50%", objectFit: "cover",
                border: "3px solid var(--accent-primary)",
                boxShadow: "0 0 25px rgba(99,102,241,0.3)",
              }}
            />
          ) : (
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              background: "var(--gradient-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem", fontWeight: 700, color: "white",
              margin: "0 auto",
              boxShadow: "0 0 25px rgba(99,102,241,0.3)",
            }}>
              {initials}
            </div>
          )}
        </div>

        {editMode ? (
          <>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input type="text" name="username" className="form-control"
                value={formData.username || ""} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-control"
                value={formData.email || ""} onChange={handleChange} />
            </div>
            <div className="mb-4">
              <label className="form-label">Profile Picture</label>
              <input type="file" name="avatar" className="form-control"
                accept="image/*" onChange={handleChange} />
            </div>
            <div className="d-flex gap-2">
              <button className="btn-gradient flex-fill py-2" onClick={handleSave}>
                <i className="bi bi-check-lg me-1"></i> Save Changes
              </button>
              <button className="btn-glass flex-fill py-2"
                onClick={() => { setEditMode(false); setPreviewImage(null); }}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h4 className="text-center fw-bold mb-1" style={{ color: "var(--text-primary)" }}>{profile.username}</h4>
            <p className="text-center mb-3" style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{profile.email}</p>

            <div className="text-center mb-3">
              <span className="badge" style={{
                background: profile.is_verified ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                color: profile.is_verified ? "#10b981" : "#ef4444",
                fontWeight: 500, padding: "6px 14px", borderRadius: "var(--radius-full)",
              }}>
                <i className={`bi ${profile.is_verified ? "bi-check-circle-fill" : "bi-x-circle-fill"} me-1`}></i>
                {profile.is_verified ? "Verified" : "Not Verified"}
              </span>
            </div>

            {profile.last_login && (
              <p className="text-center mb-4" style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                <i className="bi bi-clock me-1"></i>
                Last login: {new Date(profile.last_login).toLocaleString()}
              </p>
            )}

            <div className="text-center">
              <button className="btn-gradient px-4 py-2" onClick={() => setEditMode(true)}>
                <i className="bi bi-pencil me-2"></i> Edit Profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
