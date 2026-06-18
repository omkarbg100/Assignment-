import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getAdminDashboard,
  getAdminEventById,
  getAdminEventSeats,
  getAdminEvents,
  getAllBookings,
  getAllReservations,
  loginAdmin,
  updateEvent,
} from "../controllers/admin.controller.js";
import { adminAuthMiddleware } from "../middleware/admin.middleware.js";

const router = Router();

router.post("/login", loginAdmin);

router.use(adminAuthMiddleware);
router.get("/dashboard", getAdminDashboard);
router.get("/events", getAdminEvents);
router.get("/events/:id", getAdminEventById);
router.post("/events", createEvent);
router.put("/events/:id", updateEvent);
router.delete("/events/:id", deleteEvent);
router.get("/events/:id/seats", getAdminEventSeats);
router.get("/bookings", getAllBookings);
router.get("/reservations", getAllReservations);

export default router;
