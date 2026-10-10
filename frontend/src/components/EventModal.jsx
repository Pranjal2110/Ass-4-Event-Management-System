import { useState, useEffect } from "react";

export default function EventModal({ isOpen, onClose, onSave, eventToEdit }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    organizer: "",
    capacity: 100,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title || "",
        description: eventToEdit.description || "",
        date: eventToEdit.date ? eventToEdit.date.slice(0, 10) : "",
        venue: eventToEdit.venue || "",
        organizer: eventToEdit.organizer || "",
        capacity: eventToEdit.capacity || 100,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        date: "",
        venue: "",
        organizer: "",
        capacity: 100,
      });
    }
    setError("");
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.venue || !formData.organizer) {
      setError("Please fill out all required fields.");
      return;
    }
    onSave({
      ...formData,
      capacity: Number(formData.capacity),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{eventToEdit ? "Edit Event" : "Create New Event"}</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Annual Tech Symposium 2026"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide event details, schedule or highlights..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Event Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Capacity *</label>
              <input
                type="number"
                name="capacity"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Venue Location *</label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g. Main Auditorium, Hall B"
                required
              />
            </div>

            <div className="form-group">
              <label>Organizer Name *</label>
              <input
                type="text"
                name="organizer"
                value={formData.organizer}
                onChange={handleChange}
                placeholder="e.g. ACM Student Chapter"
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {eventToEdit ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
