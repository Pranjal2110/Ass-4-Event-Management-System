import { useAuth } from "../context/AuthContext";

export default function EventCard({
  event,
  onRegister,
  onCancelRegistration,
  onEdit,
  onDelete,
}) {
  const { user, isAdmin } = useAuth();

  const formattedDate = new Date(event.date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const registeredCount = event.registeredUsers?.length || 0;
  const seatsLeft = Math.max(0, event.capacity - registeredCount);
  const isFull = seatsLeft === 0;

  const isUserRegistered =
    user &&
    event.registeredUsers?.some((u) => {
      const regId = typeof u === "string" ? u : u._id;
      return regId === user.id;
    });

  return (
    <article className="event-card">
      <div className="event-card-header">
        <span className="event-badge">
          {isFull ? "Housefull" : `${seatsLeft} seats left`}
        </span>
        <span className="event-date-chip">{formattedDate}</span>
      </div>

      <div className="event-card-body">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-desc">{event.description}</p>

        <div className="event-meta">
          <div className="meta-item">
            <span className="meta-icon">📍</span>
            <span>{event.venue}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">👤</span>
            <span>Organized by <strong>{event.organizer}</strong></span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">🎟️</span>
            <span>
              Capacity: <strong>{registeredCount} / {event.capacity}</strong>
            </span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="capacity-bar-container">
          <div
            className={`capacity-bar ${isFull ? "full" : ""}`}
            style={{
              width: `${Math.min(100, (registeredCount / event.capacity) * 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="event-card-actions">
        {isAdmin ? (
          <div className="admin-actions">
            <button
              className="action-btn edit-btn"
              onClick={() => onEdit(event)}
            >
              ✏️ Edit
            </button>
            <button
              className="action-btn delete-btn"
              onClick={() => onDelete(event._id)}
            >
              🗑️ Delete
            </button>
          </div>
        ) : isUserRegistered ? (
          <div className="user-registered-actions">
            <span className="registered-badge">✓ Registered</span>
            {onCancelRegistration && (
              <button
                className="cancel-reg-btn"
                onClick={() => onCancelRegistration(event._id)}
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          <button
            className={`action-btn register-btn ${isFull ? "disabled" : ""}`}
            disabled={isFull}
            onClick={() => onRegister(event._id)}
          >
            {isFull ? "Sold Out" : "Register Now"}
          </button>
        )}
      </div>
    </article>
  );
}
