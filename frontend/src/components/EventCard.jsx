import { Link } from "react-router-dom";

const EventCard = ({ event }) => (
  <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
    <div className="h-44 bg-gradient-to-br from-fuchsia-100 via-white to-violet-100">
      {event.posterUrl ? (
        <img src={event.posterUrl} alt={event.name} className="h-full w-full object-cover" />
      ) : null}
    </div>
    <div className="space-y-4 p-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">{event.name}</h3>
        <p className="mt-1 text-sm text-slate-500">{event.venue}</p>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>{new Date(event.dateTime).toLocaleString()}</span>
        <span>{event.totalSeats} seats</span>
      </div>
      <Link
        to={`/events/${event._id}`}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        View Seats
      </Link>
    </div>
  </article>
);

export default EventCard;
