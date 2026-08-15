import axios from "axios";

// Đảm bảo trỏ đúng vào port Backend đang chạy
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
});

// Tự động đính kèm token nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
