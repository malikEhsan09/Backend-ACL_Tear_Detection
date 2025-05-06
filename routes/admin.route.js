import {
  addPlayer,
  createAdmin,
  deleteAdmin,
  deletePlayer,
  updateAdmin,
  updatePlayer,
  getAdmins,
  getAdminById,
} from "../controllers/admin.controller.js";
import { verifyToken } from "../middleware/auth.mw.js";
import { upload } from "../middleware/multerStorage.js";
import express from "express";

const router = express.Router();

// router.post("/", upload.fields([{ name: "image", maxCount: 1 }]), createAdmin);
// router.patch(
//   "/:id",
//   upload.fields([{ name: "image", maxCount: 1 }]),
//   updateAdmin
// );
// router.get("/", getAdmins);
// router.get("/:id", verifyToken, getAdminById);
// router.delete("/:id", deleteAdmin);

// !! New Code after verify every route
router.post(
  "/",
  verifyToken,
  upload.fields([{ name: "image", maxCount: 1 }]),
  createAdmin
);
router.patch(
  "/:id",
  verifyToken,
  upload.fields([{ name: "image", maxCount: 1 }]),
  updateAdmin
);
router.delete("/:userId", verifyToken, deleteAdmin);
router.get("/", verifyToken, getAdmins);
router.get("/:userId", verifyToken, getAdminById);

// player routes
router.post(
  "/player",
  upload.fields([{ name: "image", maxCount: 1 }]),
  addPlayer
);
router.patch(
  "/player/:id",
  upload.fields([{ name: "image", maxCount: 1 }]),
  updatePlayer
);
router.delete("/player/:id", deletePlayer);

export default router;
