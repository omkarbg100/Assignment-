import Seat from "./Seat";

const AdminSeatGrid = ({ seats }) => (
  <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
    {seats.map((seat) => (
      <Seat key={seat._id} seat={seat} isSelected={false} onClick={() => {}} disabled />
    ))}
  </div>
);

export default AdminSeatGrid;
