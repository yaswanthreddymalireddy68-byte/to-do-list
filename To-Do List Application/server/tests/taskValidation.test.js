import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTaskInput } from '../controllers/taskController.js';

test('requires a title and applies optional field defaults', () => {
  const result = validateTaskInput({ title: '  Plan the week  ' });
  assert.equal(result.error, undefined);
  assert.equal(result.values.title, 'Plan the week');
  assert.equal(result.values.description, '');
  assert.equal(result.values.category, 'Personal');
  assert.equal(result.values.priority, 'Medium');
  assert.equal(result.values.status, 'Pending');
  assert.equal(result.values.dueDate, null);
});

test('rejects invalid titles, enum values, and due dates', () => {
  assert.match(validateTaskInput({ title: ' ' }).error, /Title/);
  assert.match(validateTaskInput({ title: 'Task', priority: 'Urgent' }).error, /priority/);
  assert.match(validateTaskInput({ title: 'Task', dueDate: 'not-a-date' }).error, /due date/);
  assert.match(validateTaskInput({ title: 'Task', dueDate: '2026-02-31' }).error, /due date/);
});

test('validates partial updates without requiring a title', () => {
  const result = validateTaskInput({ status: 'In Progress', description: '  Notes  ' }, true);
  assert.equal(result.error, undefined);
  assert.deepEqual(result.values, { description: 'Notes', status: 'In Progress' });
});

test('rejects non-object payloads without throwing', () => {
  assert.match(validateTaskInput(null).error, /Title/);
  assert.match(validateTaskInput([]).error, /Title/);
});
