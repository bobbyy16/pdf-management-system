import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on page load
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser(userData);
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${userData.accessToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/users/login", { email, password });
      const userData = response.data;

      // Save user data and token
      localStorage.setItem("user", JSON.stringify(userData));
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${userData.accessToken}`;

      setUser(userData);
      return userData;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post("/users/register", userData);
      const newUser = response.data;

      // Save user data and token
      localStorage.setItem("user", JSON.stringify(newUser));
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${newUser.accessToken}`;

      setUser(newUser);
      return newUser;
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
