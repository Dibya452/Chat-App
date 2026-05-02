import React, { useState, useEffect, createContext } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://chat-app-backend-lfw4.onrender.com";
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    // Check authentication using protected check route
    const checkAuth = async () => {
        try {
            if (!token) return;
            axios.defaults.headers.common["token"] = token;
            const { data } = await axios.get("/api/auth/check");
            if (data.success && data.user) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            // If token is invalid, clear it and log out
            if (error.response?.status === 401 || error.message?.includes('invalid signature')) {
                localStorage.removeItem("token");
                setToken(null);
                setAuthUser(null);
                axios.defaults.headers.common["token"] = null;
            }
            toast.error(error.message);
        }
    };

    // login/sign up
    const login = async (route, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${route}`, credentials);
            if (data.success) {
                // server returns userData for signup/login
                const user = data.user || data.userData;
                setAuthUser(user);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message || "Logged in");
                connectSocket(user);
            } else {
                toast.error(data.message || "Authentication failed");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged out successfully");
        if (socket) socket.disconnect();
        setSocket(null);
    };

    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if (data.success) {
                setAuthUser(data.user || data.userData || data.user);
                toast.success("Profile updated successfully");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: { userId: userData._id },
        });
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds || []);
        });
    };

    useEffect(() => {
        if (token) axios.defaults.headers.common["token"] = token;
        checkAuth();
    }, []);

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
