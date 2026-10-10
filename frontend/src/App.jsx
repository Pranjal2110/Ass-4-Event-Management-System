import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import EventsPage from "./pages/EventsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import MyRegistrationsPage from "./pages/MyRegistrationsPage";
import "./App.css";

export default function App() {
  const [toast, setToast] = useState(null);

  const notify = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          {/* Global Toast Notification */}
          {toast && (
            <div className={`toast-banner toast-${toast.type}`}>
              <span>{toast.message}</span>
              <button className="toast-close" onClick={() => setToast(null)}>✕</button>
            </div>
          )}

          <Navbar />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<EventsPage notify={notify} />} />
              <Route path="/login" element={<LoginPage notify={notify} />} />
              <Route path="/register" element={<RegisterPage notify={notify} />} />
              <Route
                path="/my-registrations"
                element={
                  <ProtectedRoute>
                    <MyRegistrationsPage notify={notify} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard notify={notify} />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="footer">
            <div className="footer-content">
              <p>
                <strong>Eventify</strong> • Assignment-4 (Project ID: 7 — Event Management System)
              </p>
              <p className="footer-sub">
                Built with React + Vite, Node.js, Express, and MongoDB Atlas.
              </p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
