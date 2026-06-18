import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import EventCard from "../components/EventCard";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/events");
        setEvents(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Upcoming events</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Pick an event, choose seats, reserve them for 10 minutes, and confirm your booking before the timer ends.
        </p>
      </div>

      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
