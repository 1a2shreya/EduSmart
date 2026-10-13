import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CareerQuizStyles.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const quizQuestions = [
  { name: "stream", question: "Which academic stream did you choose in high school?", options: ["Arts", "Commerce", "IT", "Medical", "Other"] },
  { name: "12th_perc", question: "What was your percentage in 12th grade?", type: "number", placeholder: "Enter your 12th grade percentage (e.g., 75.5)" },
  { name: "college_cgpa", question: "What is your current college CGPA?", type: "number", placeholder: "Enter your CGPA (e.g., 8.5)" },
  { name: "interest_subject1", question: "Which of these subjects interests you the most?", options: ["Biology","Business Studies","Chemistry","Computer Science","Economics","English","History","Math","Media","Physics","Other"] },
  { name: "interest_subject2", question: "Which of these additional subjects do you enjoy?", options: ["AI","Accounts","Anatomy","Art","Biochemistry","Data Science","Finance","Genetics","HR","Literature","Management","Marketing","Programming","Sociology","Taxation","Other"] },
  { name: "future_goal", question: "What is your future career goal?", options: ["AI Researcher","Business Analyst","CA","Consultant","Content Creator","Entrepreneur","Financial Analyst","Historian","Investment Banker","Journalist","MBBS Doctor","ML Engineer","Ophthalmologist","Orthopedic Surgeon","Software Developer","Other"] },
  { name: "extracurricular_activities", question: "Which extracurricular activity are you involved in?", options: ["Case Study Competitions","Coding Club","Debate Club","Finance Club","Hackathons","Medical Camps","Robotics","Science Fairs","Startup Club","Stock Market Simulations","Theatre","Writing","Other"] },
  { name: "internship_experience", question: "How many internships have you completed?", options: [0,1,2,3,"Other"] },
  { name: "preferred_work_style", question: "What is your preferred work style?", options: ["Hybrid","Individual","Teamwork","Other"] },
  { name: "family_background", question: "What is your family's professional background?", options: ["Academicians","Artists","Business Owners","Doctors","Engineers","Other"] },
  { name: "hours_spent_studying", question: "How many hours do you study each day on average?", options: [5,6,7,8,9,10,11,12,13,14,15,16,"Other"] },
  { name: "favorite_learning_method", question: "What is your preferred method of learning?", options: ["Hands-on","Listening","Reading","Visual","Other"] },
  { name: "language_proficiency", question: "Rate your English language proficiency (1 to 5)", options: [1,2,3,4,5,"Other"] }
];

export default function CareerQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [otherFields, setOtherFields] = useState({});
  const [careerResults, setCareerResults] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [addingPlan, setAddingPlan] = useState(null);

  const navigate = useNavigate();

  const apiClient = axios.create({ baseURL: "http://localhost:8000/api" });
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Token ${token}`;
    return config;
  });
  apiClient.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/login");
      }
      return Promise.reject(err);
    }
  );

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
  }, [navigate]);

  const addCareerToStudyPlan = async (careerName) => {
    if (!window.confirm(`📅 Create a study plan for "${careerName}"?`)) return;
    try {
      setAddingPlan(careerName);
      const res = await apiClient.post("/study-plan/generate/", {
        plan_type: "career_quiz", career: careerName, note_ids: [],
      });
      if (res.data?.id) {
        toast.success(`✅ Study plan created for ${careerName}`);
        navigate("/study-plan");
      } else {
        toast.warning("⚠️ Plan created but no ID returned.");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to create study plan.");
    } finally {
      setAddingPlan(null);
    }
  };

  useEffect(() => {
    setProgress(Math.round(((currentStep + 1) / quizQuestions.length) * 100));
  }, [currentStep]);

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleOtherChange = (name, val) => {
    setOtherFields((p) => ({ ...p, [name]: val }));
    setFormData((p) => ({ ...p, [name]: val }));
  };
  const goToNext = () => { if (currentStep < quizQuestions.length - 1) { setCurrentStep(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); } };
  const goToPrev = () => { if (currentStep > 0) { setCurrentStep(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await apiClient.post("/career-recommendation/", formData);
      setCareerResults(res.data?.recommendations || []);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to fetch recommendations");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSection = (i) => setExpandedIndex(p => (p === i ? null : i));

  const restartQuiz = () => {
    setCurrentStep(0); setFormData({}); setOtherFields({});
    setCareerResults([]); setExpandedIndex(null);
  };

  /* ── Dark-themed inline styles ── */
  const S = {
    glass: { background: "var(--bg-glass)", border: "1px solid var(--border-glass)", borderRadius: 16, backdropFilter: "blur(12px)" },
    textPrimary: { color: "var(--text-primary)" },
    textSecondary: { color: "var(--text-secondary)" },
    textMuted: { color: "var(--text-muted)" },
    accent: { color: "var(--accent-primary)" },
  };

  const renderQuestion = (q) => (
    <div key={q.name} className="mb-4 p-4 rounded-3 animate-fade-in"
      style={{ ...S.glass, ...S.textPrimary }}>
      <label className="form-label fw-bold fs-5" style={S.textPrimary}>{q.question}</label>
      {q.options ? (
        <>
          <select className="form-select form-select-lg" name={q.name}
              onChange={handleChange} value={formData[q.name] || ""} required
              style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }}>
            <option value="" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>-- Select --</option>
              {q.options.map((opt, i) => <option key={i} value={opt} style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>{opt}</option>)}
          </select>
          {formData[q.name] === "Other" && (
            <input type="text" className="form-control mt-3"
              placeholder={`Enter your own answer for ${q.name}`}
              value={otherFields[q.name] || ""}
              onChange={(e) => handleOtherChange(q.name, e.target.value)} required />
          )}
        </>
      ) : (
        <input type={q.type || "text"} name={q.name} className="form-control form-control-lg"
          placeholder={q.placeholder || q.question} onChange={handleChange}
          value={formData[q.name] || ""} required />
      )}
    </div>
  );

  return (
    <div className="container career-quiz-container my-5" style={{ maxWidth: 900 }}>
      {careerResults.length === 0 ? (
        <>
          <div className="text-center mb-5 fade-in-up">
            <span className="badge rounded-pill px-3 py-2 mb-3"
              style={{ background: "rgba(99,102,241,0.15)", color: "var(--accent-primary)", fontSize: "0.85rem" }}>
              <i className="bi bi-compass me-1"></i> Career Discovery
            </span>
            <h1 className="fw-bold" style={S.textPrimary}>
              Career Explorer <span className="gradient-text">Quiz</span>
            </h1>
            <p className="lead" style={S.textSecondary}>
              Discover your ideal career path in just a few minutes!
            </p>
          </div>

          <div className="glass-card-static p-0 fade-in-up fade-in-up-delay-1" style={{ overflow: "hidden" }}>
            {/* Progress header */}
            <div style={{
              padding: "16px 24px", borderBottom: "1px solid var(--border-glass)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <h5 className="mb-0" style={S.textPrimary}>
                Question {currentStep + 1} of {quizQuestions.length}
              </h5>
              <span className="fw-bold gradient-text">{progress}%</span>
            </div>
            <div className="progress" style={{ height: 6, borderRadius: 0 }}>
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>

            <div style={{ padding: "24px" }}>
              <form onSubmit={handleSubmit}>
                {renderQuestion(quizQuestions[currentStep])}
                <div className="d-flex justify-content-between mt-4">
                  <button type="button" className="btn btn-outline-secondary btn-animated btn-prev"
                    onClick={goToPrev} disabled={currentStep === 0}>
                    <i className="bi bi-arrow-left me-1"></i> Previous
                  </button>
                  {currentStep < quizQuestions.length - 1 ? (
                    <button type="button" className="btn btn-primary btn-animated btn-next ripple" onClick={goToNext}>
                      Next <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-primary px-4 ripple btn-animated btn-glow" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Analyzing...</>
                      ) : (
                        <><i className="bi bi-stars me-1"></i>Get Recommendations</>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </>
      ) : (
        /* ── Results ── */
        <>
          <div className="text-center mb-5 fade-in-up">
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎯</div>
            <h1 className="fw-bold" style={S.textPrimary}>
              Your Career <span className="gradient-text">Recommendations</span>
            </h1>
            <p className="lead" style={S.textSecondary}>
              Based on your answers, here are the top career paths for you
            </p>
            <button className="btn btn-outline-primary mt-2" onClick={restartQuiz}>
              <i className="bi bi-arrow-repeat me-1"></i> Retake Quiz
            </button>
          </div>

          <div className="row g-4">
            {careerResults.map((career, idx) => (
              <div className="col-lg-6 col-md-12" key={idx}>
                <div className="career-card h-100 fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div style={{ marginBottom: 16 }}>
                    <h4 className="fw-bold mb-2" style={S.textPrimary}>{career.career}</h4>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="confidence-badge">
                        <span className="badge">{(career.confidence * 100).toFixed(1)}% Match</span>
                      </span>
                      {career.roadmap?.salary && (
                        <span className="salary-indicator">
                          <i className="bi bi-cash-coin me-1"></i>{career.roadmap.salary}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Roadmap */}
                  {expandedIndex === idx && career.roadmap && (
                    <div className="mt-3 animate-expand">
                      <h6 className="fw-bold mb-3" style={S.textPrimary}>
                        <i className="bi bi-map me-2"></i>Career Roadmap
                      </h6>
                      <div className="timeline">
                        {(Array.isArray(career.roadmap) ? career.roadmap : []).map((week, i) => (
                          <div className="timeline-item mb-3" key={i}>
                            <div className="timeline-badge">{i + 1}</div>
                            <div className="timeline-content">
                              <strong style={S.textPrimary}>{week.title}</strong>
                              <ul className="mt-2 mb-0" style={{ paddingLeft: 16 }}>
                                {(week.tasks || []).map((task, j) => (
                                  <li key={j} className="mb-2" style={S.textSecondary}>
                                    <span className="fw-bold" style={S.textPrimary}>{task.title}</span>
                                    <div className="mt-1">
                                      {Array.isArray(task.resources)
                                        ? task.resources.map((r, k) => (
                                            <a key={k} href={r.url} target="_blank" rel="noreferrer"
                                              className={`btn btn-sm me-2 mb-1 ${
                                                r.type === "video" ? "btn-danger"
                                                : r.title?.toLowerCase().includes("coursera") ? "btn-primary"
                                                : r.title?.toLowerCase().includes("edx") ? "btn-dark"
                                                : "btn-secondary"
                                              }`}>{r.title}</a>
                                          ))
                                        : typeof task.resources === "object" &&
                                          Object.entries(task.resources).map(([key, val], k) => (
                                            <a key={k} href={val} target="_blank" rel="noreferrer"
                                              className={`btn btn-sm me-2 mb-1 ${
                                                key.toLowerCase().includes("youtube") ? "btn-danger"
                                                : key.toLowerCase().includes("coursera") ? "btn-primary"
                                                : key.toLowerCase().includes("edx") ? "btn-dark"
                                                : "btn-secondary"
                                              }`}>{key}</a>
                                          ))}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Jobs */}
                  {career.jobs?.length > 0 && (
                    <div className="mt-3">
                      <h6 className="fw-bold" style={S.textPrimary}>
                        <i className="bi bi-briefcase-fill me-1"></i> Job Opportunities
                      </h6>
                      <ul className="list-group mt-2">
                        {career.jobs.map((job, j) => (
                          <li className="list-group-item d-flex justify-content-between align-items-center" key={j}>
                            <div>
                              <a href={job.link} target="_blank" rel="noreferrer"
                                className="fw-bold text-decoration-none" style={S.accent}>{job.title}</a>
                              <div style={S.textMuted} className="small">{job.company}</div>
                            </div>
                            <span className="badge" style={{ background: "var(--accent-success)", color: "#fff" }}>
                              {job.salary || job.stipend || "N/A"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Card footer actions */}
                  <div className="d-flex justify-content-between mt-3 pt-3"
                    style={{ borderTop: "1px solid var(--border-glass)" }}>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => toggleSection(idx)}>
                      <i className={`bi bi-chevron-${expandedIndex === idx ? "up" : "down"} me-1`}></i>
                      {expandedIndex === idx ? "Hide" : "Details"}
                    </button>
                    <button className="btn btn-sm btn-primary ripple"
                      onClick={() => addCareerToStudyPlan(career.career)}
                      disabled={addingPlan === career.career}>
                      {addingPlan === career.career ? (
                        <><span className="spinner-border spinner-border-sm me-1"></span>Adding...</>
                      ) : (
                        <><i className="bi bi-plus-circle me-1"></i>Add to Study Plan</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
