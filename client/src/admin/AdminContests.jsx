import { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, Edit3, Trash2, X, Save, Search } from 'lucide-react';

const TYPES = ['mega', 'h2h', 'small', 'winner', 'practice'];
const EMPTY = { matchId: '', name: '', entryFee: 0, totalSpots: 100, prizePool: 0, firstPrize: 0, type: 'mega' };

export default function AdminContests() {
  const [contests, setContests] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState('');
  const [filterMatch, setFilterMatch] = useState('');

  const load = () => {
    Promise.all([api.adminGetAllContests(), api.adminGetAllMatches()]).then(([c, m]) => {
      setContests(c); setMatches(m); setLoading(false);
    });
  };
  useEffect(load, []);

  const openAdd = () => { setForm({ ...EMPTY, matchId: matches[0]?.id || '' }); setEditing(null); setShowForm(true); };
  const openEdit = (c) => { setForm({ ...c }); setEditing(c.id); setShowForm(true); };

  const handleSave = async () => {
    if (editing) await api.adminUpdateContest(editing, form);
    else await api.adminAddContest(form);
    setShowForm(false); load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contest?')) return;
    await api.adminDeleteContest(id); load();
  };

  const filtered = contests.filter(c =>
    (!search || c.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filterMatch || c.matchId === filterMatch)
  );

  const typeColor = { mega: '#e63946', h2h: '#2ec4b6', small: '#7209b7', winner: '#ff9f1c', practice: '#6c757d' };

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-search-wrap">
          <Search size={18} />
          <input placeholder="Search contests..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="admin-add-btn" onClick={openAdd}><Plus size={18} /> Add Contest</button>
      </div>

      <div className="admin-filters">
        <select value={filterMatch} onChange={e => setFilterMatch(e.target.value)}>
          <option value="">All Matches</option>
          {matches.map(m => <option key={m.id} value={m.id}>{m.team1} vs {m.team2}</option>)}
        </select>
        <span className="admin-count">{filtered.length} contests</span>
      </div>

      <div className="admin-cards-list">
        {filtered.map(c => (
          <div key={c.id} className="admin-contest-card">
            <div className="admin-cc-top">
              <span className="admin-type-badge" style={{ background: (typeColor[c.type] || '#666') + '25', color: typeColor[c.type] || '#666' }}>{c.type}</span>
              <span className="admin-cc-match">{c.matchLabel}</span>
            </div>
            <div className="admin-cc-name">{c.name}</div>
            <div className="admin-cc-details">
              <div><span className="admin-cc-label">Entry</span><strong>₹{c.entryFee}</strong></div>
              <div><span className="admin-cc-label">Prize</span><strong>₹{(c.prizePool || 0).toLocaleString()}</strong></div>
              <div><span className="admin-cc-label">Spots</span><strong>{c.filledSpots || 0}/{c.totalSpots}</strong></div>
              <div><span className="admin-cc-label">1st Prize</span><strong>₹{(c.firstPrize || 0).toLocaleString()}</strong></div>
            </div>
            <div className="admin-mc-actions">
              <button className="admin-icon-btn edit" onClick={() => openEdit(c)}><Edit3 size={16} /> Edit</button>
              <button className="admin-icon-btn delete" onClick={() => handleDelete(c.id)}><Trash2 size={16} /> Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="admin-empty-state">No contests found</div>}
      </div>

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editing ? 'Edit Contest' : 'Add Contest'}</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-grid">
                <div className="admin-field full">
                  <label>Match</label>
                  <select value={form.matchId} onChange={e => setForm({ ...form, matchId: e.target.value })}>
                    <option value="">Select Match</option>
                    {matches.map(m => <option key={m.id} value={m.id}>{m.team1} vs {m.team2} - {m.format}</option>)}
                  </select>
                </div>
                <div className="admin-field full">
                  <label>Contest Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Mega Contest" />
                </div>
                <div className="admin-field">
                  <label>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="admin-field">
                  <label>Entry Fee (₹)</label>
                  <input type="number" value={form.entryFee} onChange={e => setForm({ ...form, entryFee: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label>Total Spots</label>
                  <input type="number" value={form.totalSpots} onChange={e => setForm({ ...form, totalSpots: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label>Prize Pool (₹)</label>
                  <input type="number" value={form.prizePool} onChange={e => setForm({ ...form, prizePool: e.target.value })} />
                </div>
                <div className="admin-field full">
                  <label>1st Prize (₹)</label>
                  <input type="number" value={form.firstPrize} onChange={e => setForm({ ...form, firstPrize: e.target.value })} />
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
