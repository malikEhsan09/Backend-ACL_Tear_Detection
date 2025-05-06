// import passport from "passport";
// // import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// // import User from "../models/usermodel.js";
// import User from "../models/user.model.js";

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   User.findById(id, (err, user) => {
//     done(err, user);
//   });
// });

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/api/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ googleId: profile.id });
//         if (!user) {
//           user = new User({
//             googleId: profile.id,
//             email: profile.emails[0].value,
//             name: profile.displayName,
//           });
//           await user.save();
//         }
//         return done(null, user);
//       } catch (err) {
//         return done(err);
//       }
//     }
//   )
// );

// passport-setup.js

// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const User = require("../models/User");

// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import User from "../models/user.model.js";

// import dotenv from "dotenv";

// dotenv.config();

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   User.findById(id).then((user) => {
//     done(null, user);
//   });
// });

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "http://localhost:3000/api/auth/google/callback",
//     },
//     (accessToken, refreshToken, profile, done) => {
//       User.findOne({ googleId: profile.id }).then((existingUser) => {
//         if (existingUser) {
//           done(null, existingUser);
//         } else {
//           new User({
//             googleId: profile.id,
//             displayName: profile.displayName,
//             email: profile.emails[0]?.value,
//           })
//             .save()
//             .then((user) => done(null, user));
//         }
//       });
//     }
//   )
// );

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8800/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile:", profile);
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          console.log("Existing User:", existingUser);
          return done(null, existingUser);
        }

        const newUser = new User({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0]?.value,
        });

        const savedUser = await newUser.save();
        console.log("New User Created:", savedUser);
        return done(null, savedUser);
      } catch (err) {
        console.error("Error during Google Authentication:", err);
        return done(err);
      }
    }
  )
);
