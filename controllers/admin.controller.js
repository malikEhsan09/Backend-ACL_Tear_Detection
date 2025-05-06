import Admin from "../models/admin.model.js";
import Player from "../models/player.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import User from "../models/user.model.js";

export const getAdminById = async (req, res) => {
  try {
    const userId = req.params.userId; // userId from the route
    console.log("Fetching admin by userID:", userId);

    // Find admin by userID
    const admin = await Admin.findOne({ userID: userId }).populate(
      "userID",
      "email userName"
    );

    if (!admin) {
      console.error("Admin not found for userID:", userId);
      return res.status(404).json({ message: "Admin not found" });
    }

    // Return the admin details if found
    res.status(200).json(admin);
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all admins
export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().populate(
      "userID",
      "email userName profilePicture"
    );
    if (!admins) {
      res.status(400).json({ msg: "did not find any admin" });
    }
    res.status(200).json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//? Create a new admin
export const createAdmin = async (req, res) => {
  try {
    const { name, phoneNumber, CNIC } = req.body;
    const image = req.files?.image?.[0]?.path;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Upload the image to Cloudinary
    const imageResponse = await uploadCloudinary(image);

    if (!imageResponse || !imageResponse.url) {
      return res.status(400).json({ message: "Failed to upload image" });
    }

    // Create the new admin with the user ID from req.user._id
    const newAdmin = new Admin({
      userID: req.user._id, // Attach the logged-in user's ID as userID
      name,
      phoneNumber,
      CNIC,
      image: imageResponse.url,
    });

    // Save the new admin in the database
    await newAdmin.save();

    res
      .status(201)
      .json({ message: "Admin created successfully", admin: newAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update admin information
export const updateAdmin = async (req, res) => {
  try {
    // Extract the userId from the verified token (added by the verifyToken middleware)
    const userId = req.user.id; // Assuming `req.user` holds the token payload

    const { name, phoneNumber, CNIC } = req.body;
    let image;

    if (req.files?.image?.[0]?.path) {
      image = await uploadCloudinary(req.files.image[0].path);
    }

    // Build the data to update
    const updateData = { name, phoneNumber, CNIC };
    if (image) {
      updateData.image = image.url;
    }

    // Find the admin by userId (not adminId) and update
    const updatedAdmin = await Admin.findOneAndUpdate(
      { userID: userId }, // Find by userId
      updateData,
      { new: true } // Return the updated document
    ).populate("userID", "email userName profilePicture");

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res
      .status(200)
      .json({ message: "Admin updated successfully", admin: updatedAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete an admin by ID
export const deleteAdmin = async (req, res) => {
  try {
    const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);

    if (!deletedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add a new player
export const addPlayer = async (req, res) => {
  try {
    const {
      userID,
      name,
      age,
      dateOfBirth,
      address,
      gender,
      nationality,
      phoneNumber,
      club,
      isMember,
      doctorID,
      adminID,
    } = req.body;

    const newPlayer = new Player({
      userID,
      name,
      age,
      dateOfBirth,
      address,
      gender,
      nationality,
      phoneNumber,
      club,
      isMember,
      doctorID,
      adminID,
    });

    await newPlayer.save();

    res
      .status(201)
      .json({ message: "Player added successfully", player: newPlayer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update player information
export const updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      age,
      dateOfBirth,
      address,
      gender,
      nationality,
      phoneNumber,
      club,
      isMember,
      doctorID,
      adminID,
    } = req.body;

    const updatedPlayer = await Player.findByIdAndUpdate(
      id,
      {
        name,
        age,
        dateOfBirth,
        address,
        gender,
        nationality,
        phoneNumber,
        club,
        isMember,
        doctorID,
        adminID,
      },
      { new: true }
    );

    if (!updatedPlayer) {
      return res.status(404).json({ message: "Player not found" });
    }

    res
      .status(200)
      .json({ message: "Player updated successfully", player: updatedPlayer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete player information
export const deletePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPlayer = await Player.findByIdAndDelete(id);

    if (!deletedPlayer) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.status(200).json({ message: "Player deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
