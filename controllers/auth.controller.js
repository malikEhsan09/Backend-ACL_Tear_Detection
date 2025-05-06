import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createError } from "../error.js";
import User from "../models/user.model.js";
import Randomstring from "randomstring";
import passport from "passport";
import ForgotPassword from "../models/forgot.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import Player from "../models/player.model.js";
import Doctor from "../models/doctor.model.js";
import Admin from "../models/admin.model.js";

//  secure password
function securePassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

//* Register user
export const register = async (req, res, next) => {
  const { email, password, userType, userName ,medicalLicenseNo, specialization, phoneNumber } = req.body;

  // Validate required fields
  if (!email || !password || !userType || !userName) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    // Set isAdmin based on userType
    const isAdmin = userType === "Admin";

    const newUser = new User({
      userName,
      email,
      password: await bcrypt.hash(password, 10), // hashed the password
      userType,
      isAdmin,
    });

    const userSaved = await newUser.save();

    // Handle different user types with if statements
    if (userType === "Player") {
      const newPlayer = new Player({
        userID: userSaved._id,
        name: userName,
        email: email,
        password: password,
      });
      await newPlayer.save();
    } else if (userType === "Admin") {
      const newAdmin = new Admin({
        userID: userSaved._id,
        name: userName,
        email: email,
        password: password,
      });
      await newAdmin.save();
    } else if (userType === "Doctor") {
      if (!medicalLicenseNo || !specialization || !phoneNumber) {
        return res.status(400).json({ success: false, message: "Doctor-specific fields are required" });
      }
      // Ensure that the email field is included in the Doctor model
      const newDoctor = new Doctor({
        userID: userSaved._id,
        name: userName,
        email, // Include email here
        medicalLicenseNo,
        specialization,
        phoneNumber,
        // Add other fields as necessary
      });
      await newDoctor.save();
    }

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userSaved,
    });
  } catch (err) {
    next(err);
    console.log("From Cont:" + err.message);
  }
};


//* Signin function
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log("Login attempt for email:", email);

  try {
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      console.log("User not found"); // Debug log
      return res.status(404).json({ message: "User not found" });
    }

    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (!process.env.JWT) {
      return next(createError(500, "JWT secret key is missing"));
    }

    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT,
      { expiresIn: "3d" }
    );

    const { password: userPassword, ...others } = user._doc;

    // Set token as a session cookie
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({
        user: others,
        msg: `User the ${user.userType} is logged in`,
        token,
      });
  } catch (err) {
    next(err);
  }
};
//* Signout function
export const signout = (req, res) => {
  const { id } = req.params;
  res
    .clearCookie("access_token", id)
    .json({ msg: "User is logged out Succesfully", id });
};

//* Forgot password Reset it
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const verificationCode = crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase(); // Generate 6-digit OTP

    const forgotPassword = new ForgotPassword({
      user_id: user._id,
      verificationCode,
    });
    await forgotPassword.save();

    // Setup email
    const transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "9ed93bedbf9244",
        pass: "abfdbd2418881e",
      },
    });

    // const transport = nodemailer.createTransport({
    //   service: "gmail", // Using Gmail service
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    //   },
    // });
    // const mailOptions = {
    //   from: "your-email@gmail.com",
    //   to: email, // Ensure this is correctly set to the user's email
    //   subject: "Password Reset OTP",
    //   text: `Your OTP for password reset is ${verificationCode}`,
    // };

    // Define email options with user's email
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender email (your email)
      to: email, // User's email (from request body)
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${verificationCode}`,
    };

    console.log("Sending OTP to:", email);
    await transport.sendMail(mailOptions);

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Request Password Reset error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// * verify OTP
export const verifyOTP = async (req, res) => {
  const { verificationCode } = req.body; // Now it only receives the OTP code

  try {
    const otpEntry = await ForgotPassword.findOne({ verificationCode });

    if (!otpEntry) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP is valid, return userId along with success message
    return res.status(200).json({
      message: "OTP verified",
      userId: otpEntry.user_id,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// * update password
export const updatePassword = async (req, res) => {
  const { newPassword, userId } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await User.updateOne(
      { _id: userId },
      { password: hashedPassword, updatedAt: new Date() }
    );

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
//* Find user by ID
export const findUserById = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Exclude the password field from the response
    const { password, ...userData } = user._doc;
    res.status(200).json(userData);
  } catch (err) {
    next(err);
  }
};

//* Find all users
export const findAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    // console.log(req.url, users)
    return res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

//* Delete user by ID
export const deleteUserById = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    res.status(200).send("User deleted successfully");
  } catch (err) {
    next(err);
  }
};
