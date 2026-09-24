// Configurable API base URL: auto-detects localhost during local development, falls back to live Render backend in production
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
export const API_BASE_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8000' : 'https://sih-backend-964e.onrender.com');
