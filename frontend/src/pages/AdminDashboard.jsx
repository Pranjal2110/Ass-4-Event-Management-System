import { useState, useEffect } from "react";
import API from "../services/api";
import EventModal from "../components/EventModal";

export default function AdminDashboard({ notify }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/events");
      setEvents(res.data);
    } catch (err) {
      notify("Failed to load events for dashboard.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenCreate = () => {
    setEventToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event) => {
    setEventToEdit(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEventToEdit(null);
  };

  const handleSaveEvent = async (formData) => {
    try {
      if (eventToEdit) {
        await API.put(`/events/${eventToEdit._id}`, formData);
        notify("Event updated successfully!", "success");
      } else {
        await API.post("/events", formData);
        notify("Event created successfully!", "success");
      }
      handleCloseModal();
      fetchEvents();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to save event.", "error");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this event?")) {
      return;
    }

    try {
      await API.delete(`/events/${id}`);
      notify("Event deleted successfully.", "success");
      fetchEvents();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to delete event.", "error");
    }
  };

  // Metrics calculations
  const totalEvents = events.length;
  const totalCapacity = events.reduce((acc, curr) => acc + (curr.capacity || 0), 0);
  const totalRegistrations = events.reduce(
    (acc, curr) => acc + (curr.registeredUsers?.length || 0),
    0
  );

  return (
    <div className="page-container admin-dashboard">
      <div className="dashboard-header">
        <div>
          <span className="badge-pill">Admin Management Console</span>
          <h2>Event Operations Dashboard</h2>
          <p>Create, update, monitor attendee registrations, and manage all events</p>
        </div>
        <button className="btn-primary" onClick={handleOpenCreate}>
          + Create New Event
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <span className="stat-value">{totalEvents}</span>
            <span className="stat-label">Total Events</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎟️</div>
          <div className="stat-info">
            <span className="stat-value">{totalCapacity}</span>
            <span className="stat-label">Total Seat Capacity</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-value">{totalRegistrations}</span>
            <span className="stat-label">Total Registrations</span>
          </div>
        </div>
      </div>

      {/* Events Table Section */}
      <div className="table-card">
        <div className="table-card-header">
          <h3>All Scheduled Events</h3>
          <span className="count-tag">{totalEvents} records</span>
        </div>

        {loading ? (
          <div className="state-box">
            <div className="spinner" />
            <p>Loading events table...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="state-box empty">
            <p>No events available. Click "+ Create New Event" to get started.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Organizer</th>
                  <th>Capacity</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => {
                  const regCount = e.registeredUsers?.length || 0;
                  return (
                    <tr key={e._id}>
                      <td className="event-cell">
                        <strong>{e.title}</strong>
                        <span className="table-subtext">{e.description?.slice(0, 45)}...</span>
                      </td>
                      <td>
                        {new Date(e.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td>{e.venue}</td>
                      <td>{e.organizer}</td>
                      <td>{e.capacity}</td>
                      <td>
                        <span className="reg-badge">
                          {regCount} / {e.capacity}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn-sm edit"
                            onClick={() => handleOpenEdit(e)}
                            title="Edit Event"
                          >
                            Edit
                          </button>
                          <button
                            className="btn-sm delete"
                            onClick={() => handleDeleteEvent(e._id)}
                            title="Delete Event"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        eventToEdit={eventToEdit}
      />
    </div>
  );
}
