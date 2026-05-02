import User from '../Models/user.js';
import jwt from 'jsonwebtoken';

//Middleware to protect routes
export const protectRoute = async (req, res, next) =>{
    try{
    // support Bearer token in Authorization header or token header
    const authHeader = req.headers.authorization || req.headers.token;
    if (!authHeader) return res.status(401).json({ success: false, message: 'No token provided' });

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    const secret = process.env.JWT_SECRET || "realtime-chat-jwt-secret-2024";
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.userId).select('-password');

        if(!user)
            return res.status(401).json({ success: false, message:"Not authorized, user not found"});
        
        req.user =user;
        next();

    }catch(error){
        console.log(error.message);
        res.json({ success: false, message: error.message });

    }
}
