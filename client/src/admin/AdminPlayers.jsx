import { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, Edit3, Trash2, X, Save, Search } from 'lucide-react';

const ROLES = ['WK', 'BAT', 'AR', 'BOWL'];
const TEAMS = ['IND', 'AUS', 'ENG', 'SA', 'NZ', 'PAK', 'WI', 'SL', 'BAN', 'AFG', 'ZIM', 'IRE'];
const EMPTY_PLAYER = { name: '', team: 'IND', role: 'BAT', credits: 8, image: '', stats: { avg: 0, sr: 0, matches: 0 } };

export default function AdminPlayers() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PLAYER);
  const [search, setSearch] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const load = () => { api.adminGetAllPlayers().then(p => { setPlayers(p); setLoading(false); }); };
  useEffect(load, []);

  const openAdd = () => { setForm(EMPTY_PLAYER); setEditing(null); setShowForm(true); };
  const openEdit = (p) => { setForm({ ...p }); setEditing(p.id); setShowForm(true); };

  const handleSave = async () => {
    if (editing) await api.adminUpdatePlayer(editing, form);
    else await api.adminAddPlayer(form);
    setShowForm(false); load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this player?')) return;
    await api.adminDeletePlayer(id); load();
  };

  const filtered = players.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filterTeam || p.team === filterTeam) &&
    (!filterRole || p.role === filterRole)
  );

  const roleColor = { WK: '#ff9f1c', BAT: '#e63946', AR: '#7209b7', BOWL: '#2ec4b6' };

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-search-wrap">
          <Search size={18} />
          <input placeholder="Search players..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="admin-add-btn" onClick={openAdd}><Plus size={18} /> Add Player</button>
      </div>

      <div className="admin-filters">
        <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)}>
          <option value="">All Teams</option>
          {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <span className="admin-count">{filtered.length} players</span>
      </div>

      <div className="admin-cards-list">
        {filtered.map(p => (
          <div key={p.id} className="admin-player-card">
            <div className="admin-pc-left">
              {p.image ? <img src={p.image} alt={p.name} className="admin-pc-img" /> : <div className="admin-pc-avatar">{p.name[0]}</div>}
              <div>
                <strong>{p.name}</strong>
                <div className="admin-pc-meta">
                  <span className="admin-role-tag" style={{ background: roleColor[p.role] + '25', color: roleColor[p.role] }}>{p.role}</span>
                  <span>{p.team}</span>
                  <span>{p.credits} cr</span>
                </div>
              </div>
            </div>
            <div className="admin-mc-actions">
              <button className="admin-icon-btn edit" onClick={() => openEdit(p)}><Edit3 size={16} /></button>
              <button className="admin-icon-btn delete" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="admin-empty-state">No players found</div>}
      </div>

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editing ? 'Edit Player' : 'Add Player'}</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-grid">
                <div className="admin-field full">
                  <label>Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Player name" />
                </div>
                <div className="admin-field">
                  <label>Team</label>
                  <select value={form.team} onChange={e => setForm({ ...form, team: e.target.value })}>
                    {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="admin-field">
                  <label>Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="admin-field">
                  <label>Credits</label>
                  <input type="number" step="0.5" min="1" max="12" value={form.credits} onChange={e => setForm({ ...form, credits: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="admin-field">
                  <label>Matches</label>
                  <input type="number" value={form.stats?.matches || 0} onChange={e => setForm({ ...form, stats: { ...form.stats, matches: parseInt(e.target.value) || 0 } })} />
                </div>
                <div className="admin-field full">
                  <label>Image URL</label>
                  <input value={form.image || ''} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="admin-save-btn" onClick={handleSave}><Save size={16} /> {editing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
