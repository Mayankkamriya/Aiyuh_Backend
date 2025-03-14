import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from '../../models/user.model.js';  
import OTPModel from '../../models/otp.model.js'; 
import dotenv from "dotenv";
import { sendOTP } from "../../domain/services/AuthService.js";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET; // Use from .env




// Login with Password Route
router.post("/password", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(403).json({ message: "User not found" });
        }

        if (!user.password) {
            return res.status(400).json({ message: "This email is linked to Google login. Use Google Sign-In." });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(403).json({ message: "Invalid password" });
        }
        
        const token = jwt.sign({ id: user._id.toString() },
         JWT_SECRET,{ expiresIn: '1h' });

        res.status(200).json({
            token,user,
            message: "Login successful",
        });

    } catch (e) {
        res.status(500).json({
            message: "Internal server error",
            error: e.message
        });
    }
});

// Request OTP Route
router.post("/request-otp", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        let user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        await sendOTP(user._id, email);

        res.json({ message: "OTP sent successfully" });

    } catch (e) {
        console.error("Error in /signin/request-otp:", e);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/otp", async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch OTP using user ID
        const verificationRecord = await OTPModel.findOne({ _id: user._id });

        if (!verificationRecord) {
            return res.status(401).json({ message: "Invalid OTP" });
        }

        const { expiresAt, otp: hashedOTP } = verificationRecord;

        if (expiresAt < Date.now()) {
            await OTPModel.deleteMany({ _id: user._id });
            return res.status(401).json({ message: "OTP has expired" });
        }

        const validateOTP = await bcrypt.compare(otp, hashedOTP);

        if (!validateOTP) {
            return res.status(401).json({ message: "Invalid OTP" });
        }

        // Mark user as verified if not already
        if (!user.emailVerified) {
            await userModel.updateOne({ _id: user._id }, { emailVerified: true });
        }

        await OTPModel.deleteMany({ _id: user._id }); // Remove OTP after use

        // Generate JWT token
        const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: "1h" });
        res.json({
            token,
            message: "Login successful",
        });

    } catch (e) {
        console.error("Error in /signin/otp:", e);
        res.status(500).json({ message: "Internal server error" });
    }
});


export default router;
