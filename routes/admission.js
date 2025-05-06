// routes/admissionRoutes.js
import express from "express";
import {
  deleteAdmissionById,
  deleteAdmissionsByIds,
  deleteEnrolledAdmissions,
  deleteWaitingAdmissions,
  getAdmissionById,
  getAllAdmissions,
  getDeletedAdmissions,
  getEnrolledAdmissions,
  moveAdmissionToStudent,
  recoverAdmissionById,
  submitAdmissionForm,
  transferAndAssignSections,
  updateAdmissionById,
} from "../controllers/admission.js";

const router = express.Router();

// Get all admission forms
router.get("/", getAllAdmissions);

// Delete a specific admission form by ID
router.put("/:id", deleteAdmissionById);

// Get all deleted admission forms
router.get("/deleted", getDeletedAdmissions);

// Get enrolled admission forms
router.get("/enrolled", getEnrolledAdmissions);

// Get a specific admission form by ID
router.get("/:id", getAdmissionById);

// Submit an admission form
router.post("/submit", submitAdmissionForm);

// Define the route for transferring and assigning sections
router.post("/transfer-and-assign-sections", transferAndAssignSections);

// New route to delete multiple admission forms by IDs
router.post("/delete", deleteAdmissionsByIds);

// Route to move admission to student
router.put("/move-to-student/:id", moveAdmissionToStudent);

// Update a specific admission form by ID
router.put("/:id", updateAdmissionById);

// New route to delete all enrolled admission forms
router.delete("/delete-enrolled", deleteEnrolledAdmissions);

// New route to delete all waiting admission forms
router.delete("/delete-waiting", deleteWaitingAdmissions);

// Recover a specific admission form by ID
router.put("/recoverAdmission/:id", recoverAdmissionById);
export default router;
