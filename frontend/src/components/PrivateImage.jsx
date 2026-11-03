import { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { getImageUrl } from '../api/apiConfig';
import { useAuth } from '../context/AuthContext';

const PrivateImage = ({ imagePath, alt, className = '' }) => {
  const { token } = useAuth();
  const [source, setSource] = useState('');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl;
    setSource('');
    setFailed(false);
    const load = async () => {
      try {
        // Fetch with the JWT header; never put credentials in image URLs.
        const response = await apiClient.get(getImageUrl(imagePath), { responseType: 'blob', signal: controller.signal });
        if (!controller.signal.aborted) {
          objectUrl = URL.createObjectURL(response.data);
          setSource(objectUrl);
        }
      } catch { if (!controller.signal.aborted) setFailed(true); }
    };
    if (imagePath && token) load();
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [imagePath, token]);
  if (!imagePath) return null;
  if (failed) return <span role="status">Image unavailable</span>;
  return source ? <img src={source} alt={alt} className={className} /> : <span role="status">Loading image...</span>;
};

export default PrivateImage;
