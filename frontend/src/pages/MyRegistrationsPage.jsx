import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import EventCard from "../components/EventCard";

export default function MyRegistrationsPage({ notify }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await API.get("/events/my-registrations");
      setRegistrations(res.data);
    } catch (err) {
      notify("Failed to fetch your registrations.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancelRegistration = async (eventId) => {
    try {
      const res = await API.delete(`/events/${eventId}/register`);
      notify(res.data.message || "Registration cancelled successfully.", "info");
      fetchRegistrations();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to cancel registration.", "error");
    }
  };

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">My Registered Events</h2>
          <p className="section-subtitle">View and manage your confirmed event tickets</p>
        </div>
        <span className="event-count-badge">
          {registrations.length} {registrations.length === 1 ? "Ticket" : "Tickets"}
        </span>
      </div>

      {loading ? (
        <div className="state-box">
          <div className="spinner" />
          <p>Loading your event passes...</p>
        </div>
      ) : registrations.length === 0 ? (
        <div className="state-box empty">
          <div className="empty-icon">🎟️</div>
          <h3>No Event Registrations Yet</h3>
          <p>You haven't registered for any events yet. Check out upcoming events!</p>
          <Link to="/" className="btn-primary mt-4">
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="events-grid">
          {registrations.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onCancelRegistration={handleCancelRegistration}
            />
          ))}
        </div>
      )}
    </div>
  );
}
