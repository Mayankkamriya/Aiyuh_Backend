import Box from "../models/box.model.js";

// Create a new box
export const createBox = async  (req, res) => {
  try {
    const { title, image, special } = req.body;
    const newBox = new Box({ title, image, special });
    await newBox.save();
    res.status(201).json({ message: "Box created successfully", box: newBox });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all boxes
export const getAllBoxes = async  (req, res) => {
  try {
    const boxes = await Box.find();
    res.status(200).json(boxes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
