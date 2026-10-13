import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    // Scroll reveal observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: "bi-compass-fill",
      title: "Career Discovery",
      desc: "AI-powered career quiz analyzes your interests and recommends ideal career paths.",
      link: "/career-quiz",
      color: "#818cf8",
    },
    {
      icon: "bi-journal-richtext",
      title: "Smart Notes",
      desc: "Upload notes and instantly generate quizzes, summaries, and flashcards.",
      link: "/notes-upload",
      color: "#34d399",
    },
    {
      icon: "bi-calendar2-week-fill",
      title: "Study Plans",
      desc: "Personalized weekly study schedules that adapt to your progress.",
      link: "/study-plan",
      color: "#a78bfa",
    },
    {
      icon: "bi-lightning-charge-fill",
      title: "Adaptive Quizzes",
      desc: "Difficulty adjusts in real-time based on your performance.",
      link: "/notes-upload",
      color: "#fbbf24",
    },
    {
      icon: "bi-layers-fill",
      title: "Flashcards",
      desc: "Spaced repetition system for long-term knowledge retention.",
      link: "/notes-upload",
      color: "#22d3ee",
    },
    {
      icon: "bi-graph-up-arrow",
      title: "Progress Analytics",
      desc: "Track your learning journey with detailed insights and charts.",
      link: "/dashboard",
      color: "#f87171",
    },
  ];

  const stats = [
    { number: "10K+", label: "Active Learners" },
    { number: "95%", label: "Success Rate" },
    { number: "500+", label: "Career Paths" },
    { number: "24/7", label: "AI Available" },
  ];

  const testimonials = [
    {
      quote: "EduSmart helped me discover my passion for data science. The career quiz was incredibly accurate!",
      author: "Alex Johnson",
      role: "Data Science Student",
    },
    {
      quote: "The note upload feature transformed how I study. Generating quizzes from my notes saves hours!",
      author: "Maria Rodriguez",
      role: "Medical Student",
    },
    {
      quote: "The personalized study plan kept me on track throughout exam prep. Highly recommend!",
      author: "James Wilson",
      role: "Engineering Student",
    },
  ];

  return (
    <div className="home-page">
      {/* ── Hero Section ── */}
      <section className="hero-section">
        <div className="hero-bg-effects">
          <div className="hero-orb orb-1"></div>
          <div className="hero-orb orb-2"></div>
          <div className="hero-orb orb-3"></div>
          <div className="hero-grid"></div>
        </div>

        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center min-vh-100 py-5">
            <div className="col-lg-6">
              <div className={`hero-content ${isVisible ? "visible" : ""}`}>
                <div className="hero-badge fade-in-up">
                  <span className="badge-glow">
                    <i className="bi bi-stars me-1"></i>
                    AI-Powered Learning Platform
                  </span>
                </div>

                <h1 className="hero-title fade-in-up fade-in-up-delay-1">
                  Transform Your <br />
                  <span className="gradient-text-hero">Learning Experience</span>
                </h1>

                <p className="hero-desc fade-in-up fade-in-up-delay-2">
                  Discover your ideal career, master any subject with smart notes,
                  and stay on track with AI-generated study plans — all in one platform.
                </p>

                <div className="hero-actions fade-in-up fade-in-up-delay-3">
                  <Link to="/register" className="btn-gradient me-3 glow-btn">
                    <i className="bi bi-rocket-takeoff me-2"></i>
                    Get Started Free
                  </Link>
                  <Link to="/login" className="btn-glass">
                    <i className="bi bi-play-fill me-1"></i>
                    Sign In
                  </Link>
                </div>

                <div className="hero-stats fade-in-up fade-in-up-delay-4">
                  {stats.map((s, i) => (
                    <div key={i} className="hero-stat">
                      <span className="hero-stat-number">{s.number}</span>
                      <span className="hero-stat-label">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-6 d-none d-lg-flex justify-content-center">
              <div className="hero-visual fade-in-up fade-in-up-delay-2">
                <div className="hero-visual-inner">
                  <div className="visual-ring ring-1"></div>
                  <div className="visual-ring ring-2"></div>
                  <div className="visual-ring ring-3"></div>
                  <i className="bi bi-mortarboard-fill hero-icon"></i>
                </div>

                <div className="floating-tag tag-1 float-animation">
                  <i className="bi bi-file-text text-info me-2"></i> Smart Notes
                </div>
                <div className="floating-tag tag-2 float-animation-slow">
                  <i className="bi bi-graph-up text-success me-2"></i> Progress
                </div>
                <div className="floating-tag tag-3 float-animation-fast">
                  <i className="bi bi-lightbulb text-warning me-2"></i> AI Insights
                </div>
                <div className="floating-tag tag-4 float-animation">
                  <i className="bi bi-trophy text-danger me-2"></i> Achieve
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator bounce-animation">
          <i className="bi bi-chevron-double-down"></i>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="features-section section-padding particles-bg">
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="text-center mb-5">
            <span className="section-label">FEATURES</span>
            <h2 className="fw-bold mb-3">
              Powerful Tools for <span className="gradient-text">Smarter Learning</span>
            </h2>
            <p className="section-subtitle">
              Everything you need to excel in your educational journey
            </p>
          </div>

          <div className="row g-4">
            {features.map((f, i) => (
              <div key={i} className="col-md-6 col-lg-4 scroll-reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <Link to={f.link} className="text-decoration-none">
                  <div className="feature-card-modern glass-card p-4 h-100">
                    <div
                      className="feature-icon-modern mb-3"
                      style={{ background: `${f.color}15`, color: f.color }}
                    >
                      <i className={`bi ${f.icon}`}></i>
                    </div>
                    <h5 className="fw-bold text-white mb-2">{f.title}</h5>
                    <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>{f.desc}</p>
                    <div className="feature-arrow mt-3">
                      <i className="bi bi-arrow-right" style={{ color: f.color }}></i>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="stat-card glass-card-static text-center p-4 scroll-reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="stat-number-lg gradient-text">{s.number}</div>
                <div className="stat-label-lg">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="testimonials-section section-padding">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-label">TESTIMONIALS</span>
            <h2 className="fw-bold mb-3">
              What <span className="gradient-text">Students Say</span>
            </h2>
          </div>

          <div className="row g-4">
            {testimonials.map((t, i) => (
              <div key={i} className="col-md-4 scroll-reveal" style={{ transitionDelay: `${i * 0.15}s` }}>
                <div className="testimonial-card glass-card p-4 h-100">
                  <div className="testimonial-stars mb-3">
                    {[...Array(5)].map((_, j) => (
                      <i key={j} className="bi bi-star-fill text-warning me-1"></i>
                    ))}
                  </div>
                  <p className="testimonial-quote">"{t.quote}"</p>
                  <div className="testimonial-author-info">
                    <div className="testimonial-avatar">
                      {t.author.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className="fw-bold text-white">{t.author}</div>
                      <div className="text-muted" style={{ fontSize: "0.85rem" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="cta-section section-padding">
        <div className="container">
          <div className="cta-card-modern text-center scroll-reveal">
            <div className="cta-bg-effects">
              <div className="cta-orb cta-orb-1"></div>
              <div className="cta-orb cta-orb-2"></div>
            </div>
            <div className="position-relative" style={{ zIndex: 1 }}>
              <h2 className="fw-bold text-white mb-3">Ready to Transform Your Learning?</h2>
              <p className="text-light opacity-75 mb-4 mx-auto" style={{ maxWidth: "500px" }}>
                Join thousands of students already using EduSmart to achieve their goals.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/register" className="btn-gradient glow-btn px-4 py-3">
                  <i className="bi bi-rocket-takeoff me-2"></i>Start Free Trial
                </Link>
                <Link to="/login" className="btn-glass px-4 py-3">
                  Existing Account
                </Link>
              </div>
              <p className="text-muted mt-3 mb-0" style={{ fontSize: "0.85rem" }}>
                No credit card required • Free forever for students
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer-section">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="d-flex align-items-center mb-3">
                <div className="brand-icon me-2">
                  <i className="bi bi-mortarboard-fill"></i>
                </div>
                <span className="brand-text" style={{ fontSize: "1.3rem" }}>EduSmart</span>
              </div>
              <p className="text-muted" style={{ fontSize: "0.9rem", maxWidth: "300px" }}>
                Empowering students with AI-driven learning tools to unlock their potential.
              </p>
              <div className="social-links d-flex gap-2">
                {["twitter", "github", "linkedin", "instagram"].map((s) => (
                  <a key={s} href="#!" className="social-link">
                    <i className={`bi bi-${s}`}></i>
                  </a>
                ))}
              </div>
            </div>
            <div className="col-6 col-lg-2">
              <h6 className="footer-heading">Product</h6>
              <ul className="footer-links">
                <li><Link to="/career-quiz">Career Quiz</Link></li>
                <li><Link to="/notes-upload">Smart Notes</Link></li>
                <li><Link to="/study-plan">Study Plans</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
              </ul>
            </div>
            <div className="col-6 col-lg-2">
              <h6 className="footer-heading">Resources</h6>
              <ul className="footer-links">
                <li><a href="#!">Blog</a></li>
                <li><a href="#!">Help Center</a></li>
                <li><a href="#!">Tutorials</a></li>
                <li><a href="#!">API Docs</a></li>
              </ul>
            </div>
            <div className="col-6 col-lg-2">
              <h6 className="footer-heading">Company</h6>
              <ul className="footer-links">
                <li><a href="#!">About Us</a></li>
                <li><a href="#!">Careers</a></li>
                <li><a href="#!">Privacy</a></li>
                <li><a href="#!">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="separator"></div>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
              © 2026 EduSmart. All rights reserved.
            </p>
            <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
              Made with <i className="bi bi-heart-fill text-danger"></i> for students
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}