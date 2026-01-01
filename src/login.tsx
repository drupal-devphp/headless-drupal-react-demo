import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "./api";

const Login: React.FC = () => {
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/user/login?_format=json`, {
        method: "POST",
        credentials: "include", // important to store cookie
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, pass }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message || "Login failed");
        setLoading(false);
        return;
      }

      // store logout token if provided
      if (json.logout_token) {
        localStorage.setItem("logout_token", json.logout_token);
      }

      // also many Drupal setups return current_user or sess info
      navigate("/articles");
    } catch (err) {
      setError("Network or server error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label>
          Password
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} required />
        </label>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p className="error">{error}</p>}
      </form>

      <p className="note">This demo uses cookie-based auth. Ensure your Drupal CORS allows credentials.</p>
    </div>
  );
};

export default Login;
