import mongoose from "mongoose";

const { Schema, model } = mongoose;

const formSchema = new Schema({
    userId: { type: String, required: true },
    name: String,
    day: String,
    month: String,
    year: String,
    timeOfBirth: String,
    placeOfBirth: String,
    currentLocation: String,
    gender: String,
    education: String,
    interests: String,
    relationshipStatus: String,
    healthIssues: String
});

export default model("FormData", formSchema);


