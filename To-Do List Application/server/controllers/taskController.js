import mongoose from 'mongoose';
import Task from '../models/Task.js';
import asyncHandler from '../utils/asyncHandler.js';
import { cleanText, isValidDate } from '../utils/validation.js';

const allowed = {
  category: ['Personal', 'Work', 'Health', 'Learning', 'Other'],
  priority: ['Low', 'Medium', 'High'],
  status: ['Pending', 'In Progress', 'Completed'],
};

export function validateTaskInput(body, partial = false) {
  body = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const values = {};
  for (const field of ['title', 'description']) {
    if (!(field in body) && partial) continue;
    const value = cleanText(body[field] ?? (field === 'description' ? '' : ''));
    const maxLength = field === 'title' ? 120 : 1000;
    if (typeof value !== 'string' || (field === 'title' && !value) || value.length > maxLength) {
      return { error: `${field === 'title' ? 'Title' : 'Description'} is invalid or too long.` };
    }
    values[field] = value;
  }
  for (const [field, options] of Object.entries(allowed)) {
    if (!(field in body) && partial) continue;
    const value = body[field] ?? (field === 'category' ? 'Personal' : field === 'priority' ? 'Medium' : 'Pending');
    if (!options.includes(value)) return { error: `Choose a valid ${field}.` };
    values[field] = value;
  }
  if ('dueDate' in body || !partial) {
    if (!isValidDate(body.dueDate)) return { error: 'Enter a valid due date.' };
    values.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  }
  return { values };
}

function validId(id) {
  return mongoose.isValidObjectId(id);
}

export const createTask = asyncHandler(async (req, res) => {
  const { values, error } = validateTaskInput(req.body);
  if (error) return res.status(400).json({ message: error });
  const task = await Task.create({ ...values, userId: req.user._id });
  return res.status(201).json({ task });
});

export const getTasks = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.status && allowed.status.includes(req.query.status)) filter.status = req.query.status;
  if (req.query.priority && allowed.priority.includes(req.query.priority)) filter.priority = req.query.priority;
  const tasks = await Task.find(filter).sort({ dueDate: 1, createdAt: -1 });
  res.json({ tasks });
});

export const getTask = asyncHandler(async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ message: 'Task not found.' });
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  res.json({ task });
});

export const updateTask = asyncHandler(async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ message: 'Task not found.' });
  const { values, error } = validateTaskInput(req.body, true);
  if (error) return res.status(400).json({ message: error });
  if (!Object.keys(values).length) return res.status(400).json({ message: 'Provide at least one task field to update.' });
  const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { $set: values }, { new: true, runValidators: true });
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  res.json({ task });
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ message: 'Task not found.' });
  const { status } = req.body;
  if (!allowed.status.includes(status)) return res.status(400).json({ message: 'Choose a valid task status.' });
  const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { $set: { status } }, { new: true, runValidators: true });
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  res.json({ task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ message: 'Task not found.' });
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  res.json({ message: 'Task deleted.' });
});
