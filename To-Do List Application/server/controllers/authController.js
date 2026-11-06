import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { cleanText, isValidEmail } from '../utils/validation.js';

function createToken(userId) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw Object.assign(new Error('JWT_SECRET must be set to at least 32 characters.'), { status: 500 });
  }
  return jwt.sign({}, process.env.JWT_SECRET, { subject: userId.toString(), expiresIn: '7d' });
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt };
}

export const register = asyncHandler(async (req, res) => {
  const name = cleanText(req.body.name);
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body.password;
  if (typeof name !== 'string' || name.length < 2 || name.length > 60) return res.status(400).json({ message: 'Name must be between 2 and 60 characters.' });
  if (!isValidEmail(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) return res.status(400).json({ message: 'Password must be between 8 and 72 characters.' });
  const user = await User.create({ name, email, password });
  return res.status(201).json({ token: createToken(user._id), user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body.password;
  if (!isValidEmail(email) || typeof password !== 'string') return res.status(400).json({ message: 'Enter a valid email and password.' });
  const user = await User.findOne({ email }).select('+password');
  const passwordMatches = user ? await user.comparePassword(password) : await bcrypt.compare(password, '$2a$12$4r6kYH4eKQsLsoVp3lBjLuWmCrC8Z3zZB4UJzblx3vHzkeUPK.6Ry');
  if (!user || !passwordMatches) return res.status(401).json({ message: 'Email or password is incorrect.' });
  return res.json({ token: createToken(user._id), user: publicUser(user) });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export const updateMe = asyncHandler(async (req, res) => {
  const name = cleanText(req.body.name);
  if (typeof name !== 'string' || name.length < 2 || name.length > 60) return res.status(400).json({ message: 'Name must be between 2 and 60 characters.' });
  const user = await User.findByIdAndUpdate(req.user._id, { $set: { name } }, { new: true, runValidators: true }).select('_id name email createdAt');
  res.json({ user: publicUser(user) });
});
