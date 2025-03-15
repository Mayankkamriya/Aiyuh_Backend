import express from "express";
import bcrypt from "bcrypt";
import userModel from '../../models/user.model.js';
import OTPModel from '../../models/otp.model.js'; 
import { sendOTP } from "../../domain/services/AuthService.js";  
import dotenv from "dotenv";
import otpStore from '../../domain/services/otpStore.js'

dotenv.config();

const router = express.Router();


// router.post("/verifyOTP", async (req, res) => {
//     try {
//         const { otp, userId } = req.body;

//         if (otp.length !== 4) {
//             toast.warning("Please enter complete OTP");
//             return;
//           } 
          
//         if (!userId || !otp) {
//             throw new Error("Empty fields not allowed");
//         }

//         const verificationRecord = await OTPModel.find({ _id: userId });

//         if (verificationRecord.length <= 0) {
//             throw new Error("Otp does not exist");
//         }

//         const { expiresAt, otp: hashedOTP } = verificationRecord[0];

//         if (expiresAt < Date.now()) {
//             await OTPModel.deleteMany({ _id: userId });
//             throw new Error("Code has expired");
//         }

//         const validateOTP = await bcrypt.compare(otp, hashedOTP);

//         if (!validateOTP) {
//             throw new Error("Invalid otp");
//         }

//         await userModel.updateOne(
//             { _id: userId },
//             { emailVerified: true }
//         );

//         await OTPModel.deleteMany({ _id: userId });

//         res.json({
//             status: "SUCCESS",
//             message: "User verified successfully",
//         });

//     } catch (e) {
//         res.json({
//             status: "ERROR",
//             message: e.message
//         });
//     }
// });


router.post("/verifyOTP", async (req, res) => {
    try {
        const { otp, email } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                status: "FAILED",
                message: "Email and OTP are required.",
            });
        }

        const otpData = otpStore.get(email);

        if (!otpData) {
            return res.status(400).json({
                status: "FAILED",
                message: "OTP not found. Please request a new one.",
            });
        }

        const { otp: storedOtp, expiresAt, userData } = otpData;

        if (expiresAt < Date.now()) {
            otpStore.delete(email);
            return res.status(400).json({
                status: "FAILED",
                message: "OTP has expired. Please request a new one.",
            });
        }

        if (!/^[0-9]{4}$/.test(otp) || otp !== storedOtp) {
            return res.status(400).json({
                status: "FAILED",
                message: "Invalid OTP.",
            });
        }

        const hashedPassword = await bcrypt.hash(userData.password, 4);

        const user = await userModel.create({
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            emailVerified: true,
        });

        otpStore.delete(email);

        res.json({
            status: "SUCCESS",
            message: "User registered and verified successfully.",
            user,
        });

    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: "FAILED",
            message: "Error occurred while verifying OTP.",
        });
    }
});


router.post("/resendOTP", async (req, res) => {
    try {
        const { userId, email } = req.body;

        if (!userId || !email) {
            throw new Error("Empty fields not allowed");
        }
// console.log('in otp-resendOTP...',userId,email)
        await OTPModel.deleteMany({ _id: userId });
        await sendOTP(userId, email);
        
        res.json({
            status: "SUCCESS",
            message: "OTP resent successfully",
        });
    } catch (e) {
        res.json({
            status: "ERROR",
            message: e.message
        });
    }
});

export default router;