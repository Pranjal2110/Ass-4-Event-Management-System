import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    category: {
      type: String,
      enum: {
        values: [
          "Technical",
          "Cultural",
          "Workshop",
          "Hackathon",
          "Seminar",
          "Sports",
          "Other",
        ],
        message: "{VALUE} is not a supported category",
      },
      default: "Technical",
      trim: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },
    registeredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for available seats
eventSchema.virtual("availableSeats").get(function () {
  const registeredCount = Array.isArray(this.registeredUsers)
    ? this.registeredUsers.length
    : 0;
  return Math.max(0, this.capacity - registeredCount);
});

// Virtual for sold-out status
eventSchema.virtual("isSoldOut").get(function () {
  const registeredCount = Array.isArray(this.registeredUsers)
    ? this.registeredUsers.length
    : 0;
  return registeredCount >= this.capacity;
});

// Compound & text indexes for optimized search & venue filtering
eventSchema.index({ venue: 1, date: 1 });
eventSchema.index({ category: 1, date: 1 });
eventSchema.index({
  title: "text",
  description: "text",
  organizer: "text",
  venue: "text",
});

export default mongoose.model("Event", eventSchema);