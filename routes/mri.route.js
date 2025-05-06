import express from "express";
import { verifyToken } from "../middleware/auth.mw.js";
import { uploadMRI } from "../middleware/multerStorage.js";
import {
  getAllMRIFiles,
  getMRIFile,
  uploadMRIFile,
  generatePreSignedUrl,
} from "../controllers/mriFile.controller.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.post("/upload", verifyToken, uploadMRI.single("mriFile"), uploadMRIFile);
router.get("/generate_presigned_url", verifyToken, generatePreSignedUrl);
router.get("/", verifyToken, getAllMRIFiles);
router.get("/:id", verifyToken, getMRIFile);

// Serve the PDF for download
router.get("/reports/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../reports", req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.download(filePath); // Serve the file
});

export default router;
