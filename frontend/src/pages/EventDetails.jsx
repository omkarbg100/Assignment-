import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import SeatGrid from "../components/SeatGrid";
import CountdownTimer from "../components/CountdownTimer";
import { AuthContext } from "../context/AuthContext";

const reservationKey = (eventId) => `reservation:${eventId}`;

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [eventData, setEventData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reservation, setReservation] = useState(() => {
    const stored = localStorage.getItem(reservationKey(id));
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setEventData(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    if (reservation) {
      localStorage.setItem(reservationKey(id), JSON.stringify(reservation));
    } else {
      localStorage.removeItem(reservationKey(id));
    }
  }, [id, reservation]);

  const availableSeats = useMemo(
    () => eventData?.seats.filter((seat) => seat.status === "available").length ?? 0,
    [eventData]
  );

  const expired = reservation ? new Date(reservation.expiresAt).getTime() <= Date.now() : false;

  const handleToggleSeat = (seatNumber) => {
    if (reservation) return;
    setSelectedSeats((current) =>
      current.includes(seatNumber) ? current.filter((seat) => seat !== seatNumber) : [...current, seatNumber]
    );
  };

  const handleReserve = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setError("");
    setActionLoading(true);
    try {
      const { data } = await api.post("/reserve", {
        eventId: id,
        seatNumbers: selectedSeats,
      });
      setReservation(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reserve seats");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!reservation) return;
    setError("");
    setActionLoading(true);
    try {
      const { data } = await api.post("/bookings", { reservationId: reservation.reservationId });
      localStorage.removeItem(reservationKey(id));
      localStorage.setItem("lastBooking", JSON.stringify({ booking: data.booking, event: eventData.event }));
      navigate("/success", {
        state: {
          booking: data.booking,
          event: eventData.event,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to confirm booking");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExpire = () => {
    setError("Reservation expired. Please select seats again.");
    setReservation(null);
    setSelectedSeats([]);
  };

  if (loading) return <Loader />;
  if (!eventData) return <div className="px-4 py-10"><ErrorMessage message={error} /></div>;

  const seats = reservation
    ? eventData.seats.map((seat) =>
        reservation.seatNumbers.includes(seat.seatNumber) ? { ...seat, status: "reserved" } : seat
      )
    : eventData.seats;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900">{eventData.event.name}</h1>
            <p className="mt-2 text-slate-600">{eventData.event.description}</p>
            <div className="mt-4 grid gap-3 text-sm text-slate-500 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">{eventData.event.venue}</div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                {new Date(eventData.event.dateTime).toLocaleString()}
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">{availableSeats} seats available</div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Select seats</h2>
              <div className="text-sm text-slate-500">{selectedSeats.length} selected</div>
            </div>
            <SeatGrid
              seats={seats}
              selectedSeats={selectedSeats}
              onToggleSeat={handleToggleSeat}
              locked={Boolean(reservation)}
            />
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Reservation</h3>
            <p className="mt-2 text-sm text-slate-500">
              Reserve available seats to hold them for 10 minutes before confirming.
            </p>
            <div className="mt-4">
              {reservation ? (
                <CountdownTimer expiresAt={reservation.expiresAt} onExpire={handleExpire} />
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
                  No active reservation yet.
                </div>
              )}
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <div className="mb-2 font-medium text-slate-700">Selected seats</div>
                <div className="flex flex-wrap gap-2">
                  {(reservation?.seatNumbers || selectedSeats).length ? (
                    (reservation?.seatNumbers || selectedSeats).map((seat) => (
                      <span key={seat} className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                        {seat}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">No seats selected</span>
                  )}
                </div>
              </div>
            </div>

            <ErrorMessage message={error} />

            {!reservation ? (
              <button
                onClick={handleReserve}
                disabled={selectedSeats.length === 0 || actionLoading}
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-4 py-3 font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? "Reserving..." : "Reserve seats"}
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={expired || actionLoading}
                className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? "Confirming..." : "Confirm booking"}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EventDetails;
