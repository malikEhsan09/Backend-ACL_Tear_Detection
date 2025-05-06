import express from "express";
import { sendContactEmail } from "../utils/emailService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, query, gender, message } = req.body;

  try {
    const result = await sendContactEmail({
      name,
      email,
      query,
      gender,
      message,
    });

    if (result.success) {
      return res.status(200).json({ message: result.message });
    } else {
      return res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error("Error in /api/contact:", error);
    return res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
});

export default router;
