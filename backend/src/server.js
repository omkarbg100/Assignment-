import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cron from "node-cron";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import { cleanupExpiredReservations } from "./utils/cleanupExpiredReservations.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/reserve", reservationRoutes);
app.use("/api/bookings", bookingRoutes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await cleanupExpiredReservations();
    cron.schedule("*/5 * * * *", async () => {
      try {
        await cleanupExpiredReservations();
      } catch (error) {
        console.error("Cleanup failed:", error.message);
      }
    });
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

start();
