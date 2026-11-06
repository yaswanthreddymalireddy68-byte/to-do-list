import { useState } from 'react';
import { X } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';

const blankTask = { title: '', description: '', category: 'Personal', priority: 'Medium', dueDate: '', status: 'Pending' };

export default function TaskDialog({ task, onClose, onSaved }) {
  const [values, setValues] = useState(task ? { ...task, dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '' } : blankTask);
  const [saving, setSaving] = useState(false);
  const notify = useToast();

  function update(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      if (task?._id) await api.put(`/tasks/${task._id}`, values);
      else await api.post('/tasks', values);
      notify(task ? 'Your task has been updated.' : 'Task added to your list.');
      if (onSaved) onSaved();
      else window.dispatchEvent(new Event('daymark:tasks-changed'));
      onClose();
    } catch (error) {
      notify(getErrorMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-dialog-title"><div className="modal-heading"><div><span className="eyebrow">A LITTLE MOMENTUM</span><h2 id="task-dialog-title">{task ? 'Edit task' : 'Create a task'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button></div><form onSubmit={submit} className="task-form"><label className="field-label">Title<input autoFocus name="title" value={values.title} onChange={update} placeholder="What needs your attention?" maxLength="120" required /></label><label className="field-label">Description <span className="optional">Optional</span><textarea name="description" value={values.description} onChange={update} placeholder="Add a few helpful details..." rows="3" maxLength="1000" /></label><div className="form-grid"><label className="field-label">Category<select name="category" value={values.category} onChange={update}>{['Personal', 'Work', 'Health', 'Learning', 'Other'].map((item) => <option key={item}>{item}</option>)}</select></label><label className="field-label">Priority<select name="priority" value={values.priority} onChange={update}>{['Low', 'Medium', 'High'].map((item) => <option key={item}>{item}</option>)}</select></label><label className="field-label">Due date<input name="dueDate" type="date" value={values.dueDate} onChange={update} /></label><label className="field-label">Status<select name="status" value={values.status} onChange={update}>{['Pending', 'In Progress', 'Completed'].map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving...' : task ? 'Save changes' : 'Create task'}</button></div></form></section></div>;
}
