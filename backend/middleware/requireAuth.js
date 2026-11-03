import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

const requireAuth = async (request, response, next) => {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader?.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'Authentication required' });
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();

  if (!token) {
    return response.status(401).json({ error: 'Authentication required' });
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

    if (!mongoose.isValidObjectId(decodedToken.userId)) {
      return response.status(401).json({ error: 'Invalid or expired token' });
    }

  } catch {
    return response.status(401).json({ error: 'Invalid or expired token' });
  }
  try {
    if (!await User.exists({ _id: decodedToken.userId })) return response.status(401).json({ error: 'Authenticated user no longer exists' });
    request.userId = decodedToken.userId;
    return next();
  } catch (error) { return next(error); }
};

export default requireAuth;
