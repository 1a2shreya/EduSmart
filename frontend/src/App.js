import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import Verify from "./Verify";
import ForgotPassword from "./ForgotPassword";
import CareerQuiz from "./CareerQuiz";
import NotesUpload from "./NotesUpload";
import ProfilePage from "./ProfilePage";
import Logout from "./Logout";
import StudyPlanPage from "./StudyPlanPage";
import Dashboard from "./Dashboard";
import ActivityPage from "./ActivityPage";
import JobsPage from "./JobsPage";
import "./App.css";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="main-content" style={{ paddingTop: "80px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/career-quiz" element={<PrivateRoute><CareerQuiz /></PrivateRoute>} />
            <Route path="/notes-upload" element={<PrivateRoute><NotesUpload /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/study-plan" element={<PrivateRoute><StudyPlanPage /></PrivateRoute>} />
            <Route path="/activity" element={<PrivateRoute><ActivityPage /></PrivateRoute>} />
            <Route path="/jobs" element={<PrivateRoute><JobsPage /></PrivateRoute>} />
            <Route path="/logout" element={<PrivateRoute><Logout /></PrivateRoute>} />

            <Route path="*" element={
              <div className="container text-center py-5">
                <div className="error-404">
                  <h1 className="display-1 fw-bold">404</h1>
                  <h2 className="mb-3" style={{ color: 'var(--text-secondary)' }}>Page Not Found</h2>
                  <p className="lead mb-4">The page you're looking for doesn't exist.</p>
                  <a href="/" className="btn-gradient px-4 py-2 text-decoration-none">
                    <i className="bi bi-arrow-left me-2"></i>Go Back Home
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}