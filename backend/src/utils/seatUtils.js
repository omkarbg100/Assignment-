const indexToRowLabel = (index) => {
  let value = index;
  let label = "";

  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }

  return label;
};

const rowLabelToIndex = (label) => {
  let value = 0;
  for (const char of label.toUpperCase()) {
    value = value * 26 + (char.charCodeAt(0) - 64);
  }
  return value;
};

export const parseSeatNumber = (seatNumber) => {
  const match = seatNumber.match(/^([A-Z]+)(\d+)$/i);
  if (!match) {
    return { rowIndex: 0, seatIndex: 0 };
  }

  return {
    rowIndex: rowLabelToIndex(match[1]),
    seatIndex: Number(match[2]),
  };
};

export const buildSeatNumbers = (totalSeats) => {
  const seats = [];
  for (let i = 1; i <= totalSeats; i += 1) {
    const rowIndex = Math.ceil(i / 10);
    const row = indexToRowLabel(rowIndex);
    seats.push(`${row}${((i - 1) % 10) + 1}`);
  }
  return seats;
};
