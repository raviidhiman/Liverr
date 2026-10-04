import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api", timeout: 30000 });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("liverr_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use((r) => r, (err) => {
  const url = err.config?.url || "";
  const isAuthCall = url.startsWith("/auth/login") || url.startsWith("/auth/register") || url.startsWith("/auth/verify");
  if (err.response?.status === 401 && !isAuthCall && localStorage.getItem("liverr_token")) {
    localStorage.removeItem("liverr_token");
    if (!window.location.pathname.startsWith("/login")) window.location.href = "/login";
  }
  return Promise.reject(err);
});

export default api;
