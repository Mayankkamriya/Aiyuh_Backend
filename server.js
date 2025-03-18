import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import boxRoutes from './presentation/routes/box.routes.js'
import signin from "./presentation/routes/signin.routes.js";
import signup from "./presentation/routes/signup..routes.js";
import otp from "./presentation/routes/otp.routes.js"; 
import FormData from './models/form.model.js'
import { userMiddleware } from './presentation/middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Allow large image uploads
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB Connection Error:", err));


app.get("/", (req, res) => {
  res.send("AIYUH Backend is running!");
});

// Routes
app.use("/api/boxes", boxRoutes);


// Use Sign-in Routes
app.use("/api/v1/signin", signin);
app.use("/api/v1/signup", signup);
app.use("/api/v1/otp", otp);

app.get("/api/v1/dashboard", userMiddleware, (req, res) => {
  res.status(200).json({
      message: "Welcome to the dashboard! You are authenticated."
  });
});

app.post("/api/v1/submit-form", async (req, res) => {
  try {
    let formData = req.body;

    let anonymousUserId;

    // Generate a new userId if not provided
    if (!formData.userId) {
      anonymousUserId = uuidv4();
    }

    const newForm = new FormData({ anonymousUserId, ...formData });
      await newForm.save();
      res.status(201).json({ message: "Form submitted successfully!" });
  } catch (error) {
      res.status(500).json({ message: "Server Error", error });
  }
});

// Server Running
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
