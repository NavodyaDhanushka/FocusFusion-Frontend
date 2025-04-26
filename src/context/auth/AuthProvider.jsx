import { useState, useEffect } from "react";
import axios from "axios";
import AuthContext from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setAuthToken(user.token);
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setCurrentUser(userData);
    setAuthToken(userData.token);
  };

  const logout = async () => {
    try {
      
      //send request to user to logout
      await axios.post(
        "http://localhost:8080/logout",
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Error during server logout:", error);
    } finally {
      
      localStorage.removeItem("user");
      setAuthToken(null);
      setCurrentUser(null);

      document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name =
          eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    }
  };

  const updateUser = (userData) => {
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  const value = {
    currentUser,
    login,
    logout,
    updateUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
