import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    seatNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "reserved", "booked"],
      default: "available",
      index: true,
    },
    reservedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

seatSchema.index({ eventId: 1, seatNumber: 1 }, { unique: true });

export default mongoose.model("Seat", seatSchema);
