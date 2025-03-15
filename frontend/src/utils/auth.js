// src/utils/auth.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";
const token = localStorage.getItem("accessToken");

export const isAuthenticated = () => {
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    return decoded?.exp * 1000 > Date.now(); // Valid token check
  } catch (error) {
    return false;
  }
};

export const logoutUser = async () => {
  try {
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    localStorage.removeItem("accessToken");
    window.location.href = "/";
  }
};