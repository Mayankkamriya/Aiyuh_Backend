import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: path.resolve("..", ".env") });

const JWT_SECRET = process.env.JWT_SECRET;

export const userMiddleware = (req, res, next) => {
    const header = req.headers.authorization;


    if (!header) {
        return res.status(403).json({
            message: "Authorization header is missing"
        });
    }

    try {
        const decoded = jwt.verify(header, JWT_SECRET);
        if (decoded) {
            req.userId = decoded.id;
            console.log("Middleware ran");
            next();
        }
        else {
            throw new Error("Wrong token")
        }

    } catch (error) {
        console.error("Token verification failed:", error);
        return res.status(403).json({
            message: "You are not logged in",
            error: error.message
        });
    }
};

// Middleware to check if user is logged in or generate UUID
export const checkUserMiddleware = (req, res, next) => {
    const header = req.headers.authorization;
    
    if (!header) {
        req.userId = uuidv4();  // Assign a UUID for anonymous users
        return next();
    }

    try {
        const decoded = jwt.verify(header, JWT_SECRET);
        if (decoded) {
            req.userId = decoded.id;  // Assign user ID from token
            return next();
        } else {
            throw new Error("Invalid token");
        }
    } catch (error) {
        console.error("Token verification failed:", error);
        req.userId = uuidv4();  // Assign a UUID if token verification fails
        console.log("Failed token verification. Assigned anonymous ID:", req.userId);
        next();
    }
};