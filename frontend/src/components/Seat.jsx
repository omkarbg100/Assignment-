const styleByStatus = {
  available: "border-slate-300 bg-white text-slate-700 hover:bg-emerald-100",
  selected: "border-blue-500 bg-blue-500 text-white",
  reserved: "border-yellow-300 bg-yellow-300 text-slate-900 cursor-not-allowed",
  booked: "border-slate-500 bg-slate-600 text-white cursor-not-allowed",
};

const Seat = ({ seat, isSelected, onClick, disabled }) => {
  const status = isSelected ? "selected" : seat.status;
  const canClick = !disabled && seat.status === "available";

  return (
    <button
      type="button"
      disabled={!canClick}
      onClick={onClick}
      className={`flex h-11 items-center justify-center rounded-xl border text-xs font-semibold transition ${
        styleByStatus[status]
      } ${canClick ? "shadow-sm" : ""}`}
      title={seat.seatNumber}
    >
      {seat.seatNumber}
    </button>
  );
};

export default Seat;
