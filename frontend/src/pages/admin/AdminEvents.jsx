import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminApi from "../../api/adminAxios";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import AdminTopbar from "../../components/AdminTopbar";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const { data } = await adminApi.get("/admin/events");
      setEvents(data.events);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (eventId) => {
    await adminApi.delete(`/admin/events/${eventId}`);
    load();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <AdminTopbar
        title="Events"
        subtitle="Create, edit, delete, and inspect event seat maps."
        actions={
          <Link
            to="/admin/events/create"
            className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white"
          >
            Create event
          </Link>
        }
      />
      <ErrorMessage message={error} />
      <div className="mt-6 space-y-4">
        {events.map((event) => (
          <div key={event._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{event.name}</h3>
                <p className="text-sm text-slate-500">
                  {event.venue} · {new Date(event.dateTime).toLocaleString()} · {event.totalSeats} seats
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/admin/events/${event._id}/seats`}
                  className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  View seats
                </Link>
                <Link
                  to={`/admin/events/${event._id}/edit`}
                  className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminEvents;
