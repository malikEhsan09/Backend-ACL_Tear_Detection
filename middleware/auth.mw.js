import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";
import Player from "../models/player.model.js";
import Doctor from "../models/doctor.model.js";

// ! verify the token
export const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT); // Verify the JWT
    // console.log(decoded)
    const user = await User.findById(decoded.id); // Find the user using decoded.id
    // console.log(user)

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach the user to the req object
    req.user = user;

    next(); // Proceed to the next middleware
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Invalid token" });
  }
};
// check for the admin
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.userType !== "Admin") {
    return res
      .status(403)
      .json({ message: "Access denied, only admins can perform this action" });
  }
  next(); // Proceed if the user is an admin
};

// check if it is player or admin
export const isAdminOrPlayer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Access denied, no user found" });
  }

  // Allow access if user is an Admin or a Player
  if (req.user.userType !== "Admin" && req.user.userType !== "Player") {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
};

// middle ware for the platyer
export const isPlayerOwner = async (req, res, next) => {
  const userId = req.user._id; // From verifyToken middleware
  const playerId = req.params.id;

  try {
    const player = await Player.findById(playerId);

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    if (player.userID.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Access denied, you can only modify your own profile",
      });
    }

    next();
  } catch (error) {
    console.error("Error in isPlayerOwner middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//* check if it is doctor or not 
export const isDoctor = (req, res, next) => {
  if (!req.user || req.user.userType !== "Doctor") {
    // add console
    console.log("User data:", req.user); // Print out the user data
    return res
      .status(403)
      .json({ message: "Access denied, only Doctor can perform this action" });
  }
  console.log("User data:", req.user); // Print out the user data
  next(); // Proceed if the user is a doctor
};


//* check if it is player 
export const isPlayer = (req, res, next) => {
  if (!req.user || req.user.userType !== "Player") {
    return res
      .status(403)
      .json({ message: "Access denied, only Player can perform this action" });
  }
  console.log("User data:", req.user); // Print out the user data
  next(); // Proceed if the user is a doctor
};
