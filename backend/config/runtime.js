const getRuntimeConfig = (env = process.env) => {
  const production = env.NODE_ENV === 'production';
  const origins = (env.CORS_ORIGINS || (production ? '' : 'http://localhost:5173,http://127.0.0.1:5173'))
    .split(',').map((origin) => origin.trim()).filter(Boolean);
  for (const origin of origins) {
    let url;
    try { url = new URL(origin); } catch { throw new Error('CORS_ORIGINS contains an invalid origin.'); }
    if (url.origin !== origin || (production && url.protocol !== 'https:') ||
        !['http:', 'https:'].includes(url.protocol)) throw new Error('CORS_ORIGINS must contain exact web origins.');
  }
  if (production && (!env.MONGO_URI || !env.JWT_SECRET || Buffer.byteLength(env.JWT_SECRET) < 32 || !origins.length)) {
    throw new Error('Production requires MONGO_URI, a JWT_SECRET of at least 32 bytes, and CORS_ORIGINS.');
  }
  const storage = env.UPLOAD_STORAGE || (production ? 'gridfs' : 'local');
  if (!['local', 'gridfs'].includes(storage)) throw new Error('UPLOAD_STORAGE must be local or gridfs.');
  if (production && storage === 'local' && !env.UPLOAD_DIR) {
    throw new Error('Production local storage requires UPLOAD_DIR on an approved persistent volume.');
  }
  const trustProxy = Number(env.TRUST_PROXY_HOPS || 0);
  if (!Number.isInteger(trustProxy) || trustProxy < 0 || trustProxy > 5) throw new Error('TRUST_PROXY_HOPS must be between 0 and 5.');
  const port = Number(env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port.');
  return { production, origins, storage, trustProxy, port };
};

export default getRuntimeConfig;
