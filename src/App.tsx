import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./login";
import ArticleList from "./ArticleList";
import ArticleDetail from "./ArticleDetail";
import { API_BASE } from "./api";
import "./App.css";

// Protected route component for authenticated users
const ProtectedRoute: React.FC<{ children: React.ReactNode; isLoggedIn: boolean }> = ({ children, isLoggedIn }) => {
  return isLoggedIn ? <>{children}</> : <Navigate to="/" replace />;
};

// Protected route component for anonymous users (login page)
const AnonymousRoute: React.FC<{ children: React.ReactNode; isLoggedIn: boolean }> = ({ children, isLoggedIn }) => {
  return !isLoggedIn ? <>{children}</> : <Navigate to="/articles" replace />;
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("logout_token");

  const handleLogout = async () => {
    const token = localStorage.getItem("logout_token");
    try {
      if (token) {
        // logout request (use credentials include to clear session cookie)
        await fetch(`${API_BASE}/user/logout?_format=json&token=${token}`, {
          method: "POST",
          credentials: "include",
        });
      }
    } catch (err) {
      console.error("logout error", err);
    } finally {
      // Clear all authentication data
      localStorage.removeItem("logout_token");
      // Clear any other stored auth tokens if present
      sessionStorage.clear();
      navigate("/");
      window.location.reload();
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title">
          <h1>Drupal Academy</h1>
          <p className="header-subtitle">Headless Demo</p>
        </div>
        <nav className="header-nav">
          {isLoggedIn ? (
            <>
              <button onClick={() => navigate("/articles")} className="btn btn-primary">
                <span>📰</span> Articles
              </button>
              <button onClick={handleLogout} className="btn btn-danger">
                <span>🚪</span> Logout
              </button>
            </>
          ) : (
            <button onClick={() => navigate("/")} className="btn btn-primary">
              <span>🔐</span> Login
            </button>
          )}
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<AnonymousRoute isLoggedIn={isLoggedIn}><Login /></AnonymousRoute>} />
          <Route path="/articles" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ArticleList /></ProtectedRoute>} />
          <Route path="/articles/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ArticleDetail /></ProtectedRoute>} />
          <Route path="/article/:alias" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ArticleDetail /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={isLoggedIn ? "/articles" : "/"} replace />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-text">
            <h4>Drupal Academy</h4>
            <p>Headless CMS Demo Application</p>
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">About</a>
            <a href="#" className="footer-link">Docs</a>
            <a href="#" className="footer-link">GitHub</a>
          </div>
        </div>
        <div className="footer-bottom">
          <small>&copy; 2025 Drupal Academy. All rights reserved.</small>
        </div>
      </footer>
    </div>
  );
};

export default App;
