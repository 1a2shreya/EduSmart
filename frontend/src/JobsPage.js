import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./Api";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [career, setCareer] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/jobs/")
      .then(res => {
        setJobs(res.data.jobs || []);
        setCareer(res.data.career || "");
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
    <div className="container py-5" style={{ maxWidth: "900px" }}>
      {/* Page Header */}
      <div className="mb-5 fade-in-up">
        <h2 className="fw-bold mb-1">
          Recommended <span className="gradient-text">Jobs</span>
        </h2>
        {career ? (
          <p style={{ color: "var(--text-secondary)" }}>
            Based on your career interest: <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>{career}</span>
          </p>
        ) : (
          <p style={{ color: "var(--text-secondary)" }}>Take the career quiz to get personalized recommendations</p>
        )}
      </div>

      {/* Jobs Grid */}
      {jobs.length > 0 ? (
        <div className="row g-4">
          {jobs.map((job, idx) => (
            <div key={idx} className={`col-md-6 fade-in-up fade-in-up-delay-${Math.min(idx + 1, 6)}`}>
              <div className="glass-card p-4 h-100" style={{ borderLeft: "3px solid var(--accent-success)" }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>{job.title}</h6>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      <i className="bi bi-building me-1"></i> {job.company}
                    </div>
                  </div>
                  <span className="badge" style={{
                    background: "rgba(16,185,129,0.15)", color: "#10b981",
                    fontWeight: 600, padding: "6px 12px", borderRadius: "var(--radius-full)",
                  }}>
                    {job.salary}
                  </span>
                </div>

                {job.location && (
                  <div className="mb-3" style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    <i className="bi bi-geo-alt-fill me-1" style={{ color: "#06b6d4" }}></i> {job.location}
                  </div>
                )}

                {job.apply_url && (
                  <a href={job.apply_url} target="_blank" rel="noreferrer"
                    className="btn-gradient d-inline-block px-3 py-2"
                    style={{ fontSize: "0.85rem", textDecoration: "none" }}>
                    <i className="bi bi-box-arrow-up-right me-1"></i> Apply Now
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card-static p-5 text-center fade-in-up fade-in-up-delay-1">
          <i className="bi bi-briefcase" style={{ fontSize: "3rem", color: "var(--text-muted)" }}></i>
          <p className="mt-3 mb-4" style={{ color: "var(--text-muted)" }}>
            No job recommendations yet. Take the career quiz first!
          </p>
          <button className="btn-gradient px-4 py-2" onClick={() => navigate("/career-quiz")}>
            <i className="bi bi-compass me-2"></i> Take Career Quiz
          </button>
        </div>
      )}
    </div>
  );
}