import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import Seat from "../models/Seat.js";
import Booking from "../models/Booking.js";

export const confirmBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reservationId } = req.body;
    const userId = req.user._id;

    if (!reservationId) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "reservationId is required" });
    }

    const reservation = await Reservation.findById(reservationId).session(session);
    if (!reservation) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Reservation not found" });
    }

    if (String(reservation.userId) !== String(userId)) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "This reservation does not belong to you" });
    }

    if (reservation.status !== "active") {
      await session.abortTransaction();
      return res.status(409).json({ success: false, message: "Reservation is no longer active" });
    }

    if (reservation.expiresAt <= new Date()) {
      reservation.status = "expired";
      await reservation.save({ session });
      await Seat.updateMany(
        { eventId: reservation.eventId, reservationId: reservation._id },
        {
          $set: { status: "available" },
          $unset: { reservedBy: "", reservationId: "" },
        },
        { session }
      );
      await session.commitTransaction();
      return res.status(410).json({ success: false, message: "Reservation expired" });
    }

    const seats = await Seat.find({
      eventId: reservation.eventId,
      seatNumber: { $in: reservation.seatNumbers },
      status: "reserved",
      reservedBy: userId,
      reservationId: reservation._id,
    }).session(session);

    if (seats.length !== reservation.seatNumbers.length) {
      await session.abortTransaction();
      return res.status(409).json({ success: false, message: "Seats are no longer available" });
    }

    const seatUpdateResult = await Seat.updateMany(
      {
        eventId: reservation.eventId,
        seatNumber: { $in: reservation.seatNumbers },
        status: "reserved",
        reservedBy: userId,
        reservationId: reservation._id,
      },
      {
        $set: { status: "booked" },
        $unset: { reservedBy: "", reservationId: "" },
      },
      { session }
    );

    if (seatUpdateResult.modifiedCount !== reservation.seatNumbers.length) {
      await session.abortTransaction();
      return res.status(409).json({ success: false, message: "Unable to book all seats" });
    }

    const booking = await Booking.create(
      [
        {
          userId,
          eventId: reservation.eventId,
          seatNumbers: reservation.seatNumbers,
          reservationId: reservation._id,
          bookedAt: new Date(),
        },
      ],
      { session }
    );

    reservation.status = "completed";
    await reservation.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Booking confirmed",
      booking: {
        id: booking[0]._id,
        eventId: reservation.eventId,
        seatNumbers: reservation.seatNumbers,
        bookedAt: booking[0].bookedAt,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
