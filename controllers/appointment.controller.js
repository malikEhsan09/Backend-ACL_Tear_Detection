import DoctorSchedule from "../models/doctorSchedule.model.js";
import Appointment from "../models/appointment.model.js";
import Player from "../models/player.model.js"
import mongoose from "mongoose";


export const getAvailableSlots = async (req, res) => {
  try {
    // const { doctorID } = req.params;

    // const schedule = await DoctorSchedule.findOne({ doctorID });
    // const { doctorID } = req.params;

    const schedule = await DoctorSchedule.findOne();

    if (!schedule) {
      return res.status(404).json({ message: "No schedule found for this doctor" });
    }

    const availableSlots = schedule.slots.map((slot) => ({
      day: slot.day,
      timings: slot.timings.filter((time) => time.status === "available"),
    }));

    res.status(200).json({ availableSlots });
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const { doctorID, day, startTime, endTime, appointmentType } = req.body;

    // Extract userID from token (stored in req.user by `verifyToken` middleware)
    const userID = req.user?._id;
    console.log("Player as a user ID:", userID);

    if (!userID) {
      return res.status(401).json({ message: "Unauthorized: User ID is missing" });
    }

    // Fetch the player record linked to the user
    const player = await Player.findOne({ userID });
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const playerID = player._id;

    // Validate input fields
    if (!playerID || !doctorID || !day || !startTime || !endTime || !appointmentType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["physical", "online"].includes(appointmentType)) {
      return res.status(400).json({ message: "Invalid appointment type" });
    }

    // const findAllSchedule = await DoctorSchedule.find();
    // console.log("Here are all schedules:", findAllSchedule);

    // Fetch the doctor's schedule (convert doctorID to ObjectId for proper query)
    const schedule = await DoctorSchedule.findOne({
      doctorID: new mongoose.Types.ObjectId(doctorID),
    });
    console.log("Fetched Schedule:", schedule);

    if (!schedule) {
      return res.status(404).json({ message: "No schedule found for this doctor" });
    }

    // Check if slots exist
    const slot = schedule.slots.find((s) => s.day === day);
    if (!slot) {
      return res.status(400).json({ message: `No slots available for ${day}` });
    }

    // Find the specific timing
    const timing = slot.timings.find(
      (t) =>
        t.startTime.toISOString() === new Date(startTime).toISOString() &&
        t.endTime.toISOString() === new Date(endTime).toISOString() &&
        t.status === "available"
    );

    if (!timing) {
      return res.status(400).json({
        message: `Slot from ${startTime} to ${endTime} on ${day} is unavailable or already booked.`,
      });
    }

    // Mark the slot as booked
    timing.status = "booked";
    await schedule.save();

    // Create the appointment
    const newAppointment = new Appointment({
      playerID,
      doctorID,
      scheduleID: schedule._id,
      slot: { day, time: `${startTime} - ${endTime}` },
      appointmentType,
    });

    await newAppointment.save();

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Error booking appointment:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};