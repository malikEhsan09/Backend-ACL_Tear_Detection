//? To overcome from the environmental problem we can import dot env and used it.
import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/user.model.js";

// Google OAuth Strategy
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

        // Try to find a user by their Google ID first
        let user = await User.findOne({ googleID: profile.id });

        if (!user) {
          // If no user is found by Google ID, check if the email exists in the database
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // If a user with the same email exists but no Google ID, associate the Google account
            console.log(
              "User found by email, updating GoogleID and profile..."
            );
            user.googleID = profile.id; // Associate the Google account
            user.profilePicture = profile.photos[0].value; // Update profile picture
            await user.save(); // Save the updated user
            console.log("Updated user with GoogleID:", user);
          } else {
            // If no user is found by email or Google ID, create a new user
            user = new User({
              email: profile.emails[0].value,
              googleID: profile.id,
              name: profile.displayName,
              profilePicture: profile.photos[0].value,
              userType: "Player", // Default userType
            });

            await user.save(); // Save the new user
            console.log("New Google user created:", user);
          }
        } else {
          // If user is found by Google ID, update profile information if necessary
          console.log(
            "User found by GoogleID, updating profile if necessary..."
          );
          user.profilePicture = profile.photos[0].value; // Update profile picture
          await user.save(); // Save updated information
          console.log("Existing Google user updated:", user);
        }

        // Pass the user object to Passport
        return done(null, user);
      } catch (error) {
        console.error("Error in Google OAuth:", error);
        return done(error, null);
      }
    }
  )
);

// Facebook OAuth Strategy (similar logic to Google)
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "http://localhost:8800/api/auth/facebook/callback",
      profileFields: ["id", "emails", "name"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Facebook Profile:", profile);

        // Find or create a user based on the Facebook profile ID
        let user = await User.findOne({ facebookID: profile.id });

        if (!user) {
          user = new User({
            email: profile.emails[0].value,
            facebookID: profile.id,
            name: `${profile.name.givenName} ${profile.name.familyName}`,
            userType: "Player",
          });

          await user.save();
          console.log("New Facebook user created:", user);
        }

        return done(null, user);
      } catch (error) {
        console.error("Error in Facebook OAuth:", error);
        return done(error, null);
      }
    }
  )
);

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Passport deserialization
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
