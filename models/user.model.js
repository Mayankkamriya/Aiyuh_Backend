import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const UserSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    unique: true, 
    sparse: true, 
    required: true 
  },
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true, 
    required: false 
  },
  password: { 
    type: String, 
    required: function() { return !this.googleId; }  // Required only if not using Google login
  },
  mobile: { 
    type: String, 
    trim: true, 
    sparse: true, 
    required: false 
  },
  emailVerified: { 
    type: Boolean, 
    default: false 
  },
  loginType: { 
    type: String, 
    enum: ['google', 'email'], 
    default: 'email' 
  },
  resetPasswordToken: { 
    type: String, 
    required: false 
  },
  resetPasswordExpires: { 
    type: Date, 
    required: false 
  }
}, { timestamps: true });

export default model("User", UserSchema);


// // Google Login
// export const loginWithGoogle = async (req, res) => {
//     try {
//         const { googleId, email, name } = req.body;  // Data from Google OAuth
//         let user = await User.findOne({ email });

//         if (!user) {
//             // Create user if not exists
//             user = new User({ name, email, googleId, loginType: "google" });
//             await user.save();
//         }

//         if (user.loginType !== "google") {
//             return res.status(400).json({ message: "This email is linked to email login. Use password instead." });
//         }

//         const token = generateToken(user);
//         res.status(200).json({ token, user });

//     } catch (error) {
//         res.status(500).json({ message: "Server error" });
//     }
// };



// import passport from 'passport';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// import dotenv from 'dotenv';
// import User from '../models/user.model.js';

// dotenv.config();

// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "/auth/google/callback"
// }, async (accessToken, refreshToken, profile, done) => {
//     try {
//         let user = await User.findOne({ googleId: profile.id });

//         if (!user) {
//             user = new User({
//                 googleId: profile.id,
//                 email: profile.emails[0].value,
//                 name: profile.displayName,
//                 loginType: "google"
//             });
//             await user.save();
//         }

//         return done(null, user);
//     } catch (error) {
//         return done(error, null);
//     }
// }));

// passport.serializeUser((user, done) => {
//     done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//     try {
//         const user = await User.findById(id);
//         done(null, user);
//     } catch (error) {
//         done(error, null);
//     }
// });
// JWT_SECRET=your_strong_secret_key
// GOOGLE_CLIENT_ID=your_google_client_id
// GOOGLE_CLIENT_SECRET=your_google_client_secret