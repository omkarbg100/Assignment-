import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import adminApi from "../../api/adminAxios";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import AdminTopbar from "../../components/AdminTopbar";
import AdminSeatGrid from "../../components/AdminSeatGrid";

const AdminEventSeats = () => {
  const { id } = useParams();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await adminApi.get(`/admin/events/${id}/seats`);
        setEventData(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load seats");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <Loader />;

  return (
    <div>
      <AdminTopbar
        title={`${eventData?.event?.name || "Event"} seats`}
        subtitle="Seat status is read-only in the admin view."
      />
      <ErrorMessage message={error} />
      {eventData ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <AdminSeatGrid seats={eventData.seats} />
        </div>
      ) : null}
    </div>
  );
};

export default AdminEventSeats;
