// src/utils/auth.js

const TOKEN_KEY = "auth_token";

// Store JWT in localStorage
export const storeToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Get JWT from localStorage
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Clear token (for logout)
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};
