import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import styles from "../assets/styles/Dashboard.module.css";

const Dashboard = () => {
  const [user, setUser] = useState({ email: "", role: "", profilePicture: "" });
  const location = useLocation();
  const navigate = useNavigate();

  // Extract and decode JWT token
  useEffect(() => {
    const extractToken = () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token") || localStorage.getItem("accessToken");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUser({
            email: decoded.email,
            role: decoded.role,
            profilePicture: decoded.profilePicture,
          });
          localStorage.setItem("accessToken", token);
        } catch (error) {
          console.error("Invalid token:", error);
          navigate("/");
        }
      } else {
        navigate("/");
      }
    };
    extractToken();
  }, [location, navigate]);

  // Refresh token if expired
  const refreshAccessToken = async () => {
    try {
      const { data } = await axios.get("/api/auth/refresh", {
        withCredentials: true, // For httpOnly cookie
      });
      localStorage.setItem("accessToken", data.accessToken);
      const decoded = jwtDecode(data.accessToken);
      setUser({
        email: decoded.email,
        role: decoded.role,
        profilePicture: decoded.profilePicture,
      });
    } catch (error) {
      console.error("Token refresh failed:", error);
      navigate("/login");
    }
  };
  console.log(user.profilePicture); 
  return (
    <div className={styles.dashboardContainer}>
      {!user ? "Loading..." : <>
        <header className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <div className={styles.profileContainer}>
            <img
              src={user.profilePicture || "https://via.placeholder.com/150"}
              alt="Profile"
              className={styles.profileImage}
              />
            <div className={styles.userInfo}>
              <p>{user.email}</p>
              <p className={styles.role}>{user.role}</p>
            </div>
          </div>
        </header>

        <section>
          {user.role === "admin" && <p>Welcome, Admin! Manage Rooms & Payments.</p>}
          {user.role === "student" && <p>Welcome, Student! View your details.</p>}
          {user.role === "staff" && <p>Welcome, Staff! Handle maintenance.</p>}
        </section>
      </>
      }
    </div>
  );

};

export default Dashboard;
