import axios from "axios";

// Create an axios instance with base URL
const api = axios.create({
  baseURL: "https://pdf-management-system-3iju.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token is expired, log out the user
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
