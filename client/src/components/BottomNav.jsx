import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Trophy, Users, User } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const noNav = ['/login', '/register', '/'];
  if (noNav.includes(path)) return null;
  if (path.includes('/create-team') || path.includes('/select-captain')) return null;

  const items = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Trophy, label: 'My Contests', path: '/my-contests' },
    { icon: Users, label: 'My Teams', path: '/my-teams' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <button
          key={item.path}
          className={`nav-item ${path === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
