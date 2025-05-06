import Promo from "../models/promo.model.js";
import Player from "../models/player.model.js";
import Club from "../models/club.model.js";

// Create a new promo code
// Create a promo code for a specific club
export const createPromoForClub = async (req, res) => {
  try {
    const { clubId } = req.params; // Extract clubId from URL params
    const { promoId, name, description, startDate, endDate, maxUses } = req.body;

    // Validate club existence
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // Check if a promo code already exists for this club
    const existingPromo = await Promo.findOne({ promoId });
    if (existingPromo) {
      return res
        .status(400)
        .json({ message: "Promo code already exists with the same promoId" });
    }

    // Create new promo code
    const newPromo = new Promo({
      promoId,
      name,
      description,
      startDate,
      endDate,
      maxUses,
      clubId, // Assign the promo to the club
    });

    // Save promo code
    await newPromo.save();

    res.status(201).json({
      message: "Promo code created successfully",
      promo: newPromo,
    });
  } catch (error) {
    console.error("Error creating promo code:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Assign a promo code to a player
export const assignPromoToPlayer = async (req, res) => {
  try {
    const { playerId, promoId } = req.body;
    // const { userID } = req.Player.userID;
    // console.log(userID);

    const promo = await Promo.findOne({ promoId });
    if (!promo || !promo.isActive) {
      return res
        .status(404)
        .json({ message: "Invalid or inactive promo code" });
    }

    if (promo.currentUses >= promo.maxUses) {
      return res.status(400).json({ message: "Promo code has been used up" });
    }

    const alreadyUsed = await Player.findOne({ promoCode: promoId });
    if (alreadyUsed) {
      return res.status(400).json({
        message: "Promo code has already been used we can not reassign",
      });
    }

    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    player.promoCode = promoId;
    await player.save();

    promo.currentUses += 1;
    await promo.save();

    res
      .status(200)
      .json({ message: "Promo code assigned to player successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Validate promo code usage
export const validatePromoCode = async (req, res) => {
  try {
    const { promoId } = req.body;

    const promo = await Promo.findOne({ promoId });
    if (!promo || !promo.isActive) {
      return res
        .status(404)
        .json({ message: "Invalid or inactive promo code" });
    }

    if (promo.currentUses >= promo.maxUses) {
      return res.status(400).json({ message: "Promo code has been used up" });
    }

    res.status(200).json({ message: "Promo code is valid", promo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const validateACLPromo = async (req, res) => {
  try {
    const { playerId } = req.body;

    // Find the player
    const player = await Player.findById(playerId);
    if (!player || !player.promoCode) {
      return res.status(404).json({ message: "Player has no promo code." });
    }

    // Validate the promo code
    const promo = await Promo.findOne({ promoId: player.promoCode });
    if (!promo || !promo.isActive) {
      return res
        .status(400)
        .json({ message: "Invalid or expired promo code." });
    }

    return res.status(200).json({
      message: "Promo code is valid for a free ACL Tear checkup.",
      promo,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// import Player from "../models/Player.js";
// import Club from "../models/Club.js";
// import Promo from "../models/Promo.js";

export const getPromo = async (req, res) => {
  try {
    const userId = req.user._id; // Extract user ID from request (assumes auth middleware)

    // Step 1: Find the player based on user ID and populate the 'club' field
    const player = await Player.findOne({ userID: userId }).populate("club");

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Step 2: Check if the player is associated with a club
    if (!player.club) {
      return res.status(404).json({ message: "Player is not part of any club" });
    }

    const clubId = player.club._id;

    // Step 3: Find if the club has an active promo code
    const promo = await Promo.findOne({ clubId, isActive: true });

    if (!promo) {
      return res.status(200).json({
        message: "No active promo code found for the player's club",
      });
    }

    // Step 4: Return the promo details
    return res.status(200).json({
      message: "Promo code details fetched successfully",
      promoDetails: promo,
      clubDetails: player.club,
    });
  } catch (error) {
    console.error("Error fetching promo code:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
