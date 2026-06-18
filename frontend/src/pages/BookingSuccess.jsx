import { Link, useLocation } from "react-router-dom";

const BookingSuccess = () => {
  const location = useLocation();
  const cached = JSON.parse(localStorage.getItem("lastBooking") || "{}");
  const booking = location.state?.booking || cached.booking;
  const event = location.state?.event || cached.event;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
          ✓
        </div>
        <h1 className="mt-5 text-3xl font-bold text-slate-900">Booking confirmed</h1>
        <p className="mt-2 text-slate-600">
          Your seats have been booked successfully.
        </p>

        <div className="mt-8 rounded-2xl bg-slate-50 p-5 text-left">
          <div className="text-sm text-slate-500">Event</div>
          <div className="font-semibold text-slate-900">{event?.name || "Booked event"}</div>
          <div className="mt-4 text-sm text-slate-500">Seats</div>
          <div className="font-semibold text-slate-900">{booking?.seatNumbers?.join(", ")}</div>
          <div className="mt-4 text-sm text-slate-500">Booked at</div>
          <div className="font-semibold text-slate-900">
            {booking?.bookedAt ? new Date(booking.bookedAt).toLocaleString() : "Just now"}
          </div>
        </div>

        <Link
          to="/events"
          className="mt-8 inline-flex rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-700"
        >
          Back to events
        </Link>
      </div>
    </div>
  );
};

export default BookingSuccess;
