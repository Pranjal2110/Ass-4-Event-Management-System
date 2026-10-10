import mongoose from "mongoose";
import Event from "../models/Event.js";

// GET all events with optional search/filter
export const getAllEvents = async (req, res) => {
  try {
    const { search, venue } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { organizer: { $regex: search, $options: "i" } },
      ];
    }

    if (venue) {
      filter.venue = { $regex: venue, $options: "i" };
    }

    const events = await Event.find(filter)
      .populate("registeredUsers", "name email")
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events", error: error.message });
  }
};

// GET a single event by ID
export const getEventById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findById(req.params.id).populate(
      "registeredUsers",
      "name email"
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event", error: error.message });
  }
};

// CREATE a new event (Admin only)
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, venue, organizer, capacity } = req.body;

    if (!title || !description || !date || !venue || !organizer || !capacity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const event = await Event.create({
      title,
      description,
      date,
      venue,
      organizer,
      capacity: Number(capacity),
      registeredUsers: [],
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to create event" });
  }
};

// UPDATE an existing event (Admin only)
export const updateEvent = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update event" });
  }
};

// DELETE an event (Admin only)
export const deleteEvent = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event", error: error.message });
  }
};

// REGISTER for an event (User role with atomic capacity check)
export const registerForEvent = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const userId = req.user._id;

    // Check if event has already passed
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({
        message: "Registration is closed. This event has already taken place.",
      });
    }

    // Check if already registered
    const isAlreadyRegistered = event.registeredUsers.some(
      (id) => id.toString() === userId.toString()
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({ message: "You are already registered for this event." });
    }

    // Check current capacity before atomic write
    if (event.registeredUsers.length >= event.capacity) {
      return res.status(400).json({ message: "Event is fully booked! No seats available." });
    }

    // Atomic update to avoid race conditions with concurrent registrations
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: req.params.id,
        registeredUsers: { $ne: userId },
        $expr: { $lt: [{ $size: "$registeredUsers" }, "$capacity"] },
      },
      {
        $push: { registeredUsers: userId },
      },
      { new: true }
    ).populate("registeredUsers", "name email");

    if (!updatedEvent) {
      // Re-fetch to give precise error
      const freshEvent = await Event.findById(req.params.id);
      if (freshEvent && freshEvent.registeredUsers.length >= freshEvent.capacity) {
        return res.status(400).json({ message: "Event is fully booked! No seats available." });
      }
      return res.status(400).json({ message: "Unable to complete registration. Please try again." });
    }

    // Generate ticket reference ID
    const ticketId = `EVT-${event._id.toString().slice(-4).toUpperCase()}-${userId
      .toString()
      .slice(-4)
      .toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const seatsLeft = Math.max(0, updatedEvent.capacity - updatedEvent.registeredUsers.length);

    res.json({
      message: "Successfully registered for the event!",
      ticketId,
      seatsLeft,
      event: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// CANCEL registration (User role with atomic update)
export const cancelRegistration = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const userId = req.user._id;

    // Verify user was registered
    const wasRegistered = event.registeredUsers.some(
      (id) => id.toString() === userId.toString()
    );

    if (!wasRegistered) {
      return res.status(400).json({
        message: "You are not currently registered for this event.",
      });
    }

    // Atomic removal of user from registered list
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $pull: { registeredUsers: userId } },
      { new: true }
    ).populate("registeredUsers", "name email");

    const seatsLeft = Math.max(0, updatedEvent.capacity - updatedEvent.registeredUsers.length);

    res.json({
      message: "Registration cancelled successfully",
      seatsLeft,
      event: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel registration", error: error.message });
  }
};

// GET logged-in user's registrations
export const getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await Event.find({ registeredUsers: userId })
      .populate("registeredUsers", "name email")
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch registrations", error: error.message });
  }
};

// GET registration status for the current logged-in user
export const getRegistrationStatus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const userId = req.user._id;
    const isRegistered = event.registeredUsers.some(
      (id) => id.toString() === userId.toString()
    );
    const registeredCount = event.registeredUsers.length;
    const seatsLeft = Math.max(0, event.capacity - registeredCount);
    const isSoldOut = registeredCount >= event.capacity;
    const isPast = new Date(event.date) < new Date();

    res.json({
      eventId: event._id,
      isRegistered,
      registeredCount,
      capacity: event.capacity,
      seatsLeft,
      isSoldOut,
      isRegistrationOpen: !isSoldOut && !isPast,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch registration status", error: error.message });
  }
};

// GET attendee list for an event (Admin / Organizer)
export const getEventAttendees = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const event = await Event.findById(req.params.id).populate(
      "registeredUsers",
      "name email createdAt"
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      eventId: event._id,
      title: event.title,
      date: event.date,
      capacity: event.capacity,
      registeredCount: event.registeredUsers.length,
      seatsLeft: Math.max(0, event.capacity - event.registeredUsers.length),
      attendees: event.registeredUsers,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch attendees", error: error.message });
  }
};

