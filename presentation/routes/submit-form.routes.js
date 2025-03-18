import express from "express";
import FormData from "../../models/form.model.js";
import dotenv from "dotenv";
import { checkUserMiddleware } from "../middleware/auth.js";
// import userModel from "../../models/user.model.js";

dotenv.config();
const router = express.Router();

router.post("/",checkUserMiddleware , async (req, res) => {
    try {
      let formData = req.body;
  
      const newForm = new FormData({ userId: req.userId, ...formData });
      await newForm.save();

    //   const user = await userModel.findById(req.userId);
    //   if(user){
    //     await userModel.findByIdAndUpdate(req.userId, { $push: { formData: newForm } });
    //   }
    
        res.status(201).json({ message: "Form submitted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
  });

  
export default router;