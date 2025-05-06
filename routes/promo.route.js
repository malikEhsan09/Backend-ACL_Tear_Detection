import express from "express";
import {
  // createPromo,
  assignPromoToPlayer,
  validatePromoCode,
  validateACLPromo,
  createPromoForClub,
  getPromo
} from "../controllers/promo.controller.js";

import { verifyToken } from "../middleware/auth.mw.js";

const router = express.Router();

// Create a new promo code
router.post("/club/:clubId/create", createPromoForClub);

// Assign a promo code to a player
router.post("/assign-to-player", assignPromoToPlayer);

// Validate a promo code
router.post("/validate", validatePromoCode);

// Validate ACL Tear checkup promo
router.post("/validate-acl", validateACLPromo);

router.get("/",verifyToken,getPromo)

export default router;
