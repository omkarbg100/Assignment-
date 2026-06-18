import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import adminApi from "../../api/adminAxios";
import ErrorMessage from "../../components/ErrorMessage";
import AdminTopbar from "../../components/AdminTopbar";

const emptyForm = {
  name: "",
  description: "",
  dateTime: "",
  venue: "",
  totalSeats: 100,
  posterUrl: "",
};

const AdminEventForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!isEdit) return;
      const { data } = await adminApi.get(`/admin/events/${id}`);
      if (data.event) {
        setForm({
          name: data.event.name || "",
          description: data.event.description || "",
          dateTime: new Date(data.event.dateTime).toISOString().slice(0, 16),
          venue: data.event.venue || "",
          totalSeats: data.event.totalSeats || 100,
          posterUrl: data.event.posterUrl || "",
        });
      }
    };

    load();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isEdit) {
        await adminApi.put(`/admin/events/${id}`, form);
      } else {
        await adminApi.post("/admin/events", form);
      }
      navigate("/admin/events");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AdminTopbar
        title={isEdit ? "Edit event" : "Create event"}
        subtitle="The seat grid is generated automatically from totalSeats."
      />

      <form className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2" onSubmit={handleSubmit}>
        <input
          className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 md:col-span-2"
          placeholder="Event name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <textarea
          className="min-h-32 rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 md:col-span-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="datetime-local"
          className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          value={form.dateTime}
          onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
        />
        <input
          className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          placeholder="Venue"
          value={form.venue}
          onChange={(e) => setForm({ ...form, venue: e.target.value })}
        />
        <input
          type="number"
          className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          placeholder="Total seats"
          value={form.totalSeats}
          onChange={(e) => setForm({ ...form, totalSeats: Number(e.target.value) })}
        />
        <input
          className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          placeholder="Poster URL"
          value={form.posterUrl}
          onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
        />
        <ErrorMessage message={error} />
        <button
          className="rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white md:col-span-2 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save event"}
        </button>
      </form>
    </div>
  );
};

export default AdminEventForm;
