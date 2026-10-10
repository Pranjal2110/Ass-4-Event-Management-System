import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage({ notify }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(formData.email, formData.password);
      notify(`Welcome back, ${data.user.name}!`, "success");
      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillQuick = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo-icon">🎟️</span>
          <h2>Sign In to Eventify</h2>
          <p>Access your tickets, registrations, or organizer dashboard</p>
        </div>

        {error && <div className="alert-box error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. anjali@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="demo-credentials-box">
          <p className="demo-title">💡 Quick Testing Helpers:</p>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-btn"
              onClick={() => fillQuick("admin@eventify.com", "admin123")}
            >
              Fill Admin Demo
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => fillQuick("user@eventify.com", "user123")}
            >
              Fill User Demo
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
