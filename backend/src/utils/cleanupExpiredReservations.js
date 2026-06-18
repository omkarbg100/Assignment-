import Reservation from "../models/Reservation.js";
import Seat from "../models/Seat.js";

export const cleanupExpiredReservations = async () => {
  const now = new Date();
  const expiredReservations = await Reservation.find({
    expiresAt: { $lt: now },
    status: "active",
  });

  for (const reservation of expiredReservations) {
    await Seat.updateMany(
      { eventId: reservation.eventId, reservationId: reservation._id },
      {
        $set: { status: "available" },
        $unset: { reservedBy: "", reservationId: "" },
      }
    );

    reservation.status = "expired";
    await reservation.save();
  }

  return expiredReservations.length;
};
