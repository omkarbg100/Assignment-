import { Router } from "express";
import { confirmBooking } from "../controllers/booking.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", requireAuth, confirmBooking);

export default router;
