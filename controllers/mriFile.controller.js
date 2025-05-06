import MRIFile from "../models/mriFile.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import axios from "axios";
import AclAssessmentResult from "../models/aclAssessmentResults.model.js";
import generatePDFReport from "../utils/generatePDFReport.js"; // Adjust the path to match your folder structure
import Player from "../models/player.model.js";
import Exercise from "../models/exercises.model.js";
import AWS from "aws-sdk";

const s3 = new AWS.S3();

// export const uploadMRIFile = async (req, res) => {
//   try {
//     const playerId = req.user.id;

//     // Upload the MRI file to Cloudinary
//     const mriFilePath = req.file.path;
//     const mriFileResponse = await uploadCloudinary(mriFilePath);

//     if (!mriFileResponse || !mriFileResponse.url) {
//       throw new Error("Failed to upload file to Cloudinary");
//     }

//     // Save the MRI file details in the database
//     const newMRIFile = new MRIFile({
//       playerId,
//       fileType: req.file.mimetype,
//       filePath: mriFileResponse.url,
//     });
//     await newMRIFile.save();

//     // Send the MRI file to the Flask API for assessment
//     try {
//       const flaskResponse = await axios.post(
//         "http://127.0.0.1:5000/predict_acl",
//         {
//           filePath: mriFileResponse.url,
//         },
//         { timeout: 600000000 } // Increase timeout to 60 seconds
//       );

//       // Save the assessment result in the database
//       const newAclAssessmentResult = new AclAssessmentResult({
//         playerId,
//         mriFileId: newMRIFile._id,
//         assessmentResult:
//           flaskResponse.data.acl_tear_prediction ||
//           flaskResponse.data.acl_tear_grade_prediction,
//         reportPath: flaskResponse.data.reportPath || "",
//       });
//       await newAclAssessmentResult.save();

//       res.status(201).json({
//         message: "MRI file uploaded and assessed successfully",
//         mriFile: newMRIFile,
//         assessmentResult: newAclAssessmentResult,
//       });
//     } catch (axiosError) {
//       console.error("Error connecting to Flask API:", axiosError.message);
//       res.status(500).json({
//         message: "Error connecting to Flask API",
//         error: axiosError.message,
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message || "Internal server error" });
//   }
// };


// ? upload MRI
export const uploadMRIFile = async (req, res) => {
  console.log("EHello ")
  try {
    const { fileUrl } = req.body;
    const player = await Player.findOne({ userID: req.user._id }).populate(
      "userID",
      "userName email"
    );

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Save the MRI file details in the database
    const newMRIFile = new MRIFile({
      playerId: player._id,
      fileType: "application/octet-stream", // Assuming it's a .pck or .npy file
      filePath: fileUrl,
    });
    await newMRIFile.save();

    // Send the MRI file to the Flask API for assessment
    const flaskResponse = await axios.post(
      "http://127.0.0.1:5000/predict_acl",
      {
        filePath: fileUrl,
      },
      { timeout: 60000000 }
    );

    const { acl_tear_prediction, acl_tear_grade_prediction } =
      flaskResponse.data;

    let exercises;
    if (acl_tear_grade_prediction === "Partial ACL Tear OR Partially Injured") {
      exercises = await Exercise.find({
        partiallyDamaged: { $exists: true, $ne: [] },
      });
    } else if (
      acl_tear_grade_prediction === "Complete ACL Tear OR Completely Ruptured"
    ) {
      exercises = await Exercise.find({
        completelyRuptured: { $exists: true, $ne: [] },
      });
    }

    console.log("play")
    // Generate PDF report
    const pdfFileName = await generatePDFReport(
      acl_tear_prediction || acl_tear_grade_prediction,
      {
        firstName: player.firstName,
        lastName: player.lastName,
        address: player.address,
        dateOfBirth: player.dateOfBirth,
        phoneNumber: player.phoneNumber,
        userID: {
          email: player.userID.email,
          userName: player.userID.userName,
        },
      },
      newMRIFile._id
    );

    const newAclAssessmentResult = new AclAssessmentResult({
      playerId: player._id,
      mriFileId: newMRIFile._id,
      assessmentResult: acl_tear_prediction || acl_tear_grade_prediction,
      reportPath: `/reports/${pdfFileName}`,
    });
    await newAclAssessmentResult.save();

    res.status(201).json({
      message: "MRI file uploaded and assessed successfully",
      mriFile: newMRIFile,
      assessmentResult: newAclAssessmentResult,
      exercises,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: error.message });
  }
};

//? get One File
export const getMRIFile = async (req, res) => {
  console.log("Hello")
  try {
    const mriFile = await MRIFile.findById(req.params.id);
    if (!mriFile) {
      return res.status(404).json({ message: "MRI file not found" });
    }
    res.status(200).json(mriFile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ? get all MRI files
// Fetch MRI Files for the logged-in player
export const getAllMRIFiles = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch the player's record using the userId from the token
    const player = await Player.findOne({ userID: userId });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Fetch MRI files associated with this player
    const mriFiles = await MRIFile.find({ playerId: player._id })
      .populate("assessmentResult", "assessmentResult reportPath")
      .exec();

    if (!mriFiles.length) {
      return res
        .status(404)
        .json({ message: "No MRI files found for this player" });
    }

    res.status(200).json(mriFiles);
  } catch (error) {
    console.error("Error fetching MRI files:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const generatePreSignedUrlPromise = async (folderName, fileName, fileType) => {
  const params = {
    Bucket: "skillsyncprobucket", // bucket name
    Key: `${folderName}/${fileName}`,
    Expires: 120, // URL expiration time in seconds
    ContentType: fileType,
  };

  try {
    const url = await s3.getSignedUrlPromise("putObject", params);
    return {
      status: 200,
      data: url, // Return the presigned URL correctly
    };
  } catch (err) {
    console.error(err);
    return {
      status: 500,
      message: "Internal server error",
    };
  }
};

export const generatePreSignedUrl = async (req, res, next) => {
  console.log("Generate presigned url route");
  const { fileName, fileType, folderName } = req.query;

  try {
    const url = await generatePreSignedUrlPromise(
      folderName,
      fileName,
      fileType
    );
    console.log(url)
    if (url.status === 200) {
      return res.status(200).json({
        data: url.data, // Ensure you return `url.data` here
      });
    }
    return res.status(500).json({
      message: "Internal server error",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
