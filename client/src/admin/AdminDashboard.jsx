import { useState, useEffect } from 'react';
import { api } from '../api';
import { Users, Trophy, CalendarDays, Swords, TrendingUp, DollarSign, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminGetStats().then(s => { setStats(s); setLoading(false); });
  }, []);

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  const cards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: '#e63946' },
    { icon: Swords, label: 'Total Teams', value: stats.totalTeams, color: '#2ec4b6' },
    { icon: CalendarDays, label: 'Total Matches', value: stats.totalMatches, color: '#ff9f1c' },
    { icon: Trophy, label: 'Total Contests', value: stats.totalContests, color: '#7209b7' },
    { icon: TrendingUp, label: 'Contests Joined', value: stats.totalJoined, color: '#06d6a0' },
    { icon: DollarSign, label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, color: '#f72585' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-stats-grid">
        {cards.map((c, i) => (
          <div key={i} className="admin-stat-card" style={{ '--ac': c.color }}>
            <div className="admin-stat-icon" style={{ background: c.color + '20', color: c.color }}><c.icon size={22} /></div>
            <div className="admin-stat-info">
              <span className="admin-stat-value">{c.value}</span>
              <span className="admin-stat-label">{c.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-section">
        <h3><Clock size={18} /> Recent Users</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Balance</th><th>Joined</th></tr></thead>
            <tbody>
              {stats.recentUsers.map(u => (
                <tr key={u.id}>
                  <td><div className="admin-user-cell"><span className="admin-avatar-sm">{u.avatar}</span>{u.name}</div></td>
                  <td>{u.email}</td>
                  <td className="admin-money">₹{u.balance}</td>
                  <td>{u.joined ? new Date(u.joined).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
              {stats.recentUsers.length === 0 && <tr><td colSpan={4} className="admin-empty">No users yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-section">
        <h3><Trophy size={18} /> Quick Actions</h3>
        <div className="admin-quick-actions">
          <a href="#/admin/matches" className="admin-qa-btn" style={{ background: 'linear-gradient(135deg, #e63946, #d62839)' }}>
            <CalendarDays size={22} /> Add Match
          </a>
          <a href="#/admin/players" className="admin-qa-btn" style={{ background: 'linear-gradient(135deg, #2ec4b6, #1a9e94)' }}>
            <Swords size={22} /> Add Player
          </a>
          <a href="#/admin/contests" className="admin-qa-btn" style={{ background: 'linear-gradient(135deg, #7209b7, #560bad)' }}>
            <Trophy size={22} /> Add Contest
          </a>
          <a href="#/admin/users" className="admin-qa-btn" style={{ background: 'linear-gradient(135deg, #ff9f1c, #e68a00)' }}>
            <Users size={22} /> View Users
          </a>
        </div>
      </div>
    </div>
  );
}
