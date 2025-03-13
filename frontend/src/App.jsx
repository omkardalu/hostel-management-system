// src/App.jsx
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { isAuthenticated } from "./utils/auth";

const App = () => {
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    setAuth(isAuthenticated());
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={auth ? <Navigate to={"/dashboard"} /> : <Login />} />
        <Route path="/dashboard" element={auth ? <Dashboard /> : <Login />} />
      </Routes>
    </Router>
  );
};

export default App;
