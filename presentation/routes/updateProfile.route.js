import userModel from "../../models/user.model.js";
import formModel from "../../models/form.model.js";
import bcrypt from "bcrypt";
import express from "express";
import { userMiddleware } from '../middleware/auth.js';

    const router = express.Router();    

    router.post("/",userMiddleware, async (req, res) => {
        try {
          const userId = req.userId;
      
            const { name, email, mobile, day, month, year, weight, height, newPassword, confirmPassword } = req.body;
      
            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
      
            if (newPassword || confirmPassword) {
                if (newPassword !== confirmPassword) {
                    return res.status(400).json({ message: "New password and confirm password do not match" });
                }
      
                const hashedNewPassword = await bcrypt.hash(newPassword, 4);
                user.password = hashedNewPassword;
            }
      
            // Update user details
            if (name) user.name = name;
            if (email) user.email = email;
            if (mobile) user.mobile = mobile;
      
            // Update or create FormData entry
            let form = await formModel.findOne({ userId });
            if (!form) {
                form = new formModel({ userId });
            }
            
            if (name) form.name = name;
            if (day) form.day = day;
            if (month) form.month = month;
            if (year) form.year = year;
            if (weight) form.weight = weight;
            if (height) form.height = height;
      
            // Save updates
            await user.save();
            await form.save();
      
            return res.status(200).json({ message: "Profile updated successfully" });
      
        } catch (error) {
            console.error("Error updating profile:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
        });
      
export default router;