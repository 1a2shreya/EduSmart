import React, { useEffect, useState } from "react";
import api from "./Api";

const ACTIVITY_ICONS = {
  note: "bi-journal-text",
  quiz: "bi-lightning-charge-fill",
  plan: "bi-calendar2-check",
  career: "bi-compass-fill",
  login: "bi-box-arrow-in-right",
};

const ACTIVITY_COLORS = {
  note: "#10b981",
  quiz: "#f59e0b",
  plan: "#06b6d4",
  career: "#8b5cf6",
  login: "#6366f1",
};

export default function ActivityPage() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/dashboard/")
      .then(res => {
        setActivity(res.data.activity || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" style={{ color: "var(--accent-primary)" }} role="status"></div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: "800px" }}>
      {/* Page Header */}
      <div className="mb-5 fade-in-up">
        <h2 className="fw-bold mb-1">
          <span className="gradient-text">Activity</span> Timeline
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>Your recent learning activity</p>
      </div>

      {/* Activity List */}
      <div className="glass-card-static p-4 fade-in-up fade-in-up-delay-1">
        {activity.length > 0 ? (
          <div className="d-flex flex-column gap-2">
            {activity.map((a, idx) => {
              const type = a.type?.toLowerCase() || "note";
              const icon = ACTIVITY_ICONS[type] || "bi-activity";
              const color = ACTIVITY_COLORS[type] || "#6366f1";
              return (
                <div key={idx} className="d-flex align-items-center p-3" style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  transition: "all 0.3s ease",
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: `${color}15`, color: color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1rem", flexShrink: 0,
                  }}>
                    <i className={`bi ${icon}`}></i>
                  </div>
                  <div className="ms-3 flex-grow-1" style={{ minWidth: 0 }}>
                    <div style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 500 }}>
                      {a.message}
                    </div>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <span className="badge" style={{
                        background: `${color}15`, color: color,
                        fontWeight: 500, fontSize: "0.7rem", textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}>
                        {a.type}
                      </span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                        {new Date(a.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-clock-history" style={{ fontSize: "3rem", color: "var(--text-muted)" }}></i>
            <p className="mt-3" style={{ color: "var(--text-muted)" }}>No activity yet. Start learning to see your progress here!</p>
          </div>
        )}
      </div>
    </div>
  );
}