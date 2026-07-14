import axios from 'axios'

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // If running in browser locally (Vite ports like 5173 or 4173) or on Vercel, use relative proxy paths
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return '/api';
  }
  if (window.location.hostname.endsWith('.vercel.app') || window.location.hostname === 'vercel.app') {
    return '/api';
  }
  // Default to live Vercel backend URL for native iOS/Android environments
  return 'https://ai-finance-tracker-amber.vercel.app/api';
};

const API = axios.create({
  baseURL: getBaseURL()
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }

    return Promise.reject(error)
  }
)

export default API
