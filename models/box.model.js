import mongoose from "mongoose";

const boxSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String, // base64 image format
    required: true,
  },
  special: {
    type: Boolean,
    default: false,
  },
});


const Box = mongoose.model("Box", boxSchema);
export default Box;
