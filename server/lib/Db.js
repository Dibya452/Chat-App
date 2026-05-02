import mongoose from "mongoose";

export const connectDB = async ()=>{
    try{
        mongoose.connection.on('connected',()=> console.log("Database Connected"));
        const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/realtime-chat";
        await mongoose.connect(mongoURI)
    }catch(error){
        console.log("Database connection failed", error)
    }
}