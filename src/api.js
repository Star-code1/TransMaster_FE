// src/api.js
const getBaseURL = () => {
  // Nếu đang chạy trên Vercel (Production), lấy link Render
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Nếu ở local, trả về rỗng để Vite Proxy xử lý
  return ""; 
};

export const API_BASE_URL = getBaseURL();