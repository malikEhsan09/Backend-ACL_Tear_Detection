import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import DoctorSchedule from "../models/doctorSchedule.model.js";
import Appointment from "../models/appointment.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";


// * Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error });
  }
};

//* Get single doctor by id
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userID: req.user._id }).populate(
      "userID",
      "userName email"
    ); // Populate user details if needed

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json(doctor);
  } catch (error) {
    console.error("Error fetching Doctor:", error);
    res.status(500).json({ message: "Error fetching doctor", error });
  }
};

// * Update doctor only his/her information
export const updateDoctorById = async (req, res) => {
  // const updates = req.body;
  try {
    const { id } = req.params;

      // Ensure that the logged-in user is trying to update their own player info
      if (req.user.userType !== "Doctor") {
        return res.status(403).json({ message: "Access denied" });
      }


    // const doctor = await Doctor.findByIdAndUpdate(req.params.id, updates, {
    //   new: true,
    // });

      // Fetch the current player data using either player ID or user ID
      const doctor = await Doctor.findOne({
        $or: [
          { _id: id },
          { userID: req.user._id }, // Check based on userID as well
        ],
      });
      console.log("Fetched Dcotor:", doctor); // Log fetched player for debugging

        // Check if the user ID matches the player's userID
    if (doctor.userID.toString() !== req.user._id.toString()) {
      console.log(`User ID mismatch: ${doctor.userID} !== ${req.user._id}`); // Log mismatch for debugging
      return res
        .status(403)
        .json({ message: "You can only update your own profile" });
    }

    const updateFields = { ...req.body };


     // If updating image
     if (req.files && req.files.image) {
      const image = req.files.image[0].path;
      const imageResponse = await uploadCloudinary(image);
      updateFields.image = imageResponse.url;
    }


    
    // Update the player document
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctor._id, // Use player's _id for the update
      { $set: updateFields },
      { new: true, runValidators: true }
    );


    
    if (!updatedDoctor) {
      return res
        .status(404)
        .json({ message: "Player not found after update attempt" });
    }


    res.status(200).json({
      message: "Doctor updated successfully",
      doctor: updatedDoctor,
    });

  
    // if (!doctor) {
    //   return res.status(404).json({ message: "Doctor not found" });
    // }
    // res.status(200).json(doctor);
  } catch (error) {
    console.error("Error updating Doctor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// * Creaet doctor by admin (optional)
export const createDoctor = async (req, res) => {
  // const { userID } = req.params;
  const {
    userID,
    name,
    medicalLicenseNo,
    gender,
    specialization,
    // adminID,   later on creating with admin ID
    rating,
    numberOfRating,
    verified,
    slots,
    aslots,
  } = req.body;

  if (
    !userID ||
    !name ||
    !medicalLicenseNo ||
    !gender ||
    !specialization ||
    !specialization ||
    !rating ||
    !numberOfRating ||
    !verified ||
    !slots ||
    !aslots
  ) {
    return res.status(400).json({
      message:
        "Some of field are missng check those fields and then process this !!",
    });
  }

  try {
    const newDoctor = new Doctor({
      userID,
      name,
      medicalLicenseNo,
      gender,
      specialization,
      rating,
      numberOfRating,
      verified,
      slots,
      aslots,
    });
    await newDoctor.save();
    res.status(201).json(newDoctor);
  } catch (error) {
    res.status(500).json({ message: "Error creating doctor", error });
  }
};


//* delete doctor
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json({ message: "Doctor deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting doctor", error });
  }
};

// Helper function to check if timings and slots overlap
const doTimingsOverlap = (existingTimings, newTiming) => {
  const { startTime: newStartTime, endTime: newEndTime } = newTiming;

  return existingTimings.some((existingTiming) => {
    const { startTime: existingStartTime, endTime: existingEndTime } = existingTiming;
    return (
      (newStartTime >= existingStartTime && newStartTime < existingEndTime) || // New start overlaps
      (newEndTime > existingStartTime && newEndTime <= existingEndTime) || // New end overlaps
      (newStartTime <= existingStartTime && newEndTime >= existingEndTime) // New range encompasses existing range
    );
  });
};

export const createSchedule = async (req, res) => {
  try {
    const doctorID = req.user._id; // Doctor ID from authenticated user
    let { slots } = req.body;

    console.log("Doctor ID:", doctorID);
    console.log("Slots:", slots);

    // Fetch doctor details to retrieve required fields
    const doctor = await Doctor.findOne({ userID: doctorID })
      .populate("userID", "email userName") // Populate user fields
      .lean(); // Convert Mongoose document to plain JS object

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const { email, userName } = doctor.userID; // Extract email and username from User
    const { phoneNumber, specialization, image } = doctor; // Extract fields from Doctor schema

    // Fetch existing schedules for the doctor
    const existingSchedule = await DoctorSchedule.findOne({ doctorID });

    // Validate slots for overlap
    if (existingSchedule) {
      for (const newSlot of slots) {
        const existingSlot = existingSchedule.slots.find((slot) => slot.day === newSlot.day);

        if (existingSlot) {
          for (const newTiming of newSlot.timings) {
            const hasOverlap = doTimingsOverlap(existingSlot.timings, {
              startTime: new Date(newTiming.startTime),
              endTime: new Date(newTiming.endTime),
            });

            if (hasOverlap) {
              return res.status(400).json({
                message: `Conflict detected for ${newSlot.day}. Slot from ${newTiming.startTime} to ${newTiming.endTime} overlaps with an existing schedule.`,
              });
            }
          }
        }
      }
    }

    // Format slots with Date objects for new schedule or additions
    slots = slots.map((slot) => ({
      day: slot.day,
      timings: slot.timings.map((timing) => ({
        startTime: new Date(timing.startTime),
        endTime: new Date(timing.endTime),
        status: timing.status || "available", // Default to "available"
      })),
    }));

    // Add new slots to existing schedule if no conflict
    if (existingSchedule) {
      for (const newSlot of slots) {
        const existingSlotIndex = existingSchedule.slots.findIndex((slot) => slot.day === newSlot.day);

        if (existingSlotIndex > -1) {
          // Append new timings to existing day
          existingSchedule.slots[existingSlotIndex].timings.push(...newSlot.timings);
        } else {
          // Add a new day slot
          existingSchedule.slots.push(newSlot);
        }
      }

      await existingSchedule.save();

      return res.status(200).json({
        message: "Schedule updated successfully with new slots.",
        schedule: existingSchedule,
      });
    }

    // Create a new schedule if no existing schedule
    const newSchedule = new DoctorSchedule({
      doctorID,
      userName, // Add doctor’s username
      email, // Add doctor’s email
      phoneNumber, // Add doctor’s phone number
      specialization, // Add doctor’s specialization
      image, // Add doctor’s image
      slots,
    });

    await newSchedule.save();

    res.status(201).json({
      message: "Schedule created successfully",
      schedule: newSchedule,
    });
  } catch (error) {
    console.error("Error creating schedule:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//* Get doctor's schedule for the authenticated user
export const getDoctorScheduleByDoctorID = async (req, res) => {
  try {
    const { doctorID } = req.params; // Get doctorID from route parameters
    const authenticatedDoctorID = req.user._id; // Get authenticated doctor's ID

    console.log("Doctor ID from route:", doctorID);
    console.log("Authenticated Doctor ID:", authenticatedDoctorID);

    // Ensure the authenticated doctor is trying to access their own schedule
    if (doctorID !== authenticatedDoctorID.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Fetch the schedule for the specific doctorID
    const schedule = await DoctorSchedule.findOne({ doctorID });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.status(200).json({ schedule });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



//* Update an existing doctor schedule
export const updateSchedule = async (req, res) => {
  try {
    const doctorID = req.user._id; // Doctor ID from authenticated token
    const { slots } = req.body;

    console.log("Doctor ID:", doctorID); // Log doctor ID
    console.log("Slots:", slots); // Log slots being updated

    // Fetch existing schedule
    const existingSchedule = await DoctorSchedule.findOne({ doctorID });

    if (!existingSchedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    // Validate slots for overlaps (if necessary)
    // Assuming slots validation has been done before reaching here

    // Update the schedule
    existingSchedule.slots = slots; // Replace slots with the new ones
    await existingSchedule.save();

    console.log("Updated Schedule:", existingSchedule);

    res.status(200).json({
      message: "Schedule updated successfully",
      schedule: existingSchedule,
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Delete schedule
export const deleteSchedule = async (req, res) => {
  try {
    const doctorID = req.user._id; // Doctor ID from authenticated token

    console.log("Doctor ID:", doctorID); // Log doctor ID

    // Delete the schedule
    const deletedSchedule = await DoctorSchedule.findOneAndDelete({ doctorID });

    if (!deletedSchedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    console.log("Deleted Schedule:", deletedSchedule);

    res.status(200).json({ message: "Schedule deleted successfully." });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllDoctorSchedule = async (req, res) => {
  try {
    
    // Fetch all schedules and populate the doctorID with name and email
    const schedule = await DoctorSchedule.find()
    console.log(schedule)

    if (!schedule || schedule.length === 0) {
      return res.status(404).json({ message: "No schedules found" });
    }

    res.status(200).json({ message: "All schedules are:", schedule });
  } catch (error) {
    console.error("Error fetching doctor schedule:", error);
    res.status(500).json({ message: "Error fetching doctor schedule", error });
  }
};

// Get all appointments for a doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorID } = req.params;
    const appointments = await Appointment.find({ doctorID }).populate(
      "playerID"
    );

    if (!appointments) {
      return res.status(404).json({ message: "Appointments not found" });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Doctor cancels an appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentID } = req.params;
    const appointment = await Appointment.findByIdAndDelete(appointmentID);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment canceled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
