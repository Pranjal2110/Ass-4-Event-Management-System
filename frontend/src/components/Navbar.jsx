import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="brand">
          Eventify<span className="dot">.</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-item">Explore Events</Link>
          {user && !isAdmin && (
            <Link to="/my-registrations" className="nav-item">My Registrations</Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="nav-item admin-badge-link">
              Admin Dashboard
            </Link>
          )}
        </div>

        <div className="nav-auth">
          {user ? (
            <div className="user-profile">
              <span className="user-name">
                {user.name}
                <span className={`role-pill ${user.role}`}>
                  {user.role}
                </span>
              </span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-link">Login</Link>
              <Link to="/register" className="register-btn">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
