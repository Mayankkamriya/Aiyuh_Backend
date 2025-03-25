import express from "express";
import { createBox, getAllBoxes } from "../../controllers/box.controller.js";

const router = express.Router();

router.post("/", createBox);
router.get("/", getAllBoxes);

export default router;
