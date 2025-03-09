// src/components/Login.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storeToken, getToken } from "../utils/auth";

const Login = () => {
  const navigate = useNavigate();

  // Extract JWT from URL after successful login
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
    if (token) {
      storeToken(token);
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <button onClick={handleGoogleLogin} className="bg-blue-500 text-white p-4 rounded-lg">
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
