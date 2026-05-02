import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
    getMessages,
    getUserForSidebar,
    markMessageAsSeen,
    sendMessage,
    getGroups,
    getGroupMessages,
    createGroup,
    sendGroupMessage,
} from "../controllers/MessageController.js";

const messagerouter = express.Router();

messagerouter.get("/users", protectRoute, getUserForSidebar);
messagerouter.get("/groups", protectRoute, getGroups);
messagerouter.get("/group/:id", protectRoute, getGroupMessages);
messagerouter.get("/:id", protectRoute, getMessages);
messagerouter.put("/mark/:id", protectRoute, markMessageAsSeen);
messagerouter.post("/send/:id",protectRoute, sendMessage);
messagerouter.post("/group/create", protectRoute, createGroup);
messagerouter.post("/group/send/:id", protectRoute, sendGroupMessage);

export default messagerouter;