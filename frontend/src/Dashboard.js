import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, CartesianGrid
} from "recharts";
import { useNavigate } from "react-router-dom";
import api from "./Api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/dashboard/")
      .then(res => setData(res.data))
      .catch(err => console.error("Dashboard fetch error:", err));
  }, []);

  if (!data) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" style={{ color: "var(--accent-primary)" }} role="status"></div>
      </div>
    );
  }

  const studyPlanData = (data.study_plan_breakdown || []).length > 0 
    ? data.study_plan_breakdown 
    : (data.study_plans || []).map(sp => ({
        name: sp.career || sp.plan_type?.replace("_", " ") || "Plan",
        progress: sp.progress || 0,
      }));

  const quizScoresData = (data.recent_attempts || []).slice().reverse().map((attempt, index) => ({
    name: attempt.note ? attempt.note.substring(0, 10) + "..." : `Quiz ${index + 1}`,
    score: attempt.score
  }));

  const lastCareer = data.career_quiz?.career;
  const leaderboard = data.leaderboard || [];

  const statCards = [
    { icon: "bi-journal-text", label: "Total Notes", value: data.notes_count, color: "#10b981", gradient: "linear-gradient(135deg, #10b981, #06b6d4)" },
    { icon: "bi-calendar2-check", label: "Study Plans", value: (data.study_plans || []).length, color: "#06b6d4", gradient: "linear-gradient(135deg, #06b6d4, #6366f1)" },
    { icon: "bi-compass-fill", label: "Latest Career", value: lastCareer || "Take quiz!", color: "#f59e0b", gradient: "linear-gradient(135deg, #f59e0b, #ef4444)" },
    { icon: "bi-lightning-charge-fill", label: "Quiz Attempts", value: data.recent_attempts?.length || 0, color: "#ec4899", gradient: "linear-gradient(135deg, #ec4899, #f43f5e)" },
  ];

  const customTooltipStyle = {
    backgroundColor: "rgba(17,17,24,0.95)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    color: "#f1f5f9",
    fontSize: "0.85rem",
  };

  return (
    <div className="container py-5">
      {/* Page Header */}
      <div className="mb-5 fade-in-up">
        <h2 className="fw-bold mb-1">
          Welcome back, <span className="gradient-text">{data.user?.username}</span>
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>Here's your learning progress overview</p>
      </div>

      {/* Stat Cards */}
      <div className="row g-4 mb-5">
        {statCards.map((s, i) => (
          <div key={i} className={`col-sm-6 col-lg-3 fade-in-up fade-in-up-delay-${i + 1}`}>
            <div className="glass-card p-4 h-100" style={{ borderTop: `2px solid ${s.color}` }}>
              <div className="d-flex align-items-center mb-3">
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: s.gradient,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.2rem", color: "white",
                  boxShadow: `0 0 20px ${s.color}33`,
                }}>
                  <i className={`bi ${s.icon}`}></i>
                </div>
                <span className="ms-3" style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 500 }}>
                  {s.label}
                </span>
              </div>
              <div className="fw-bold fs-4" style={{ color: "var(--text-primary)" }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-5">
        <div className="col-lg-4 fade-in-up fade-in-up-delay-2">
          <div className="glass-card-static p-4 h-100">
            <h5 className="fw-bold mb-4" style={{ color: "var(--text-primary)" }}>
              <i className="bi bi-bar-chart-fill me-2" style={{ color: "var(--accent-primary)" }}></i>
              Plan Progress
            </h5>
            {studyPlanData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={studyPlanData}>
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} />
                  <Tooltip contentStyle={customTooltipStyle} formatter={(v) => `${v}%`} />
                  <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "0.85rem" }} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="progress" fill="url(#barGrad)" name="Progress %" radius={[6, 6, 0, 0]} minPointSize={3} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-calendar-plus" style={{ fontSize: "2.5rem", color: "var(--text-muted)" }}></i>
                <p className="mt-3" style={{ color: "var(--text-muted)" }}>No study plans yet.</p>
                <button className="btn-gradient px-4 py-2" onClick={() => navigate("/study-plan")}>
                  Generate a Plan
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-4 fade-in-up fade-in-up-delay-3">
          <div className="glass-card-static p-4 h-100">
            <h5 className="fw-bold mb-4" style={{ color: "var(--text-primary)" }}>
              <i className="bi bi-activity me-2" style={{ color: "#ec4899" }}></i>
              Quiz Score Trend
            </h5>
            {quizScoresData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={quizScoresData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} />
                  <Tooltip contentStyle={customTooltipStyle} formatter={(v) => `${v}%`} />
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                  </defs>
                  <Line type="monotone" dataKey="score" stroke="url(#lineGrad)" strokeWidth={3} dot={{ fill: "#ec4899", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Score %" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-lightning" style={{ fontSize: "2.5rem", color: "var(--text-muted)" }}></i>
                <p className="mt-3" style={{ color: "var(--text-muted)" }}>No quizzes taken yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-4 fade-in-up fade-in-up-delay-3">
          <div className="glass-card-static p-4 h-100">
            <h5 className="fw-bold mb-4" style={{ color: "var(--text-primary)" }}>
              <i className="bi bi-pie-chart-fill me-2" style={{ color: "#10b981" }}></i>
              Overall Progress
            </h5>
            {data.overall_progress > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Completed", value: data.overall_progress },
                      { name: "Remaining", value: 100 - data.overall_progress }
                    ]}
                    dataKey="value"
                    cx="50%" cy="50%" outerRadius={90} innerRadius={55}
                    label={false}
                    stroke="none"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="rgba(255,255,255,0.06)" />
                  </Pie>
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "0.85rem" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-graph-up" style={{ fontSize: "2.5rem", color: "var(--text-muted)" }}></i>
                <p className="mt-3" style={{ color: "var(--text-muted)" }}>Start a study plan to track progress.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity + Jobs */}
      <div className="row g-4 mb-5">
        <div className="col-lg-6 fade-in-up fade-in-up-delay-4">
          <div className="row g-4 h-100">
            <div className="col-12 h-50">
              <div className="glass-card-static p-4 h-100">
                <h5 className="fw-bold mb-4" style={{ color: "var(--text-primary)" }}>
                  <i className="bi bi-clock-history me-2" style={{ color: "#06b6d4" }}></i>
                  Recent Activity
                </h5>
                {(data.activity || []).length > 0 ? (
                  <div className="d-flex flex-column gap-2" style={{ overflowY: "auto", maxHeight: "150px" }}>
                    {data.activity.slice(0, 3).map((a, idx) => (
                      <div key={idx} className="d-flex align-items-center p-3" style={{
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: "rgba(6,182,212,0.1)", color: "#06b6d4",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.9rem", flexShrink: 0,
                        }}>
                          <i className="bi bi-activity"></i>
                        </div>
                        <div className="ms-3 flex-grow-1" style={{ minWidth: 0 }}>
                          <div style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 500 }}>
                            {a.message}
                          </div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                            {a.type?.toUpperCase()} • {new Date(a.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-muted)" }}>No recent activity.</p>
                )}
                <button className="btn btn-outline-primary btn-sm mt-3" onClick={() => navigate("/activity")}>
                  <i className="bi bi-arrow-right me-1"></i> View All
                </button>
              </div>
            </div>

            <div className="col-12 h-50 pt-2">
              <div className="glass-card-static p-4 h-100">
                <h5 className="fw-bold mb-4" style={{ color: "var(--text-primary)" }}>
                  <i className="bi bi-lightning-fill me-2" style={{ color: "#ec4899" }}></i>
                  Recent Quiz Scores
                </h5>
                {(data.recent_attempts || []).length > 0 ? (
                  <div className="d-flex flex-column gap-2" style={{ overflowY: "auto", maxHeight: "150px" }}>
                    {data.recent_attempts.slice(0, 3).map((a, idx) => (
                      <div key={idx} className="d-flex align-items-center justify-content-between p-3" style={{
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}>
                        <div>
                          <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>{a.note}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{new Date(a.date).toLocaleDateString()}</div>
                        </div>
                        <span className="badge" style={{ 
                          background: a.score >= 80 ? "rgba(16,185,129,0.15)" : a.score >= 50 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)", 
                          color: a.score >= 80 ? "#10b981" : a.score >= 50 ? "#f59e0b" : "#ef4444", 
                          fontWeight: 600 
                        }}>
                          {a.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-muted)" }}>No quizzes taken yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6 fade-in-up fade-in-up-delay-5">
          <div className="glass-card-static p-4 h-100">
            <h5 className="fw-bold mb-4" style={{ color: "var(--text-primary)" }}>
              <i className="bi bi-briefcase-fill me-2" style={{ color: "#f59e0b" }}></i>
              Recommended Jobs
            </h5>
            {(data.jobs || []).length > 0 ? (
              <div className="d-flex flex-column gap-2" style={{ overflowY: "auto", height: "400px" }}>
                {data.jobs.slice(0, 5).map((job, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between p-3" style={{
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <div>
                      <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>{job.title}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        <i className="bi bi-building me-1"></i> {job.company}
                      </div>
                      {job.location && (
                        <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "2px" }}>
                          <i className="bi bi-geo-alt-fill me-1" style={{ color: "#06b6d4" }}></i> {job.location}
                        </div>
                      )}
                    </div>
                    <span className="badge ms-2" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", fontWeight: 500, alignSelf:"flex-start" }}>
                      {job.salary}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", height: "354px" }}>Take the career quiz to get job recommendations.</p>
            )}
            <button className="btn btn-outline-success btn-sm mt-3" onClick={() => navigate("/jobs")}>
              <i className="bi bi-arrow-right me-1"></i> View All Jobs
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="fade-in-up fade-in-up-delay-6">
        <div className="glass-card-static p-4">
          <h5 className="fw-bold mb-4" style={{ color: "var(--text-primary)" }}>
            <i className="bi bi-trophy-fill me-2" style={{ color: "#f59e0b" }}></i>
            Leaderboard — Top Learners
          </h5>
          {leaderboard.length > 0 ? (
            <div className="d-flex flex-column gap-2">
              {leaderboard.map((u, idx) => (
                <div key={idx} className="d-flex align-items-center justify-content-between p-3" style={{
                  background: idx === 0 ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.03)",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${idx === 0 ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)"}`,
                }}>
                  <div className="d-flex align-items-center">
                      {u.avatar ? (
                        <img 
                          src={u.avatar} 
                          alt="avatar"
                          style={{
                            width: 32, height: 32, borderRadius: "50%",
                            objectFit: "cover",
                            border: idx === 0 ? "2px solid #f59e0b" : idx === 1 ? "2px solid #94a3b8" : idx === 2 ? "2px solid #b45309" : "none"
                          }}
                        />
                      ) : (
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: idx === 0 ? "var(--gradient-primary)" : "rgba(255,255,255,0.06)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.85rem", fontWeight: 700,
                          color: idx === 0 ? "white" : "var(--text-muted)",
                          border: idx === 0 ? "2px solid #f59e0b" : idx === 1 ? "2px solid #94a3b8" : idx === 2 ? "2px solid #b45309" : "none"
                        }}>
                          {idx + 1}
                        </div>
                      )}
                    <div className="ms-3">
                      <span className="fw-bold" style={{ color: "var(--text-primary)" }}>
                        {u.username} 
                        {idx === 0 && <span className="ms-2" title="1st Place">🥇</span>}
                        {idx === 1 && <span className="ms-2" title="2nd Place">🥈</span>}
                        {idx === 2 && <span className="ms-2" title="3rd Place">🥉</span>}
                      </span>
                      <span className="ms-2" style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "2px" }}>
                        Score: <strong style={{color:"#10b981"}}>{u.total_score}</strong> — {u.attempts} attempt{u.attempts !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <span className="badge" style={{
                    background: idx === 0 ? "var(--gradient-primary)" : "rgba(99,102,241,0.15)",
                    color: idx === 0 ? "white" : "var(--accent-primary)",
                    fontWeight: 600, fontSize: "0.85rem", padding: "6px 12px",
                  }}>
                    {u.avg_score}% avg
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)" }}>No quiz attempts yet — be the first!</p>
          )}
        </div>
      </div>
    </div>
  );
}