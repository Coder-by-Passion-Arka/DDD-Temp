import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/user.models.js';
import dotenv from 'dotenv';

dotenv.config({ path: "src/.env" });

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/v1/auth/google/callback",
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ userEmail: profile.emails[0].value });
      
      if (user) {
        // User exists, update login time
        user.userLastLogin = new Date();
        await user.save({ validateBeforeSave: false });
        return done(null, user);
      }
      
      // Create new user
      user = await User.create({
        userName: profile.displayName,
        userEmail: profile.emails[0].value,
        userPassword: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Random secure password
        userPhoneNumber: "",
        countryCode: "",
        userRole: "student", // Default role
        userLocation: {
          homeAddress: "",
          currentAddress: ""
        },
        userBio: "",
        userProfileImage: profile.photos[0]?.value || "",
        userCoverImage: "",
        userAcademicInformation: {},
        userSkills: [],
        userSocialMediaProfiles: [],
        isActive: true,
        authProvider: "google"
      });
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Configure GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/v1/auth/github/callback",
    scope: ['user:email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Get primary email from GitHub
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;
      
      // Check if user already exists
      let user = await User.findOne({ userEmail: email });
      
      if (user) {
        // User exists, update login time
        user.userLastLogin = new Date();
        await user.save({ validateBeforeSave: false });
        return done(null, user);
      }
      
      // Create new user
      user = await User.create({
        userName: profile.displayName || profile.username,
        userEmail: email,
        userPassword: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Random secure password
        userPhoneNumber: "",
        countryCode: "",
        userRole: "student", // Default role
        userLocation: {
          homeAddress: "",
          currentAddress: ""
        },
        userBio: profile._json.bio || "",
        userProfileImage: profile.photos[0]?.value || "",
        userCoverImage: "",
        userAcademicInformation: {},
        userSkills: [],
        userSocialMediaProfiles: [
          {
            platform: "GitHub",
            profileLink: profile.profileUrl
          }
        ],
        isActive: true,
        authProvider: "github"
      });
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;