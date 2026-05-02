import Message from "../Models/message.js";
import User from "../Models/user.js";
import Group from "../Models/group.js";
import GroupMessage from "../Models/groupMessage.js";
import cloudinary from "../lib/cloudnary.js";
import { getIO, UserSocketMap } from "../lib/socket.js";

// Get all users expect the logged in user
export const getUserForSidebar = async (req, res) =>{
    try{
        const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");
        

        //Count of unread messages from each user
        const unseenMessage = {};
        const promises = filteredUsers.map(async (user) => {
            const msgs = await Message.find({ senderId: user._id, receiverId: userId, seen: false });
            if (msgs.length > 0) {
                unseenMessage[user._id] = msgs.length;
            }
        });
        await Promise.all(promises);
        res.json({ success: true, users: filteredUsers, unseenMessage });
        }catch(error){
            console.log(error.message);
            res.json({ success: false, message: error.message });

    }
}

//Get messages selected user
export const getMessages = async (req, res) =>{
    try{
        const {id: selectedUserId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId}
            ]
        }).populate("senderId", "fullName profilePic");
        await Message.updateMany({senderId: selectedUserId, receiverId:myId},{seen: true});
        res.json({ success: true, messages });

    }catch(error){
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//api to mark message as seen using message id
export const markMessageAsSeen = async(req,res)=>{
    try{
        const {id } = req.params;
        await Message.findByIdAndUpdate(id,{seen:true});
        res.json({ success: true});
    }catch(error){
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//send message to selected user
export const sendMessage = async(req,res)=>{
    try{
        const {text,image} = req.body;
        const receiverId =req.params.id;
        const senderId = req.user._id;
        
        let imageUrl;
        if(image){
            const uplrdresponse = await cloudinary.uploader.upload(image)
            imageUrl = uplrdresponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image:imageUrl
        })

        // Populate sender details before sending
        const populatedMessage = await Message.findById(newMessage._id).populate("senderId", "fullName profilePic");

        // Emit new message to the receiver's socket
        const io = getIO();
        const receiverSocketid = UserSocketMap[receiverId];
        if (receiverSocketid && io) {
            io.to(receiverSocketid).emit("new-message", populatedMessage);
        }
        res.json({ success: true, newMessage: populatedMessage });

    }catch(error){
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const getGroups = async (req, res) => {
    try {
        const userId = req.user._id;
        const groups = await Group.find({ members: userId }).populate("members", "fullName profilePic");
        res.json({ success: true, groups });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const getGroupMessages = async (req, res) => {
    try {
        const groupId = req.params.id;
        const userId = req.user._id;
        const group = await Group.findById(groupId);
        if (!group || !group.members.some((memberId) => memberId.toString() === userId.toString())) {
            return res.status(403).json({ success: false, message: "Not authorized to access this group" });
        }

        const messages = await GroupMessage.find({ groupId }).populate("senderId", "fullName profilePic");
        res.json({ success: true, messages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const createGroup = async (req, res) => {
    try {
        const { name, memberIds } = req.body;
        const userId = req.user._id;
        const cleanedMembers = Array.from(new Set([userId.toString(), ...(memberIds || [])]));

        const group = await Group.create({
            name,
            members: cleanedMembers,
            createdBy: userId,
        });

        const populatedGroup = await Group.findById(group._id).populate("members", "fullName profilePic");
        res.json({ success: true, group: populatedGroup });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const sendGroupMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const groupId = req.params.id;
        const senderId = req.user._id;
        const group = await Group.findById(groupId);
        if (!group || !group.members.some((memberId) => memberId.toString() === senderId.toString())) {
            return res.status(403).json({ success: false, message: "Not authorized to send messages to this group" });
        }

        let imageUrl;
        if (image) {
            const uplrdresponse = await cloudinary.uploader.upload(image);
            imageUrl = uplrdresponse.secure_url;
        }

        const newMessage = await GroupMessage.create({
            senderId,
            groupId,
            text,
            image: imageUrl,
        });

        const populatedMessage = await GroupMessage.findById(newMessage._id).populate("senderId", "fullName profilePic");

        const io = getIO();
        if (io) {
            io.to(`group-${groupId}`).emit("new-group-message", populatedMessage);
        }

        res.json({ success: true, newMessage: populatedMessage });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
