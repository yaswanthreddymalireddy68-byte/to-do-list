import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  category: { type: String, enum: ['Personal', 'Work', 'Health', 'Learning', 'Other'], default: 'Personal' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  dueDate: { type: Date, default: null },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
}, { timestamps: true, versionKey: false });

taskSchema.index({ userId: 1, dueDate: 1 });

export default mongoose.model('Task', taskSchema);
