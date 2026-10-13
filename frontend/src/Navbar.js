import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const [isExpanded, setIsExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  useEffect(() => {
    setIsExpanded(false);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar navbar-expand-lg fixed-top edu-navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <div className="brand-icon me-2">
            <i className="bi bi-mortarboard-fill"></i>
          </div>
          <span className="brand-text">EduSmart</span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className={`navbar-toggler border-0 ${isExpanded ? "" : "collapsed"}`}
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label="Toggle navigation"
        >
          <div className="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        {/* Nav Links */}
        <div className={`collapse navbar-collapse ${isExpanded ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto align-items-lg-center gap-1">
            {!token ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom" to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i> Login
                  </Link>
                </li>
                <li className="nav-item ms-lg-2">
                  <Link className="btn-gradient px-3 py-2 text-decoration-none d-inline-block" to="/register">
                    Get Started
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className={`nav-link nav-link-custom ${isActive("/dashboard") ? "active" : ""}`} to="/dashboard">
                    <i className="bi bi-grid-1x2-fill me-1"></i> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link nav-link-custom ${isActive("/career-quiz") ? "active" : ""}`} to="/career-quiz">
                    <i className="bi bi-compass-fill me-1"></i> Career
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link nav-link-custom ${isActive("/notes-upload") ? "active" : ""}`} to="/notes-upload">
                    <i className="bi bi-journal-text me-1"></i> Notes
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link nav-link-custom ${isActive("/study-plan") ? "active" : ""}`} to="/study-plan">
                    <i className="bi bi-calendar2-check me-1"></i> Plan
                  </Link>
                </li>

                {/* Profile Dropdown */}
                <li className="nav-item dropdown ms-lg-2">
                  <button
                    className="btn nav-profile-btn dropdown-toggle d-flex align-items-center"
                    id="userMenu"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div className="avatar-sm me-2">
                      {(username || "U")[0].toUpperCase()}
                    </div>
                    <span className="d-none d-lg-inline">{username || "Profile"}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2"></i> Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/activity">
                        <i className="bi bi-clock-history me-2"></i> Activity
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/jobs">
                        <i className="bi bi-briefcase me-2"></i> Jobs
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}