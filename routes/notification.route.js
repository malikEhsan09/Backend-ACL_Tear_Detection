import express from "express";
import { verifyToken } from "../middleware/auth.mw.js";
import {
  deleteNotification,
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../controllers/notification.controller.js";
const router = express.Router();

// Get all notifications for admin
router.get("/", verifyToken, getNotifications);

// Mark a notification as read
router.patch("/:id/read", verifyToken, markAsRead);

// Route to mark all notifications as read
router.patch("/read-all", verifyToken, markAllAsRead);


// Delete a notification
router.delete("/:id", verifyToken, deleteNotification);



export default router;
