import express from "express";
import {
  // getAppointments,
  bookAppointment,
  getAvailableSlots,
} from "../controllers/appointment.controller.js";
import { isPlayer, verifyToken } from "../middleware/auth.mw.js";

const router = express.Router();

router.get("/slots", getAvailableSlots);
router.post("/book-appointment",verifyToken, bookAppointment);
// router.get("/",isPlayer, getAppointments);

export default router;
