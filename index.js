import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import session from "express-session";
import admissionRoute from "./routes/admission.js";
import authRoute from "./routes/auth.route.js";
import playerRoute from "./routes/player.route.js";
import clubRoute from "./routes/club.route.js";
import bodyParser from "body-parser";
import AdminRoute from "./routes/admin.route.js";
import "./middleware/passport-strategies.mw.js";
import appointmentRoute from "./routes/appointment.route.js";
import doctorRoute from "./routes/doctor.route.js";
import exerciseRoute from "./routes/exercise.route.js";
import mriFileRoute from "./routes/mri.route.js";
import feedbackRoute from "./routes/feedback.route.js";
import promoRoute from "./routes/promo.route.js";
import aclAssessmentResult from "./routes/aclAssessmentResults.route.js";
import contactRoute from "./routes/contact.route.js";
import notificationRoute from "./routes/notification.route.js";
import aclRehab from "./routes/aclRehab.route.js";
import paymentRoute from "./routes/payment.route.js";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.json({ limit: "1gb" }));
app.use(bodyParser.json({ limit: "1gb" }));
app.use(bodyParser.urlencoded({ limit: "1gb", extended: true }));

mongoose.set("strictQuery", true);

// Add session middleware
app.use(
  session({
    secret: process.env.COOKIE_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}, Request URL: ${req.url}, Request Params: ${JSON.stringify(req.params)}, User: ${JSON.stringify(req.user)}`);
  next();
});

app.use("/api/auth", authRoute);
app.use("/api/admission/", admissionRoute);
app.use("/api/player", playerRoute);
app.use("/api/club/", clubRoute);
app.use("/api/admin", AdminRoute);
app.use("/api/appointment", appointmentRoute);
app.use("/api/doctor", doctorRoute);
app.use("/api/exercise", exerciseRoute);
app.use("/api/mriFile", mriFileRoute);
app.use("/api/feedback", feedbackRoute);
app.use("/api/promo", promoRoute);
app.use("/api/aclAssessmentResult", aclAssessmentResult);
app.use("/api/contact", contactRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/aclRehab", aclRehab);
app.use("/api/payment", paymentRoute);

// Database connected
const connect = () => {
  mongoose
    .connect(process.env.MONGO)
    .then(() => {
      console.log("Database connected successfully 🎆");
    })
    .catch((err) => console.log(err));
};

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong 💣";
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

app.listen(process.env.PORT || 8800, () => {
  connect();
  console.log(`Server is running at ${process.env.PORT || 8800}`);
});
