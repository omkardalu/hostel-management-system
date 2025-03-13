// src/utils/auth.js
import { jwtDecode } from "jwt-decode";

export const isAuthenticated = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    return decoded?.exp * 1000 > Date.now(); // Valid token check
  } catch (error) {
    return false; // Invalid token
  }
};
