import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import styles from "../assets/styles/Dashboard.module.css";
import { logoutUser } from "../utils/auth";
import { refreshAccessToken } from "../utils/auth";
import api from "../utils/axiosConfig";

const Dashboard = () => {
  const [user, setUser] = useState({ email: "", role: "", profilePicture: "" });
  const [hostels, setHostels] = useState([]); // Store all available hostels
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

  // Fetch all available hostels
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/hostels/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
        setHostels(data.hostels);

      } catch (error) {
        console.error("Error fetching hostels:", error);
      }
    };
    fetchHostels();
  }, []);

  // Handle joining a hostel

  const handleJoinHostel = async (hostelId) => {
    let token = localStorage.getItem("accessToken");
  
    if (!token) {
      alert("You are not logged in. Please log in first.");
      navigate("/");
      return;
    }
  
    try {
      await api.get(`/api/hostels/join/${hostelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      alert("Join request sent successfully!");
    } catch (error) {
      if (error.response?.status === 401) {
        // 🔹 If 401 Unauthorized, attempt token refresh
        token = await refreshAccessToken();
        if (!token) {
          alert("Session expired. Please log in again.");
          return;
        }
  
        // 🔹 Retry the request with the new token
        try {
          await api.get(`/api/hostels/join/${hostelId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          alert("Join request sent successfully!");
        } catch (retryError) {
          console.error("Retry failed:", retryError.response?.data || retryError.message);
          alert("Error: Unable to join hostel.");
        }
      } else {
        console.error("Failed to join hostel:", error.response?.data || error.message);
        alert("Error: Unable to join hostel.");
      }
    }
  };

  console.log(hostels);

  return (
    <div className={styles.dashboardContainer}>
      {!user ? "Loading..." : (
        <>
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

          <button className={styles.logoutButton} onClick={logoutUser}>
            Logout
          </button>

          <section className={styles.hostelList}>
            <h2>Available Hostels</h2>
            {hostels.length === 0 ? (
              <p>No hostels available.</p>
            ) : (
              <ul>
                {hostels.map((hostel) => (
                  <li key={hostel.hostelId} className={styles.hostelCard}>
                    <h3>{hostel.name}</h3>
                    <p>📍 {hostel.address}</p>
                    <p>👥 {hostel.totalMembers} Members</p>
                    <button onClick={() => handleJoinHostel(hostel.hostelId)}>Join</button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
