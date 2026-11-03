const API_BASE_URL = import.meta.env.VITE_SERVER || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
const SERVER_ORIGIN = new URL(API_BASE_URL, window.location.origin).origin;

const getImageUrl = (imagePath) => {
  if (!imagePath || !/^\/uploads\/[a-f0-9-]+\.(png|jpe?g)$/i.test(imagePath)) {
    throw new Error('Invalid upload path');
  }
  return new URL(imagePath, `${SERVER_ORIGIN}/`).toString();
};

export { API_BASE_URL, getImageUrl };
