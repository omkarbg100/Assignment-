import { Router } from "express";
import { reserveSeats } from "../controllers/reservation.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", requireAuth, reserveSeats);

export default router;
