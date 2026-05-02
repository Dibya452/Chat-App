import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    const [unseenGroupMessages, setUnseenGroupMessages] = useState({});

    const { socket, axios } = useContext(AuthContext);

    const joinGroupRooms = (groupIds) => {
        if (!socket || !Array.isArray(groupIds) || groupIds.length === 0) return;
        socket.emit("join-groups", groupIds);
    };

    // Get users for sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/message/users");
            if (data.success) {
                setUsers(data.users || []);
                setUnseenMessages(data.unseenMessage || {});
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getGroups = async () => {
        try {
            const { data } = await axios.get("/api/message/groups");
            if (data.success) {
                setGroups(data.groups || []);
                joinGroupRooms((data.groups || []).map((g) => g._id));
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Get messages for selected user or group
    const getMessages = async (id, type = "user") => {
        try {
            const url = type === "group" ? `/api/message/group/${id}` : `/api/message/${id}`;
            const { data } = await axios.get(url);
            if (data.success) setMessages(data.messages || []);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const createGroup = async ({ name, memberIds }) => {
        try {
            if (!name?.trim()) return toast.error("Group name is required");
            if (!memberIds?.length) return toast.error("Select at least one member");
            const { data } = await axios.post("/api/message/group/create", { name, memberIds });
            if (data.success) {
                setGroups((prev) => [...prev, data.group]);
                joinGroupRooms([data.group._id]);
                toast.success("Group created successfully");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const sendMessage = async (messageData) => {
        try {
            if (selectedGroup) {
                const { data } = await axios.post(`/api/message/group/send/${selectedGroup._id}`, messageData);
                if (data.success) setMessages((prev) => [...prev, data.newMessage]);
                else toast.error(data.message);
                return;
            }
            if (!selectedUser) return toast.error("No recipient selected");
            const { data } = await axios.post(`/api/message/send/${selectedUser._id}`, messageData);
            if (data.success) setMessages((prev) => [...prev, data.newMessage]);
            else toast.error(data.message);
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Subscribe to incoming messages and group messages
    useEffect(() => {
        if (!socket) return;

        const handleDirectMessage = (newMessage) => {
            const senderId = typeof newMessage.senderId === 'object' ? newMessage.senderId._id : newMessage.senderId;
            if (selectedUser && senderId === selectedUser._id.toString()) {
                newMessage.seen = true;
                setMessages((prev) => [...prev, newMessage]);
                axios.put(`/api/message/mark/${newMessage._id}`);
            } else {
                setUnseenMessages((prev) => ({
                    ...prev,
                    [senderId]: prev[senderId] ? prev[senderId] + 1 : 1,
                }));
            }
        };

        const handleGroupMessage = (newMessage) => {
            if (selectedGroup && newMessage.groupId === selectedGroup._id) {
                setMessages((prev) => [...prev, newMessage]);
            } else {
                setUnseenGroupMessages((prev) => ({
                    ...prev,
                    [newMessage.groupId]: prev[newMessage.groupId] ? prev[newMessage.groupId] + 1 : 1,
                }));
            }
        };

        socket.on("new-message", handleDirectMessage);
        socket.on("new-group-message", handleGroupMessage);

        return () => {
            socket.off("new-message", handleDirectMessage);
            socket.off("new-group-message", handleGroupMessage);
        };
    }, [socket, selectedUser, selectedGroup]);

    useEffect(() => {
        if (!socket) return;
        joinGroupRooms(groups.map((group) => group._id));
    }, [socket, groups]);

    useEffect(() => {
        getUsers();
        getGroups();
    }, []);

    const value = {
        messages,
        users,
        groups,
        selectedUser,
        selectedGroup,
        setSelectedUser,
        setSelectedGroup,
        getUsers,
        getGroups,
        getMessages,
        sendMessage,
        createGroup,
        unseenMessages,
        unseenGroupMessages,
        setUnseenMessages,
        setUnseenGroupMessages,
        setMessages,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};