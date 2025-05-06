import express from "express";
import {
  deleteUserById,
  findAllUsers,
  findUserById,
  signout,
  register,
  login,
  requestPasswordReset,
  verifyOTP,
  updatePassword,
} from "../controllers/auth.controller.js";
import passport from "passport";
import "../utils/passport.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello Ehsan");
});

// Signup
router.post("/register", register);

// SignIn
router.post("/login", login);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    if (req.user) {
      // After the user is saved in the database, redirect to the correct login page
      res.redirect("http://localhost:3000/login");
    } else {
      // If something goes wrong, redirect to home
      res.redirect("/");
    }
  }
);

// Facebook OAuth Route
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:3000/player");
  }
);
// Signout
router.get("/signout/:id", signout);

// Forgot and send OTP to update
router.post("/password/reset", requestPasswordReset);
router.post("/password/verify", verifyOTP);
router.post("/password/updatePassword", updatePassword);

// Find user by ID
router.get("/user/:id", findUserById);
// Find all users
router.get("/users", findAllUsers);
// Delete user by ID
router.delete("/user/:id", deleteUserById);

export default router;
