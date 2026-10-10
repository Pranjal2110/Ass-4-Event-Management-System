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

// REGISTER for an event (User role)
export const registerForEvent = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const userId = req.user._id;

    // Check if already registered
    const isAlreadyRegistered = event.registeredUsers.some(
      (id) => id.toString() === userId.toString()
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({ message: "You are already registered for this event." });
    }

    // Check capacity
    if (event.registeredUsers.length >= event.capacity) {
      return res.status(400).json({ message: "Event is fully booked! No seats available." });
    }

    event.registeredUsers.push(userId);
    await event.save();

    res.json({
      message: "Successfully registered for the event!",
      event,
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// CANCEL registration
export const cancelRegistration = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const userId = req.user._id;
    event.registeredUsers = event.registeredUsers.filter(
      (id) => id.toString() !== userId.toString()
    );

    await event.save();
    res.json({ message: "Registration cancelled successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel registration", error: error.message });
  }
};

// GET logged-in user's registrations
export const getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await Event.find({ registeredUsers: userId }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch registrations", error: error.message });
  }
};
