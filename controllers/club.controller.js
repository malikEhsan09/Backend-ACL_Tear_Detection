import { uploadCloudinary } from "../utils/cloudinary.js";
import Club from "../models/club.model.js";
import Player from "../models/player.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import Promo from "../models/promo.model.js";

//? Create a new club form
const generateRandomPromoCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let promoCode = "";
  for (let i = 0; i < 8; i++) {
    promoCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return promoCode;
};

// Create a new club (by admin)
export const submitClubForm = async (req, res) => {
  try {
    const user = req.user;
    if (user.userType !== "Admin") {
      return res.status(403).json({ message: "Only admins can create clubs" });
    }

    const {
      clubName,
      clubLocation,
      numOfMembers,
      maxCapacity,
      description,
      foundedYear,
      isActive,
    } = req.body;

    const existedClub = await Club.findOne({ clubName });
    if (existedClub) {
      return res.status(400).json({ message: "Club already exists" });
    }

    let formData = {
      clubName,
      clubLocation,
      numOfMembers,
      maxCapacity,
      createdBy: user._id,
      description,
      foundedYear,
      isActive,
    };

    // Check if club logo is included
    if (req.files?.clubLogo?.[0]?.path) {
      const clubLogo = req.files.clubLogo[0].path;
      const clubLogoResponse = await uploadCloudinary(clubLogo);
      formData.clubLogo = clubLogoResponse.url;
    }

    // Save the new club
    const newClub = new Club(formData);
    await newClub.save();

    // Generate a unique promo code and associate it with the club
    const promoCode = generateRandomPromoCode();
    const newPromo = new Promo({
      promoId: promoCode,
      clubId: newClub._id,
      name: `${clubName} Promo Code`, // Example name for the promo
      description: description || "Welcome promo code for the new club!",
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1-year validity
      maxUses: 100, // Example max uses, adjust as needed
    });
    await newPromo.save();

    res.status(201).json({
      message: "Club created successfully",
      club: newClub,
      promoCode: newPromo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


//? Get all club forms
export const getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find();
    res.status(200).json(clubs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//? Get a club by ID, name, or location
export const getClub = async (req, res) => {
  try {
    const { id } = req.params;
    // const { clubName, clubLocation } = req[0]?.query;
    const { clubName, clubLocation } = req.body;
    // console.log(clubName, clubLocation);

    let club;

    if (id && mongoose.Types.ObjectId.isValid(id)) {
      club = await Club.findById(id);
    } else if (clubName) {
      club = await Club.findOne({ clubName });
    } else if (clubLocation) {
      club = await Club.findOne({ clubLocation });
    } else {
      return res.status(400).json({ message: "Invalid query parameters" });
    }

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    res.status(200).json(club);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//? Update a specific club form by ID
export const updateClubById = async (req, res) => {
  try {
    const {
      clubName,
      clubLocation,
      numOfMembers,
      maxCapacity,
      description,
      foundedYear,
      isActive,
    } = req.body;

    let updatedFields = {
      clubName,
      clubLocation,
      numOfMembers,
      maxCapacity,
      description,
      foundedYear,
      isActive,
    };

    // Check if clubLogo file is included in the request
    if (req.files && req.files.clubLogo) {
      const clubLogo = req.files.clubLogo[0].path;
      const clubLogoResponse = await uploadCloudinary(clubLogo); // Upload club logo to Cloudinary
      updatedFields.clubLogo = clubLogoResponse.url; // Set the clubLogo field to the Cloudinary URL
    }

    const updatedClub = await Club.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields }, // Use updatedFields instead of req.body
      { new: true }
    );

    if (!updatedClub) {
      return res.status(404).json({ message: "Club not found" });
    }

    res.status(200).json({
      message: "Club updated successfully",
      club: updatedClub,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//? Delete a specific club form by ID
export const deleteClubById = async (req, res) => {
  try {
    const club = await Club.findByIdAndDelete(req.params.id);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // club deleted successfully, and sending a status code 200 with a message
    res.status(200).json({ message: "Club deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//? Assign player to club
export const assignPlayerToClub = async (req, res) => {
  try {
    console.log("Request Body: ", req.body);
    console.log("Authenticated User: ", req.user);

    const user = req.user;

    // Admin check: only admins can assign players to clubs
    if (user.userType !== "Admin") {
      return res
        .status(403)
        .json({ message: "Only admins can assign players to clubs" });
    }

    // Extract email and clubId from request
    const { email, clubId } = req.body;
    console.log(`Assigning player with email: ${email} to club: ${clubId}`);

    // Find the user by email and check if the user is of type Player
    const userAccount = await User.findOne({ email, userType: "Player" });
    if (!userAccount) {
      return res
        .status(404)
        .json({ message: "No player found with the provided email" });
    }

    // Find the player associated with the found user
    const player = await Player.findOne({ userID: userAccount._id });
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Check if the player is already assigned to any club
    if (player.club) {
      return res.status(400).json({
        message: `Player is already assigned to the club with ID: ${player.club}. Please try with another player.`,
      });
    }

    // Find the club by clubId
    const club = await Club.findById(clubId).populate("players", "userID");
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    console.log(club);

    // Check if the player is already assigned to this club
    const isPlayerInClub = club.players.some(
      (clubPlayer) => clubPlayer.userID.toString() === player.userID.toString()
    );

    if (isPlayerInClub) {
      return res
        .status(400)
        .json({ message: "Player is already assigned to this club." });
    }

   

   // Check for an active promo code tied to this club
   const promo = await Promo.findOne({ clubId, isActive: true });
   if (!promo) {
     return res
       .status(404)
       .json({ message: "No active promo code found for this club." });
   }

    // // Assign the player to the club
    // player.club = clubId;
  
      // Assign the player to the club
      player.club = clubId;
      player.promoCode = promo.promoId;
      await player.save();

    // Add the player to the club's list of players and update the number of members
    club.players.push(player._id);
    club.numOfMembers += 1;
    await club.save();

    // Respond with success message
    res.status(200).json({
      message: "Player assigned to club successfully",
      club,
      player,
      assignedPromoCode: promo.promoId,
    });
  } catch (error) {
    console.error("Error assigning player to club:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//? remove assigned players from club By Admin.
export const removePlayerFromClub = async (req, res) => {
  try {
    const { playerId, email, clubId } = req.body;

    // Ensure the user removing the player is an admin
    const user = req.user; // Assuming verifyToken middleware sets req.user
    if (user.userType !== "Admin") {
      return res
        .status(403)
        .json({ message: "Only admins can remove players from clubs" });
    }

    let player;

    // Check which field is provided and find the player accordingly
    if (playerId) {
      if (!mongoose.Types.ObjectId.isValid(playerId)) {
        return res.status(400).json({ message: "Invalid player ID" });
      }
      player = await Player.findById(playerId);
    } else if (email) {
      // Find the user by email and ensure they are of type "Player"
      const userAccount = await User.findOne({ email, userType: "Player" });
      if (!userAccount) {
        return res
          .status(404)
          .json({ message: "Player with this email not found" });
      }

      // Find the player using the userID from the user account
      player = await Player.findOne({ userID: userAccount._id });
    }

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // Check if the player is assigned to this club
    if (player.club.toString() !== clubId) {
      return res
        .status(400)
        .json({ message: "Player is not assigned to this club" });
    }

    // Remove the player from the club
    player.club = null;
    await player.save();

    // Remove the player ID from the club's players array
    club.players.pull(player._id);
    club.numOfMembers -= 1;
    await club.save();

    res.status(200).json({
      message: "Player removed from club successfully",
      player,
      club,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//? create and Invite the player to join club
export const generateInviteLink = async (req, res) => {
  try {
    const { clubId } = req.body;

    // Ensure the user generating the link is an admin
    const user = await User.findById(req.user.id);
    if (user.userType !== "Admin") {
      return res
        .status(403)
        .json({ message: "Only admins can generate invite links" });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const token = jwt.sign({ clubId: club._id }, process.env.JWT, {
      expiresIn: "1d",
    });

    const inviteLink = `http://localhost:3000/api/club/acceptInvite/${token}`;

    res.status(200).json({ inviteLink });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ? Acceot Invite
export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT);

    const club = await Club.findById(decoded.clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const {
      userID,
      name,
      age,
      dateOfBirth,
      address,
      gender,
      nationality,
      phoneNumber,
      isMember,
    } = req.body;

    const image = req.files?.image?.[0]?.path;
    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    const imageResponse = await uploadCloudinary(image);

    const newPlayer = new Player({
      userID,
      name,
      age,
      dateOfBirth,
      address,
      gender,
      nationality,
      phoneNumber,
      image: imageResponse.url,
      isMember,
      club: club._id,
    });

    await newPlayer.save();

    club.players.push(newPlayer._id);
    club.numOfMembers += 1;
    await club.save();

    res.status(201).json({
      message: "Player registered and assigned to club successfully",
      player: newPlayer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
