import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/EventCard";

export default function EventsPage({ notify }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedVenue) params.venue = selectedVenue;

      const res = await API.get("/events", { params });
      setEvents(res.data);
      setError("");
    } catch (err) {
      setError("Unable to load events. Please verify backend server is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedVenue]);

  const handleRegister = async (eventId) => {
    if (!user) {
      notify("Please login to register for this event.", "info");
      navigate("/login");
      return;
    }

    try {
      const res = await API.post(`/events/${eventId}/register`);
      notify(res.data.message || "Registration successful!", "success");
      fetchEvents();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to register.", "error");
    }
  };

  const handleCancelRegistration = async (eventId) => {
    try {
      const res = await API.delete(`/events/${eventId}/register`);
      notify(res.data.message || "Registration cancelled.", "info");
      fetchEvents();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to cancel registration.", "error");
    }
  };

  const uniqueVenues = Array.from(new Set(events.map((e) => e.venue).filter(Boolean)));

  return (
    <div className="page-container">
      {/* Hero Banner */}
      <header className="hero-banner">
        <div className="hero-content">
          <span className="badge-glow">Assignment 4 • Project 7</span>
          <h1>Experience Campus & Tech Events Like Never Before</h1>
          <p>
            Browse curated workshops, cultural fests, and hackathons. Register instantly
            or manage attendees effortlessly with our streamlined platform.
          </p>
          <div className="hero-cta">
            <a href="#browse-section" className="btn-primary">Browse All Events ↓</a>
          </div>
        </div>
      </header>

      {/* Main Events Section */}
      <section className="browse-section" id="browse-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Upcoming Events</h2>
            <p className="section-subtitle">Reserve your spot before tickets run out</p>
          </div>
          <span className="event-count-badge">
            {events.length} {events.length === 1 ? "Event" : "Events"} Available
          </span>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="filters-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by event title, organizer or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button className="clear-btn" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          <div className="venue-filter-wrap">
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="filter-select"
            >
              <option value="">All Venues</option>
              {uniqueVenues.map((v) => (
                <option key={v} value={v}>📍 {v}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="alert-box error">{error}</div>}

        {loading ? (
          <div className="state-box">
            <div className="spinner" />
            <p>Loading upcoming events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="state-box empty">
            <div className="empty-icon">📅</div>
            <h3>No events found</h3>
            <p>Try adjusting your search filters or check back later for new events.</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onRegister={handleRegister}
                onCancelRegistration={handleCancelRegistration}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
