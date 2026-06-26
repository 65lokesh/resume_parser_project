import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api/",
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const session = localStorage.getItem("resumeai_session");
  if (session) {
    try {
      const u = JSON.parse(session);
      if (u.id) config.headers["X-User-Id"] = u.id;
    } catch {}
  }
  return config;
});

export default apiClient;
