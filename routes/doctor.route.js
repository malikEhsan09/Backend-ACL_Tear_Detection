import express from "express";
import { upload } from "../middleware/multerStorage.js";
import {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctorById,
  deleteDoctor,
  getDoctorAppointments,
  cancelAppointment,
  createSchedule,
  updateSchedule,
  // getDoctorScheduleByID,
  // getDoctorSchedule,
  getAllDoctorSchedule,
  getDoctorScheduleByDoctorID,
  deleteSchedule,
  // getAllDoctorSchedule,
} from "../controllers/doctor.controller.js";
import { isDoctor, verifyToken } from "../middleware/auth.mw.js";

const router = express.Router();

router.get("/schedules", getAllDoctorSchedule); // Get all schedules
router.get("/",verifyToken, getAllDoctors);
router.get("/:id",verifyToken, getDoctorById);
router.post("/", createDoctor);
router.patch(
  "/:id",
  verifyToken,
  upload.fields([{ name: "image", maxCount: 1 }]),
  updateDoctorById
);
router.delete("/:id", deleteDoctor);

// Manage scheduled Doctor tasks
router.get("/schedule/:doctorID", verifyToken, isDoctor, getDoctorScheduleByDoctorID); // Fetch schedule by doctorID
router.post('/create-schedule', verifyToken, isDoctor, createSchedule); // Create a new schedule
router.put('/schedule/update', verifyToken, isDoctor, updateSchedule);
// Route to delete a schedule
router.delete('/schedule/delete', verifyToken, isDoctor, deleteSchedule);

// router.put('/schedule/update/:doctorID', verifyToken, isDoctor, updateSchedule); // Update a schedule
router.delete("/appointment/:appointmentID",verifyToken , isDoctor, cancelAppointment); // Cancel an appointment
router.get("/appointments/:doctorID", getDoctorAppointments); // Get appointments for a specific doctor

export default router;
