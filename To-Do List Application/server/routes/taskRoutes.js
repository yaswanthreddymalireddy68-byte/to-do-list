import { Router } from 'express';
import authenticate from '../middleware/auth.js';
import { createTask, deleteTask, getTask, getTasks, updateTask, updateTaskStatus } from '../controllers/taskController.js';

const router = Router();
router.use(authenticate);
router.route('/').get(getTasks).post(createTask);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
router.patch('/:id/status', updateTaskStatus);

export default router;
