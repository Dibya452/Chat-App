import jwt from "jsonwebtoken";

// Function to generate a token for a user
export const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET || "realtime-chat-jwt-secret-2024";
    const token = jwt.sign({ userId }, secret);
    return token;
};