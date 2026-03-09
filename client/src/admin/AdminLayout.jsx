import { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { api } from '../api';
import { LayoutDashboard, CalendarDays, Users, Trophy, UserCircle, LogOut, Menu, X, Swords, ChevronRight } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import AdminMatches from './AdminMatches';
import AdminPlayers from './AdminPlayers';
import AdminContests from './AdminContests';
import AdminUsers from './AdminUsers';
import AdminTeams from './AdminTeams';

const AdminCtx = createContext(null);
export const useAdmin = () => useContext(AdminCtx);

const NAV_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/admin/matches', icon: CalendarDays, label: 'Matches' },
  { path: '/admin/players', icon: Swords, label: 'Players' },
  { path: '/admin/contests', icon: Trophy, label: 'Contests' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/teams', icon: UserCircle, label: 'Teams' },
];

function ShieldIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}

export default function AdminLayout() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    api.adminMe().then(res => {
      if (res.error) navigate('/admin/login');
      else setAdmin(res);
    }).finally(() => setLoading(false));
  }, []);

  const logout = () => {
    api.adminLogout();
    navigate('/admin/login');
  };

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;
  if (!admin) return <Navigate to="/admin/login" />;

  return (
    <AdminCtx.Provider value={{ admin }}>
      <div className="admin-layout">
        <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="admin-sidebar-header">
            <div className="admin-brand">
              <ShieldIcon size={28} />
              <div>
                <h2>BLF Admin</h2>
                <span>Control Panel</span>
              </div>
            </div>
            <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)}><X size={22} /></button>
          </div>
          <nav className="admin-nav">
            {NAV_ITEMS.map(item => (
              <NavLink key={item.path} to={item.path} end={item.end}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                <item.icon size={20} />
                <span>{item.label}</span>
                <ChevronRight size={16} className="admin-nav-arrow" />
              </NavLink>
            ))}
          </nav>
          <div className="admin-sidebar-footer">
            <div className="admin-user-info">
              <div className="admin-user-avatar">A</div>
              <div>
                <div className="admin-user-name">Admin</div>
                <div className="admin-user-email">{admin.email}</div>
              </div>
            </div>
            <button className="admin-logout-btn" onClick={logout}><LogOut size={18} /> Logout</button>
          </div>
        </div>

        {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="admin-main">
          <div className="admin-topbar">
            <button className="admin-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
            <h1 className="admin-topbar-title">{NAV_ITEMS.find(i => location.pathname === i.path || (!i.end && location.pathname.startsWith(i.path)))?.label || 'Admin'}</h1>
            <button className="admin-topbar-logout" onClick={logout}><LogOut size={20} /></button>
          </div>
          <div className="admin-content">
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="matches" element={<AdminMatches />} />
              <Route path="players" element={<AdminPlayers />} />
              <Route path="contests" element={<AdminContests />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="teams" element={<AdminTeams />} />
            </Routes>
          </div>
        </div>

        <nav className="admin-bottom-nav">
          {NAV_ITEMS.slice(0, 5).map(item => (
            <NavLink key={item.path} to={item.path} end={item.end}
              className={({ isActive }) => `admin-bnav-item ${isActive ? 'active' : ''}`}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </AdminCtx.Provider>
  );
}
