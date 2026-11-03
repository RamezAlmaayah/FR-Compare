import jwt from 'jsonwebtoken';

const requireAuth = (request, response, next) => {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader?.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'Authentication required' });
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();

  if (!token) {
    return response.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken.userId) {
      return response.status(401).json({ error: 'Invalid or expired token' });
    }

    request.userId = decodedToken.userId;
    return next();
  } catch {
    return response.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default requireAuth;
