import { generateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs";
import User from "../Models/user.js";
import cloudinary from "../lib/cloudnary.js";

//Signup a new user
export const signup = async (req, res) =>{
    const { fullName, email, password, bio} = req.body;
    try{
        console.log("Signup attempt headers:", req.headers);
        console.log("Signup attempt body:", req.body);
        // bio is optional from the client — default to empty string
        const userBio = bio || "";
        if(!fullName || !email || !password){
            console.log("Signup failed - missing fields. Received body:", req.body);
            return res.status(400).json({ success: false, message:"Full name, email and password are required", received: req.body });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const salt =await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = await User.create({
            fullName,
            email,
            password:hashedPassword,
            bio: userBio
        });

    const token = generateToken(newUser._id);

        res.json({ success: true, userData: newUser, token, message:"Signup successful"});

    }catch(error) {
        console.log("Signup error:", error);
        return res.status(500).json({ success: false, message:"Signup failed, please try again"});
    }
}

//Controller to login a user
export const login = async (req, res) =>{
    try{
        const {email,password} = req.body;
        const userData = await User.findOne({ email });
        if (!userData) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(userData._id);

        res.json({ success: true, userData: userData, token, message: "Login successful" });

    }catch(error){
        console.log("Signup error:", error);
        return res.status(500).json({ success: false, message:"Signup failed, please try again"});
    }
    
}
//controller to check if user is authenticated
export const checkAuth =(req,res)=>{
    res.json({ success: true, user: req.user, message:"User is authenticated"})
}

//Controllers to update user profile details
export const updateProfile = async(req,res)=>{
    try{
        const {profilePic, bio,fullName} = req.body;

        const userId = req.user._id;
        let updateUser;
        if(!profilePic){
            updateUser = await User.findByIdAndUpdate(userId, {bio, fullName},{new:true});
        } else{
            const upload = await cloudinary.uploader.upload(profilePic);
            
            updateUser = await User.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,fullName},{new: true});
        }
        res.json({success:true,user: updateUser})

    }catch(error){
console.log(error.message);
res.json({success:false,message:error.message})
    }
}