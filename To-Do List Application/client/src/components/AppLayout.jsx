import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AlarmClock, CalendarDays, CheckCircle2, ChevronDown, CircleDashed, LayoutDashboard, ListTodo, LogOut, Menu, Moon, Plus, Settings2, Sun, TriangleAlert, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TaskDialog from './TaskDialog';

const links = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/tasks', label: 'All tasks', icon: ListTodo },
  { to: '/app/today', label: 'Today', icon: AlarmClock },
  { to: '/app/pending', label: 'Pending', icon: CircleDashed },
  { to: '/app/upcoming', label: 'Upcoming', icon: CalendarDays },
  { to: '/app/overdue', label: 'Overdue', icon: TriangleAlert },
  { to: '/app/completed', label: 'Completed', icon: CheckCircle2 },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('daymark-theme') === 'dark');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem('daymark-theme', next ? 'dark' : 'light');
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
  }

  function signOut() {
    logout();
    navigate('/');
  }

  const title = location.pathname.endsWith('/today') ? 'Today' : location.pathname.endsWith('/pending') ? 'Pending tasks' : location.pathname.endsWith('/upcoming') ? 'Upcoming tasks' : location.pathname.endsWith('/overdue') ? 'Overdue tasks' : location.pathname.endsWith('/completed') ? 'Completed tasks' : location.pathname.endsWith('/tasks') ? 'All tasks' : location.pathname.endsWith('/profile') ? 'Your settings' : 'Overview';

  return <div className="app-shell">
    {drawerOpen && <button className="drawer-scrim" aria-label="Close navigation" onClick={() => setDrawerOpen(false)} />}
    <aside className={`sidebar ${drawerOpen ? 'sidebar-open' : ''}`}>
      <div className="brand-lockup"><span className="brand-mark">d</span><span>daymark<span className="brand-period">.</span></span><button className="icon-button sidebar-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu"><X size={18} /></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="primary-nav" aria-label="Main navigation">{links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setDrawerOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === 'Today' && <span className="nav-dot" />}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="focus-note"><span className="focus-note-icon"><Settings2 size={16} /></span><span><strong>Make it count</strong><small>One task at a time.</small></span></div><NavLink to="/app/profile" className="account-link" onClick={() => setDrawerOpen(false)}><span className="avatar">{user?.name?.slice(0, 1).toUpperCase()}</span><span className="account-name"><strong>{user?.name}</strong><small>Personal space</small></span><ChevronDown size={16} /></NavLink><button className="logout-link" onClick={signOut}><LogOut size={16} />Sign out</button></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="icon-button menu-button" onClick={() => setDrawerOpen(true)} aria-label="Open menu"><Menu size={20} /></button><div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{title}</strong></div><div className="topbar-actions"><button className="icon-button theme-toggle" onClick={toggleTheme} title={`Switch to ${dark ? 'light' : 'dark'} theme`} aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button><button className="button button-primary topbar-add" onClick={() => setTaskOpen(true)}><Plus size={17} />New task</button><button className="avatar topbar-avatar" onClick={() => navigate('/app/profile')} aria-label="Open profile">{user?.name?.slice(0, 1).toUpperCase()}</button></div></header>
      <div className="page-content"><Outlet context={{ openTask: () => setTaskOpen(true) }} /></div>
    </main>
    {taskOpen && <TaskDialog onClose={() => setTaskOpen(false)} />}
  </div>;
}
