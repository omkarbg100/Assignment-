import { useEffect, useState } from "react";
import adminApi from "../../api/adminAxios";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import AdminTopbar from "../../components/AdminTopbar";

const StatCard = ({ label, value }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="text-sm text-slate-500">{label}</div>
    <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboardRes, bookingsRes, reservationsRes] = await Promise.all([
          adminApi.get("/admin/dashboard"),
          adminApi.get("/admin/bookings"),
          adminApi.get("/admin/reservations"),
        ]);
        setStats(dashboardRes.data.stats);
        setBookings(bookingsRes.data.bookings);
        setReservations(reservationsRes.data.reservations);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <AdminTopbar
        title="Dashboard"
        subtitle="Monitor the ticketing system from a single place."
      />
      <ErrorMessage message={error} />
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total events" value={stats?.totalEvents ?? 0} />
        <StatCard label="Total bookings" value={stats?.totalBookings ?? 0} />
        <StatCard label="Active reservations" value={stats?.activeReservations ?? 0} />
        <StatCard label="Booked seats" value={stats?.bookedSeatsCount ?? 0} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Recent bookings</h2>
          <div className="mt-4 space-y-3">
            {bookings.map((booking) => (
              <div key={booking._id} className="rounded-2xl bg-slate-50 p-4 text-sm">
                <div className="font-semibold text-slate-900">{booking.eventId?.name}</div>
                <div className="text-slate-500">
                  {booking.userId?.email} · {booking.seatNumbers.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Reservations</h2>
          <div className="mt-4 space-y-3">
            {reservations.map((reservation) => (
              <div key={reservation._id} className="rounded-2xl bg-slate-50 p-4 text-sm">
                <div className="font-semibold text-slate-900">{reservation.eventId?.name}</div>
                <div className="text-slate-500">
                  {reservation.userId?.email} · {reservation.status} ·{" "}
                  {new Date(reservation.expiresAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
