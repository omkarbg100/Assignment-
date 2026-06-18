import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import Reservation from "../models/Reservation.js";
import Seat from "../models/Seat.js";
import { buildSeatNumbers, parseSeatNumber } from "../utils/seatUtils.js";

const seatSort = (a, b) => {
  const rowA = parseSeatNumber(a.seatNumber);
  const rowB = parseSeatNumber(b.seatNumber);
  if (rowA.rowIndex !== rowB.rowIndex) return rowA.rowIndex - rowB.rowIndex;
  return rowA.seatIndex - rowB.seatIndex;
};

const signAdminToken = (adminId) =>
  jwt.sign({ id: adminId, role: "admin" }, process.env.ADMIN_JWT_SECRET, {
    expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || "7d",
  });

const buildSeatDocuments = (eventId, totalSeats) =>
  buildSeatNumbers(totalSeats).map((seatNumber) => ({
    eventId,
    seatNumber,
    status: "available",
  }));

export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = signAdminToken(admin._id);

    res.json({
      success: true,
      token,
      admin: {
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, description = "", dateTime, venue, totalSeats, posterUrl = "" } = req.body;

    if (!name || !dateTime || !venue || !totalSeats) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "name, dateTime, venue and totalSeats are required" });
    }

    const event = await Event.create(
      [
        {
          name,
          description,
          dateTime,
          venue,
          totalSeats,
          posterUrl,
        },
      ],
      { session }
    );

    const createdEvent = event[0];
    await Seat.insertMany(buildSeatDocuments(createdEvent._id, Number(totalSeats)), { session });

    await session.commitTransaction();
    res.status(201).json({ success: true, event: createdEvent });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const updateEvent = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = await Event.findById(req.params.id).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const { name, description, dateTime, venue, totalSeats, posterUrl } = req.body;
    const nextTotalSeats = totalSeats ? Number(totalSeats) : event.totalSeats;

    const hasSeatsLocked = await Seat.exists({
      eventId: event._id,
      status: { $in: ["reserved", "booked"] },
    }).session(session);

    if (totalSeats && Number(totalSeats) !== event.totalSeats && hasSeatsLocked) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: "Cannot change totalSeats after reservations or bookings exist",
      });
    }

    event.name = name ?? event.name;
    event.description = description ?? event.description;
    event.dateTime = dateTime ?? event.dateTime;
    event.venue = venue ?? event.venue;
    event.totalSeats = nextTotalSeats;
    event.posterUrl = posterUrl ?? event.posterUrl;
    await event.save({ session });

    const existingSeats = await Seat.find({ eventId: event._id }).session(session);
    const targetSeatNumbers = new Set(buildSeatNumbers(nextTotalSeats));

    if (existingSeats.length < nextTotalSeats) {
      const existingNumbers = new Set(existingSeats.map((seat) => seat.seatNumber));
      const newSeatNumbers = [...targetSeatNumbers].filter((seatNumber) => !existingNumbers.has(seatNumber));
      if (newSeatNumbers.length) {
        await Seat.insertMany(
          newSeatNumbers.map((seatNumber) => ({
            eventId: event._id,
            seatNumber,
            status: "available",
          })),
          { session }
        );
      }
    } else if (existingSeats.length > nextTotalSeats) {
      const removableSeats = existingSeats.filter(
        (seat) => seat.status === "available" && !targetSeatNumbers.has(seat.seatNumber)
      );
      if (removableSeats.length) {
        await Seat.deleteMany({ _id: { $in: removableSeats.map((seat) => seat._id) } }, { session });
      }
    }

    await session.commitTransaction();
    res.json({ success: true, event });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const deleteEvent = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = await Event.findById(req.params.id).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    await Seat.deleteMany({ eventId: event._id }, { session });
    await Reservation.deleteMany({ eventId: event._id }, { session });
    await Booking.deleteMany({ eventId: event._id }, { session });
    await event.deleteOne({ session });

    await session.commitTransaction();
    res.json({ success: true, message: "Event deleted" });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [totalEvents, totalBookings, activeReservations, bookedSeatsCount] = await Promise.all([
      Event.countDocuments({}),
      Booking.countDocuments({}),
      Reservation.countDocuments({ status: "active" }),
      Seat.countDocuments({ status: "booked" }),
    ]);

    res.json({
      success: true,
      stats: {
        totalEvents,
        totalBookings,
        activeReservations,
        bookedSeatsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ dateTime: 1 });
    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
};

export const getAdminEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

export const getAdminEventSeats = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const seats = await Seat.find({ eventId: event._id });
    res.json({
      success: true,
      event,
      seats: seats.sort(seatSort).map((seat) => ({
        _id: seat._id,
        seatNumber: seat.seatNumber,
        status: seat.status,
        reservedBy: seat.reservedBy,
        reservationId: seat.reservationId,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .sort({ bookedAt: -1 })
      .populate("eventId", "name dateTime venue")
      .populate("userId", "name email");

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

export const getAllReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find()
      .sort({ createdAt: -1 })
      .populate("eventId", "name dateTime venue")
      .populate("userId", "name email");

    res.json({ success: true, reservations });
  } catch (error) {
    next(error);
  }
};
