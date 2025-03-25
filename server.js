import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import boxRoutes from './presentation/routes/box.routes.js'
import signin from "./presentation/routes/signin.routes.js";
import signup from "./presentation/routes/signup..routes.js";
import submitform from "./presentation/routes/submit-form.routes.js";
import otp from "./presentation/routes/otp.routes.js"; 
import qaRoutes from "./presentation/routes/qaRoutes.js"; 
import { userMiddleware } from './presentation/middleware/auth.js';


// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json({ limit: "10mb" })); // Allow large image uploads
// app.use(express.urlencoded({ extended: true }));

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log("MongoDB Connected"))
// .catch((err) => console.error("MongoDB Connection Error:", err));


import { pipeline } from "@xenova/transformers";

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

const db = mongoose.connection;
const domainsCollection = db.collection("Question_database");
const responsesCollection = db.collection("data");

// Load Sentence Transformer Model
let model;
(async () => {
  model = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  console.log("AI Model Loaded");
})();

export { domainsCollection, responsesCollection, model };




// Define Mongoose Schema & Model
const User_query = new mongoose.Schema({
  firstName: String,
  surname: String,
  email: String,
  message: String,
});

const FormModel = mongoose.model("User_query", User_query);

// API Endpoint for Submitting Form
app.post("/api/v1/User_query", async (req, res) => {
  try {

    const { firstName, surname, email, message } = req.body;

    if (!firstName || !email || !message || !surname) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newFormEntry = new FormModel({ firstName, surname, email, message });
    await newFormEntry.save();

    res.status(201).json({ success: true, message: "Form submitted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

app.get('/domains', (req, res) => {
  res.json({
      domain: [
          "Wellness and Fitness",
          "Health",
          "Technology",
          "Education",
          "Business",
          "Entertainment",
          "Sports",
          "Lifestyle"
      ]
  });
});


// Fixed subdomains for each domain
const subdomains = {
  "Wellness and Fitness": ["Yoga", "Meditation", "Nutrition", "Exercise"],
  "Health": ["Mental Health", "Diet & Nutrition", "Medical Research", "Fitness"],
  "Technology": ["AI & ML", "Blockchain", "Cybersecurity", "Cloud Computing"],
  "Education": ["Online Learning", "Skill Development", "EdTech", "Higher Education"],
  "Business": ["Startups", "Marketing", "Finance", "E-commerce"],
  "Entertainment": ["Movies", "Music", "Gaming", "Theater"],
  "Sports": ["Football", "Cricket", "Basketball", "Tennis"],
  "Lifestyle": ["Fashion", "Travel", "Wellness", "Home Decor"]
};



const questionsDB = {
  "Yoga": ["What is Hatha Yoga?", "Benefits of Pranayama?", "What is Ashtanga Yoga?", "How does Yoga help mental health?", "Difference between Yoga & Meditation?", "Best Yoga postures for beginners?"],
  "Meditation": ["How does meditation reduce stress?", "Types of meditation techniques?", "What is mindfulness meditation?", "Best time to meditate?", "Benefits of guided meditation?", "How to improve focus with meditation?"],
  "Nutrition": ["Importance of balanced diet?", "Best foods for weight loss?", "What are superfoods?", "How to maintain gut health?", "Role of protein in diet?", "Is intermittent fasting healthy?"],
  "Exercise": ["How does exercise improve heart health?", "What are HIIT workouts?", "Strength training vs Cardio?", "Best exercises for weight loss?", "How to recover from workouts?", "Does stretching prevent injuries?"]
};

// API Endpoint to Get Questions for a Subdomain
app.get("/domains/:domain/subdomains/:subdomain/questions", (req, res) => {
  const { subdomain } = req.params;
  const questions = questionsDB[subdomain] || [];
console.log(questions)
  // Get up to 6 random questions
  const shuffled = questions.sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffled.slice(0, 6);

  res.json({ questions: selectedQuestions });
});


// Get subdomains for a specific domain
app.get("/domains/:title/subdomains", (req, res) => {
  const { title } = req.params;
  const decodedTitle = decodeURIComponent(title);
  
  if (subdomains[decodedTitle]) {
      res.json({ subdomains: subdomains[decodedTitle] });
  } else {
      res.status(404).json({ error: "Domain not found" });
  }
});





app.get("/", (req, res) => {
  res.send("AIYUH Backend is running!");
});

// Routes
app.use("/api/boxes", boxRoutes);


// Use Sign-in Routes
app.use("/api/v1/signin", signin);
app.use("/api/v1/signup", signup);
app.use("/api/v1/otp", otp);
app.use("/api/v1/submit-form", submitform);

app.use("/api/v1/qaRoutes", qaRoutes);

app.get("/api/v1/dashboard", userMiddleware, (req, res) => {
  res.status(200).json({
      message: "Welcome to the dashboard! You are authenticated."
  });
});

// app.post("/api/v1/submit-form",checkUserMiddleware , async (req, res) => {
//   try {
//     let formData = req.body;

//     const newForm = new FormData({ userId: req.userId, ...formData });
//       await newForm.save();
//       res.status(201).json({ message: "Form submitted successfully!" });
//   } catch (error) {
//       res.status(500).json({ message: "Server Error", error });
//   }
// });

// Server Running
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
