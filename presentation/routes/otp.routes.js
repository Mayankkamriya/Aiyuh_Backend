import express from "express";
import bcrypt from "bcrypt";
import userModel from '../../models/user.model.js';
import OTPModel from '../../models/otp.model.js'; 
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();


router.post("/verifyOTP", async (req, res) => {
    try {
        const { otp, userId } = req.body;

        if (otp.length !== 4) {
            toast.warning("Please enter complete OTP");
            return;
          } 
          
        if (!userId || !otp) {
            throw new Error("Empty fields not allowed");
        }

        const verificationRecord = await OTPModel.find({ _id: userId });

        if (verificationRecord.length <= 0) {
            throw new Error("Otp does not exist");
        }

        const { expiresAt, otp: hashedOTP } = verificationRecord[0];

        if (expiresAt < Date.now()) {
            await OTPModel.deleteMany({ _id: userId });
            throw new Error("Code has expired");
        }

        const validateOTP = await bcrypt.compare(otp, hashedOTP);

        if (!validateOTP) {
            throw new Error("Invalid otp");
        }

        await userModel.updateOne(
            { _id: userId },
            { Emailverified: true }
        );

        await OTPModel.deleteMany({ _id: userId });

        res.json({
            status: "SUCCESS",
            message: "User verified successfully",
        });

    } catch (e) {
        res.json({
            status: "ERROR",
            message: e.message
        });
    }
});




export default router;