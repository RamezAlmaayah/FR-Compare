import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_LIFETIME = '7d';

const normalizeEmail = (email) => email.trim().toLowerCase();

const getSafeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
});

const createToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return jwt.sign({ userId }, jwtSecret, { expiresIn: TOKEN_LIFETIME });
};

const registerUser = async (request, response) => {
  const { name, email, password } = request.body;

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !name.trim() ||
    !email.trim() ||
    !password
  ) {
    return response.status(400).json({ error: 'Name, email, and password are required' });
  }

  const normalizedEmail = normalizeEmail(email);

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return response.status(400).json({ error: 'Enter a valid email address' });
  }

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return response.status(400).json({ error: 'An account with this email already exists' });
  }

  try {
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    return response.status(201).json({
      message: 'Registration successful',
      user: getSafeUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(400).json({ error: 'An account with this email already exists' });
    }

    throw error;
  }
};

const loginUser = async (request, response) => {
  const { email, password } = request.body;

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    !password
  ) {
    return response.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = normalizeEmail(email);

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return response.status(400).json({ error: 'Enter a valid email address' });
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  const passwordMatches = user ? await user.matchesPassword(password) : false;

  if (!user || !passwordMatches) {
    return response.status(401).json({ error: 'Invalid email or password' });
  }

  return response.status(200).json({
    token: createToken(user._id.toString()),
    user: getSafeUser(user),
  });
};

const getCurrentUser = async (request, response) => {
  const user = await User.findById(request.userId);

  if (!user) {
    return response.status(401).json({ error: 'Authenticated user no longer exists' });
  }

  return response.status(200).json({ user: getSafeUser(user) });
};

export { getCurrentUser, loginUser, registerUser };
