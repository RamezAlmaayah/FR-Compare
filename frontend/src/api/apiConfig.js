const API_BASE_URL = import.meta.env.VITE_SERVER || 'http://localhost:5000/api';
const SERVER_ORIGIN = new URL(API_BASE_URL, window.location.origin).origin;

const getImageUrl = (imagePath) =>
  imagePath ? new URL(imagePath, `${SERVER_ORIGIN}/`).toString() : '';

export { API_BASE_URL, getImageUrl };
