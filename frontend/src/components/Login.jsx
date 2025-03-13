// src/components/Login.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  // Extract JWT from URL after successful login
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
    if (token) {
      localStorage.setItem("accessToken", token);
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
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
