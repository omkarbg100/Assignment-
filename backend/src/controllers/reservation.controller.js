import mongoose from "mongoose";
import Event from "../models/Event.js";
import Reservation from "../models/Reservation.js";
import Seat from "../models/Seat.js";
import { cleanupExpiredReservations } from "../utils/cleanupExpiredReservations.js";

export const reserveSeats = async (req, res, next) => {
  const session = await mongoose.startSession();
  let transactionStarted = false;

  try {
    await cleanupExpiredReservations();
    session.startTransaction();
    transactionStarted = true;

    const { eventId, seatNumbers } = req.body;
    const userId = req.user._id;

    if (!eventId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "eventId and seatNumbers are required" });
    }

    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const seats = await Seat.find({
      eventId,
      seatNumber: { $in: seatNumbers },
      status: "available",
    }).session(session);

    if (seats.length !== seatNumbers.length) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: "One or more selected seats are not available",
      });
    }

    const reservation = await Reservation.create(
      [
        {
          userId,
          eventId,
          seatNumbers,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          status: "active",
        },
      ],
      { session }
    );

    const createdReservation = reservation[0];

    const seatUpdateResult = await Seat.updateMany(
      {
        eventId,
        seatNumber: { $in: seatNumbers },
        status: "available",
      },
      {
        $set: {
          status: "reserved",
          reservedBy: userId,
          reservationId: createdReservation._id,
        },
      },
      { session }
    );

    if (seatUpdateResult.modifiedCount !== seatNumbers.length) {
      await session.abortTransaction();
      return res.status(409).json({ success: false, message: "Reservation failed, please try again" });
    }

    await session.commitTransaction();
    res.status(201).json({
      success: true,
      reservationId: createdReservation._id,
      expiresAt: createdReservation.expiresAt,
      seatNumbers: createdReservation.seatNumbers,
    });
  } catch (error) {
    if (transactionStarted) {
      await session.abortTransaction();
    }
    next(error);
  } finally {
    session.endSession();
  }
};
