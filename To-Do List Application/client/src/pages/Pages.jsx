import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, Check, CheckCheck, Circle, Clock3, Filter, ListTodo, Plus, Search, Sparkles, Target, Trash2 } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TaskDialog from '../components/TaskDialog';

function dateKey(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function refresh() {
    setLoading(true);
    try {
      const { data } = await api.get('/tasks');
      setTasks(data.tasks);
      setError('');
    } catch (problem) {
      setError(getErrorMessage(problem));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
    window.addEventListener('daymark:tasks-changed', refresh);
    return () => window.removeEventListener('daymark:tasks-changed', refresh);
  }, []);
  return { tasks, loading, error, refresh, setTasks };
}

function TaskRow({ task, onRefresh, onEdit }) {
  const notify = useToast();
  async function toggleComplete() {
    const status = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.patch(`/tasks/${task._id}/status`, { status });
      notify(status === 'Completed' ? 'One more thing done.' : 'Task moved back to your list.');
      onRefresh();
    } catch (error) { notify(getErrorMessage(error), 'error'); }
  }
  async function remove() {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      notify('Task deleted.');
      onRefresh();
    } catch (error) { notify(getErrorMessage(error), 'error'); }
  }
  const overdue = task.dueDate && dateKey(task.dueDate) < dateKey(new Date()) && task.status !== 'Completed';
  return <article className={`task-row ${task.status === 'Completed' ? 'task-done' : ''}`}><button className={`task-check ${task.status === 'Completed' ? 'checked' : ''}`} onClick={toggleComplete} aria-label={task.status === 'Completed' ? 'Mark pending' : 'Mark completed'}>{task.status === 'Completed' && <Check size={14} />}</button><button className="task-main" onClick={() => onEdit(task)}><strong>{task.title}</strong>{task.description && <span>{task.description}</span>}</button><span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span><span className="category-tag">{task.category}</span><span className={`task-date ${overdue ? 'date-overdue' : ''}`}>{task.dueDate ? new Date(`${dateKey(task.dueDate)}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}</span><button className="icon-button delete-task" title="Delete task" onClick={remove} aria-label={`Delete ${task.title}`}><Trash2 size={16} /></button></article>;
}

function TaskList({ tasks, loading, error, refresh, onEdit, emptyTitle = 'A little breathing room', emptyCopy = 'Nothing here just yet. Add a task when you are ready.' }) {
  if (loading) return <div className="list-state"><span className="loader" />Loading your tasks</div>;
  if (error) return <div className="list-state error-state"><p>{error}</p><button className="button button-outline" onClick={refresh}>Try again</button></div>;
  if (!tasks.length) return <div className="empty-state"><span className="empty-icon"><CheckCheck size={22} /></span><h3>{emptyTitle}</h3><p>{emptyCopy}</p></div>;
  return <div className="task-list">{tasks.map((task) => <TaskRow key={task._id} task={task} onRefresh={refresh} onEdit={onEdit} />)}</div>;
}

function TaskTable({ tasks, loading, error, refresh, onEdit, emptyTitle, emptyCopy }) {
  return <div className="task-table"><div className="task-table-head"><span>TASK</span><span>PRIORITY</span><span>CATEGORY</span><span>DUE DATE</span><span /></div><TaskList tasks={tasks} loading={loading} error={error} refresh={refresh} onEdit={onEdit} emptyTitle={emptyTitle} emptyCopy={emptyCopy} /></div>;
}

export function DashboardPage() {
  const { tasks, loading, error, refresh } = useTasks();
  const { user } = useAuth();
  const { openTask } = useOutletContext();
  const [editing, setEditing] = useState(null);
  const todayKey = dateKey(new Date());
  const stats = useMemo(() => {
    const complete = tasks.filter((task) => task.status === 'Completed').length;
    const pending = tasks.filter((task) => task.status !== 'Completed').length;
    const overdue = tasks.filter((task) => task.status !== 'Completed' && task.dueDate && dateKey(task.dueDate) < todayKey).length;
    const today = tasks.filter((task) => task.dueDate && dateKey(task.dueDate) === todayKey).length;
    return { total: tasks.length, complete, pending, overdue, today, percent: tasks.length ? Math.round((complete / tasks.length) * 100) : 0 };
  }, [tasks, todayKey]);
  const todaysTasks = tasks.filter((task) => task.dueDate && dateKey(task.dueDate) === todayKey).slice(0, 4);
  const upcoming = tasks.filter((task) => task.status !== 'Completed' && task.dueDate && dateKey(task.dueDate) > todayKey).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 3);
  return <><section className="welcome-row"><div><span className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</span><h1>Good to see you, {user?.name?.split(' ')[0]}<span className="greeting-period">.</span></h1><p>A clear mind starts with a clear plan.</p></div><button className="button button-primary" onClick={openTask}><Plus size={17} />Add a task</button></section>
    <section className="stat-grid" aria-label="Task statistics"><article className="stat-card stat-card-primary"><div className="stat-top"><span>Total tasks</span><span className="stat-icon"><ListTodo size={17} /></span></div><strong>{loading ? '—' : stats.total}</strong><small>Across your workspace</small><span className="stat-decoration">{loading ? '' : stats.total.toString().padStart(2, '0')}</span></article><article className="stat-card"><div className="stat-top"><span>Completed</span><span className="stat-icon stat-green"><CheckCheck size={17} /></span></div><strong>{loading ? '—' : stats.complete}</strong><small><span className="text-green"><ArrowUpRight size={13} /> {stats.percent}%</span> completion rate</small><div className="tiny-progress"><span style={{ width: `${stats.percent}%` }} /></div></article><article className="stat-card"><div className="stat-top"><span>Still in motion</span><span className="stat-icon stat-blue"><Clock3 size={17} /></span></div><strong>{loading ? '—' : stats.pending}</strong><small>{stats.today} due today</small><div className="stat-bottom-dot"><span /><span /><span /></div></article><article className="stat-card"><div className="stat-top"><span>Overdue</span><span className="stat-icon stat-coral"><CalendarDays size={17} /></span></div><strong>{loading ? '—' : stats.overdue}</strong><small>{stats.overdue ? 'Worth a second look' : 'You are all caught up'}</small><span className="stat-corner"><ArrowDownRight size={25} /></span></article></section>
    <div className="dashboard-grid"><section className="content-panel today-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR FOCUS</span><h2>Today’s tasks <span className="count-bubble">{stats.today}</span></h2></div><Link to="/app/today" className="text-link">View all <ArrowRight size={15} /></Link></div><TaskList tasks={todaysTasks} loading={loading} error={error} refresh={refresh} onEdit={setEditing} emptyTitle="Your day is wide open" emptyCopy="Nothing scheduled for today. Make a little plan?" /></section><aside className="content-panel progress-panel"><span className="eyebrow">THE BIG PICTURE</span><h2>Your progress</h2><p>Every finished task is a promise kept to yourself.</p><div className="progress-ring" style={{ '--progress': `${stats.percent}%` }}><div><strong>{stats.percent}<small>%</small></strong><span>complete</span></div></div><div className="progress-caption"><span><i className="legend-dot done-dot" />Done</span><strong>{stats.complete} of {stats.total}</strong></div><div className="progress-bar"><span style={{ width: `${stats.percent}%` }} /></div></aside></div>
    <section className="content-panel upcoming-panel"><div className="panel-heading"><div><span className="eyebrow">COMING UP</span><h2>On the horizon</h2></div><Link to="/app/tasks" className="text-link">All tasks <ArrowRight size={15} /></Link></div>{upcoming.length ? <div className="upcoming-list">{upcoming.map((task) => <div className="upcoming-item" key={task._id}><span className="upcoming-date"><strong>{new Date(`${dateKey(task.dueDate)}T12:00:00`).getDate()}</strong><small>{new Date(`${dateKey(task.dueDate)}T12:00:00`).toLocaleDateString(undefined, { month: 'short' })}</small></span><span className="upcoming-copy"><strong>{task.title}</strong><small>{task.category} <span>·</span> {task.priority} priority</small></span><span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span></div>)}</div> : <div className="upcoming-empty"><Sparkles size={17} />No upcoming deadlines. Enjoy the breathing room.</div>}</section>
    {editing && <TaskDialog task={editing} onClose={() => setEditing(null)} onSaved={refresh} />}</>;
}

export function TasksPage({ mode = 'all' }) {
  const { tasks, loading, error, refresh } = useTasks();
  const { openTask } = useOutletContext();
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState('All priorities');
  const [category, setCategory] = useState('All categories');
  const [editing, setEditing] = useState(null);
  const todayKey = dateKey(new Date());
  const filtered = tasks.filter((task) => {
    const isToday = task.dueDate && dateKey(task.dueDate) === todayKey;
    const isUpcoming = task.status !== 'Completed' && task.dueDate && dateKey(task.dueDate) > todayKey;
    const isOverdue = task.status !== 'Completed' && task.dueDate && dateKey(task.dueDate) < todayKey;
    if (mode === 'completed' && task.status !== 'Completed') return false;
    if (mode === 'pending' && task.status !== 'Pending') return false;
    if (mode === 'today' && !isToday) return false;
    if (mode === 'upcoming' && !isUpcoming) return false;
    if (mode === 'overdue' && !isOverdue) return false;
    return task.title.toLowerCase().includes(query.toLowerCase()) && (priority === 'All priorities' || task.priority === priority) && (category === 'All categories' || task.category === category);
  }).sort((a, b) => new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31'));
  const views = {
    all: ['All tasks', 'Keep all the moving pieces in view.'],
    today: ['Today’s tasks', 'Everything you have planned for today, in one place.'],
    pending: ['Pending tasks', 'A focused view of what still needs your attention.'],
    upcoming: ['Upcoming tasks', 'See what is waiting just around the corner.'],
    overdue: ['Overdue tasks', 'Review anything that needs a new plan.'],
    completed: ['Completed tasks', 'A record of the things you have seen through.'],
  };
  const [heading, description] = views[mode] || views.all;
  return <><section className="page-heading-row"><div><span className="eyebrow">YOUR WORKSPACE</span><h1>{heading}</h1><p>{description}</p></div><button className="button button-primary" onClick={openTask}><Plus size={17} />New task</button></section><section className="content-panel tasks-panel"><div className="task-toolbar"><label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks..." /></label><div className="filter-control"><Filter size={15} /><select aria-label="Filter by priority" value={priority} onChange={(event) => setPriority(event.target.value)}><option>All priorities</option>{['High', 'Medium', 'Low'].map((item) => <option key={item}>{item}</option>)}</select></div><select className="category-filter" aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}><option>All categories</option>{['Personal', 'Work', 'Health', 'Learning', 'Other'].map((item) => <option key={item}>{item}</option>)}</select><span className="result-count">{filtered.length} {filtered.length === 1 ? 'task' : 'tasks'}</span></div><TaskTable tasks={filtered} loading={loading} error={error} refresh={refresh} onEdit={setEditing} emptyTitle={query || priority !== 'All priorities' || category !== 'All categories' ? 'No matching tasks' : 'Nothing on this list'} emptyCopy={query || priority !== 'All priorities' || category !== 'All categories' ? 'Try adjusting your search or filters.' : 'Add a task to give your day a little direction.'} /></section>{editing && <TaskDialog task={editing} onClose={() => setEditing(null)} onSaved={refresh} />}</>;
}

export function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const notify = useToast();
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try { await updateProfile(name); notify('Profile updated.'); }
    catch (error) { notify(getErrorMessage(error), 'error'); }
    finally { setSaving(false); }
  }
  function signOut() { logout(); navigate('/'); }
  return <><section className="page-heading-row"><div><span className="eyebrow">A SPACE OF YOUR OWN</span><h1>Your settings</h1><p>Keep your account details up to date.</p></div></section><div className="settings-layout"><section className="content-panel settings-panel"><div className="settings-title"><span className="settings-avatar">{user?.name?.slice(0, 1).toUpperCase()}</span><div><h2>Personal details</h2><p>Your information is private to your account.</p></div></div><form onSubmit={submit} className="profile-form"><label className="field-label">Full name<input value={name} onChange={(event) => setName(event.target.value)} required minLength="2" maxLength="60" /></label><label className="field-label">Email address<input value={user?.email || ''} disabled /><small>Email address cannot currently be changed.</small></label><button className="button button-primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button></form></section><section className="content-panel danger-panel"><span className="eyebrow">ACCOUNT</span><h2>Ready to wrap up?</h2><p>Signing out keeps your tasks safe and ready for next time.</p><button className="button button-outline" onClick={signOut}>Sign out</button></section></div></>;
}

export function LandingPage() {
  const { user } = useAuth();
  return <div className="landing-page"><header className="landing-nav"><Link to="/" className="brand-lockup"><span className="brand-mark">d</span><span>daymark<span className="brand-period">.</span></span></Link><nav><Link to="/login">Sign in</Link><Link to="/register" className="button button-primary">Start your day <ArrowRight size={16} /></Link></nav></header><main className="landing-hero"><div className="hero-copy"><span className="hero-kicker"><span /> A calmer way to get things done</span><h1>Make room for<br /><em>what matters.</em></h1><p>A little more clarity. A little less noise. Daymark helps you gather your thoughts and turn them into a day that feels like yours.</p><div className="hero-actions"><Link className="button button-primary" to={user ? '/app' : '/register'}>Find your focus <ArrowRight size={17} /></Link><span className="hero-footnote"><Target size={15} /> Free to get started</span></div><div className="hero-proof"><div className="proof-avatars"><span>M</span><span>A</span><span>J</span><span>+</span></div><span>For the days that matter.<br /><strong>And the little things in between.</strong></span></div></div><div className="hero-art" aria-label="A calm, organized task list illustration"><div className="sun-disc" /><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="floating-label label-top"><span className="label-check"><Check size={14} /></span><span><strong>Make progress</strong><small>at your own pace</small></span></div><div className="hero-task-card"><div className="hero-card-top"><span>THURSDAY, OCT 24</span><span className="hero-weather">✳</span></div><h3>A day, well spent.</h3><p>Three things to move forward.</p><div className="mini-task"><span className="mini-check mini-checked"><Check size={12} /></span><span className="mini-line line-done">Send the proposal</span><span className="mini-time">9:30</span></div><div className="mini-task"><span className="mini-check" /><span className="mini-line">A walk before lunch</span><span className="mini-time">12:15</span></div><div className="mini-task"><span className="mini-check" /><span className="mini-line">Call home</span><span className="mini-time">6:00</span></div><div className="hero-card-footer"><span><span className="mini-progress"><i /></span> 1 of 3</span><span>Keep going <ArrowRight size={13} /></span></div></div><div className="floating-label label-bottom"><span className="label-sparkle"><Sparkles size={16} /></span><span><strong>Small steps count</strong><small>especially the quiet ones</small></span></div><div className="art-scribble">a good day<br />starts here</div></div><div className="hero-scroll">SCROLL A LITTLE <span /></div></main><footer className="landing-footer"><span>DAYMARK STUDIO © 2025</span><span>Made for clearer days.</span></footer></div>;
}

export function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { login, register, user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => { if (user) navigate('/app', { replace: true }); }, [user, navigate]);
  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try { await (isRegister ? register(form) : login({ email: form.email, password: form.password })); navigate('/app', { replace: true }); }
    catch (problem) { setError(getErrorMessage(problem)); }
    finally { setSubmitting(false); }
  }
  return <main className="auth-page"><Link to="/" className="brand-lockup auth-brand"><span className="brand-mark">d</span><span>daymark<span className="brand-period">.</span></span></Link><div className="auth-layout"><section className="auth-aside"><span className="eyebrow">A CLEARER KIND OF PRODUCTIVITY</span><h1>Progress, with<br /><em>room to breathe.</em></h1><p>Give the important things a place to land. Then take them one at a time.</p><div className="auth-quote">“It’s easier to do your best work when you know what matters most.”<span>THE DAYMARK WAY</span></div><div className="auth-decoration"><div /><span /></div></section><section className="auth-form-wrap"><div className="auth-form-heading"><span className="eyebrow">{isRegister ? 'YOUR NEXT CHAPTER' : 'WELCOME BACK'}</span><h2>{isRegister ? 'Create your account' : 'Sign in to Daymark'}</h2><p>{isRegister ? 'A more thoughtful day starts here.' : 'Pick up right where you left off.'}</p></div><form onSubmit={submit} className="auth-form">{isRegister && <label className="field-label">Your name<input autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Alex Morgan" required minLength="2" maxLength="60" /></label>}<label className="field-label">Email address<input autoComplete="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" required /></label><label className="field-label">Password<input autoComplete={isRegister ? 'new-password' : 'current-password'} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={isRegister ? 'At least 8 characters' : 'Your password'} minLength="8" required /></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="button button-primary auth-submit" disabled={submitting}>{submitting ? 'One moment...' : isRegister ? 'Create account' : 'Sign in'}<ArrowRight size={16} /></button></form><div className="auth-switch">{isRegister ? 'Already have a space here?' : 'New to Daymark?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></div><div className="auth-privacy"><span /> Your data stays yours. Always.</div></section></div></main>;
}
