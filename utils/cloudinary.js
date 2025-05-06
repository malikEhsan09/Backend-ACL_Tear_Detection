import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: "dr5p2iear",
  api_key: "491633373886589",
  api_secret: "0YE39nHlJhnXP0pjjIyKYPcQcsU",
});

export const uploadCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      throw new Error("No file path provided");
    }

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "mri_files",
      timeout: 120000,
    });

    console.log("File uploaded to Cloudinary:", result.url);
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // Remove the temporary local file
    }
    throw error; // Rethrow the error for handling in the calling function
  }
};
