import express from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import userModel from '../../models/user.model.js';  
import {sendOTP} from "../../domain/services/AuthService.js";  
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const requiredBody = z.object({
    name: z.string()
        .trim() // Automatically trims leading and trailing spaces
        .min(3, "Name must be at least 3 characters.")
        .max(30, "Name must be at most 30 characters.")
        .regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/, "Name should contain only letters and single spaces (3-30 characters)."),

    password: z.string()
        .min(6, "Password must be at least 6 characters.")
        .max(15, "Password must be at most 15 characters.")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,15}$/,
            "Password must have at least one uppercase letter, one lowercase letter, one number, and one special character."
        ),

    email: z.string()
        .regex(
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Invalid email format."
        ),
});

router.post("/", async (req, res) => {
   
    // const requiredBody = z.object({
    //     name: z.string().min(3),
    //     password: z.string().min(5),
    //     email: z.string().email(),
    // });

    const parsedData = requiredBody.safeParse(req.body);

    if (!parsedData.success) {
        const error = parsedData.error.errors.find(err => err.path[0]);
        return res.status(400).json({
            status: "FAILED",
            message: error?.message || "Invalid input data.",
        });
    }

    try {
        const { name, email, password } = req.body;

        const check_email = await userModel.findOne({ email });

        if (check_email) {
            return res.status(403).json({ message: "Email Already registerd." });
        }

        // Ensure password is not undefined
        if (!password) {
            return res.status(400).json({
                status: "FAILED",
                message: "Password is required.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 4);

        // const user = await userModel.create({
        //     name,
        //     email,
        //     password: hashedPassword,
        //     emailVerified: false,
        // });

        await sendOTP(email, { name, email, password });

        res.json({
            status: "success",
            message: "Please Verify Email",
            // user: user
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: "FAILED",
            message: "Error occurred while creating user.",
        });
    }
});

export default router;