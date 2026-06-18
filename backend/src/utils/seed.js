import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Event from "../models/Event.js";
import Seat from "../models/Seat.js";
import { buildSeatNumbers } from "./seatUtils.js";

dotenv.config();

const seed = async () => {
  await connectDB(process.env.MONGO_URI);

  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    Seat.deleteMany({}),
  ]);

  const password = await bcrypt.hash("123456", 10);
  await User.create({
    name: "Omkar",
    email: "omkar@gmail.com",
    password,
  });

  const events = await Event.insertMany([
    {
      name: "Music Night",
      description: "An energetic live music showcase.",
      dateTime: new Date("2026-06-20T18:00:00.000Z"),
      venue: "Mumbai Arena",
      totalSeats: 50,
      posterUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
    },
    {
      name: "Comedy Carnival",
      description: "Stand-up comedy from top performers.",
      dateTime: new Date("2026-06-22T19:30:00.000Z"),
      venue: "Delhi Auditorium",
      totalSeats: 40,
      posterUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
    },
  ]);

  const seats = [];
  for (const event of events) {
    const seatNumbers = buildSeatNumbers(event.totalSeats);
    for (const seatNumber of seatNumbers) {
      seats.push({ eventId: event._id, seatNumber, status: "available" });
    }
  }

  await Seat.insertMany(seats);
  console.log("Seed completed");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
