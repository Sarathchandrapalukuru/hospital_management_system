// src/api/axios.js
import axios from 'axios';

// Create instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/'
});

// Add request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Get token from localStorage
    console.log(token)
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      // config.headers['Authorization'] = `Token ${token}`;

    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

// src/api/api.js

// const BASE_URL = "http://127.0.0.1:8000/api/";

// const apiFetch = async (endpoint, options = {}) => {
//   const token = localStorage.getItem("token");

//   // Add default headers
//   const headers = {
//     "Content-Type": "application/json",
//     ...(options.headers || {}),
//   };

//   // Attach token
//   if (token) {
//     headers["Authorization"] = `Bearer ${token}`;
//   }

//   const response = await fetch(BASE_URL + endpoint, {
//     ...options,
//     headers,
//   });

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({}));
//     throw new Error(errorData.detail || "API Error");
//   }

//   return response.json();
// };

// export default apiFetch;
