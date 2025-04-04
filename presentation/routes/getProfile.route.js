import userModel from "../../models/user.model.js";
import formModel from "../../models/form.model.js";
import express from "express";
import { userMiddleware } from '../middleware/auth.js';    
    
     const router = express.Router();

    router.get("/", userMiddleware, async (req, res) => {
        try {
            const userId = req.userId; 
    
        let formData = await formModel.findOne({ userId }).select("name weight height day month year");
        let user = await userModel.findById(userId).select("mobile email name");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ 
            message: formData ? "Form data found" : "User profile found",
            data: formData || {},  
            user: {
                phone: user.mobile,
                email: user.email,
                name: user.name
            }
        }); 
        } catch (error) {
            console.error("Error fetching profile:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

    export default router;