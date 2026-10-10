import mongoose from "mongoose";
import Event from "../models/Event.js";

// Helper to escape regex special characters to prevent ReDoS / syntax errors
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

// GET all events with enhanced search, venue, category, and date filters
export const getAllEvents = async (req, res) => {
  try {
    const { search, venue, category, status, upcomingOnly, sortBy } = req.query;
    const filter = {};

    // Multi-field search filter (title, description, organizer, venue, category)
    if (search && search.trim() !== "") {
      const sanitized = escapeRegex(search.trim());
      filter.$or = [
        { title: { $regex: sanitized, $options: "i" } },
        { description: { $regex: sanitized, $options: "i" } },
        { organizer: { $regex: sanitized, $options: "i" } },
        { venue: { $regex: sanitized, $options: "i" } },
        { category: { $regex: sanitized, $options: "i" } },
      ];
    }

    // Venue filter (case-insensitive)
    if (venue && venue.trim() !== "") {
      filter.venue = { $regex: escapeRegex(venue.trim()), $options: "i" };
    }

    // Category filter
    if (category && category.trim() !== "") {
      filter.category = category.trim();
    }

    // Status filter
    if (status && status.trim() !== "") {
      filter.status = status.trim();
    }

    // Optional filter for only upcoming events
    if (upcomingOnly === "true") {
      filter.date = { $gte: new Date() };
    }

    // Dynamic sorting
    let sortOption = { date: 1 }; // Default: earliest upcoming event first
    if (sortBy === "date_desc") {
      sortOption = { date: -1 };
    } else if (sortBy === "title_asc") {
      sortOption = { title: 1 };
    } else if (sortBy === "capacity_desc") {
      sortOption = { capacity: -1 };
    } else if (sortBy === "capacity_asc") {
      sortOption = { capacity: 1 };
    }

    const events = await Event.find(filter)
      .populate("registeredUsers", "name email")
      .sort(sortOption);

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events", error: error.message });
  }
};

// GET distinct list of venues (useful for UI venue dropdown filters)
export const getVenues = async (req, res) => {
  try {
    const venues = await Event.distinct("venue");
    const cleanedVenues = venues.filter((v) => v && v.trim() !== "").sort();
    res.json(cleanedVenues);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch venues", error: error.message });
  }
};

// GET supported event categories
export const getCategories = async (req, res) => {
  try {
    const categories = [
      "Technical",
      "Cultural",
      "Workshop",
      "Hackathon",
      "Seminar",
      "Sports",
      "Other",
    ];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
};

// GET a single event by ID
export const getEventById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID format" });
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
    const { title, description, date, venue, organizer, capacity, category, price } = req.body;

    if (!title || !description || !date || !venue || !organizer || !capacity) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const numericCapacity = Number(capacity);
    if (isNaN(numericCapacity) || numericCapacity <= 0) {
      return res.status(400).json({ message: "Capacity must be a positive integer" });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid event date format" });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      date: parsedDate,
      venue: venue.trim(),
      organizer: organizer.trim(),
      capacity: numericCapacity,
      category: category ? category.trim() : "Technical",
      price: price !== undefined ? Math.max(0, Number(price)) : 0,
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
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const currentEvent = await Event.findById(req.params.id);
    if (!currentEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Safety check: new capacity cannot be lower than existing registered users
    if (req.body.capacity !== undefined) {
      const newCapacity = Number(req.body.capacity);
      if (isNaN(newCapacity) || newCapacity <= 0) {
        return res.status(400).json({ message: "Capacity must be a positive integer" });
      }
      if (newCapacity < currentEvent.registeredUsers.length) {
        return res.status(400).json({
          message: `Capacity cannot be reduced below current registrations (${currentEvent.registeredUsers.length})`,
        });
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update event" });
  }
};

// DELETE an event (Admin only)
export const deleteEvent = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted successfully", id: req.params.id });
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
