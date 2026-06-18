import Event from "../models/Event.js";
import Seat from "../models/Seat.js";
import { parseSeatNumber } from "../utils/seatUtils.js";

const seatSort = (a, b) => {
  const rowA = parseSeatNumber(a.seatNumber);
  const rowB = parseSeatNumber(b.seatNumber);
  if (rowA.rowIndex !== rowB.rowIndex) {
    return rowA.rowIndex - rowB.rowIndex;
  }

  return rowA.seatIndex - rowB.seatIndex;
};

export const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ dateTime: 1 });
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const seats = await Seat.find({ eventId: event._id });
    res.json({
      event,
      seats: seats.sort(seatSort).map((seat) => ({
        _id: seat._id,
        seatNumber: seat.seatNumber,
        status: seat.status,
      })),
    });
  } catch (error) {
    next(error);
  }
};
