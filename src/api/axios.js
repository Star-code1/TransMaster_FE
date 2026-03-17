import axios from 'axios';

const instance = axios.create({
  // Vite sẽ tự lấy URL đúng dựa vào môi trường ông đang đứng
  baseURL: import.meta.env.VITE_API_URL 
});

export default instance;