import Seat from "./Seat";

const SeatGrid = ({ seats, selectedSeats, onToggleSeat, locked }) => {
  return (
    <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
      {seats.map((seat) => (
        <Seat
          key={seat._id}
          seat={seat}
          isSelected={selectedSeats.includes(seat.seatNumber)}
          onClick={() => onToggleSeat(seat.seatNumber)}
          disabled={locked}
        />
      ))}
    </div>
  );
};

export default SeatGrid;
