import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { cleanupExpiredReservations } from "./cleanupExpiredReservations.js";

dotenv.config();

const run = async () => {
  await connectDB(process.env.MONGO_URI);
  const count = await cleanupExpiredReservations();
  console.log(`Cleaned up ${count} expired reservations`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
