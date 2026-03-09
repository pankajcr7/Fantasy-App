import { useState, useEffect } from 'react';
import { api } from '../api';
import { Search } from 'lucide-react';

export default function AdminTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { api.adminGetAllTeams().then(t => { setTeams(t); setLoading(false); }); }, []);

  const filtered = teams.filter(t =>
    !search || `${t.userName} ${t.name} ${t.matchLabel}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-search-wrap">
          <Search size={18} />
          <input placeholder="Search teams..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="admin-count-badge">{filtered.length} teams</span>
      </div>

      <div className="admin-cards-list">
        {filtered.map(t => (
          <div key={t.id} className="admin-team-card">
            <div className="admin-tc-header">
              <strong>{t.name}</strong>
              <span className="admin-tc-match">{t.matchLabel}</span>
            </div>
            <div className="admin-tc-info">
              <div><span>Owner</span><strong>{t.userName}</strong></div>
              <div><span>Players</span><strong>{t.players?.length || 0}</strong></div>
              <div><span>Points</span><strong>{t.points}</strong></div>
              <div><span>Created</span><strong>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '-'}</strong></div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="admin-empty-state">No teams created yet</div>}
      </div>
    </div>
  );
}
