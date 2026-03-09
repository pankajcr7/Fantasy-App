import { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, Edit3, Trash2, X, Save, Search } from 'lucide-react';

const EMPTY_MATCH = { team1: '', team2: '', team1Full: '', team2Full: '', team1Flag: '', team2Flag: '', format: 'T20I', venue: '', date: '', status: 'upcoming', lineupAnnounced: false, team1Players: [], team2Players: [] };

export default function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_MATCH);
  const [search, setSearch] = useState('');
  const [playerSearch, setPlayerSearch] = useState('');

  const load = () => {
    Promise.all([api.adminGetAllMatches(), api.adminGetAllPlayers()]).then(([m, p]) => {
      setMatches(m); setPlayers(p); setLoading(false);
    });
  };
  useEffect(load, []);

  const openAdd = () => { setForm(EMPTY_MATCH); setEditing(null); setShowForm(true); };
  const openEdit = (m) => {
    setForm({ ...m, date: m.date ? m.date.slice(0, 16) : '' });
    setEditing(m.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    const data = { ...form };
    if (data.date && !data.date.includes('Z')) data.date = new Date(data.date).toISOString();
    if (editing) {
      await api.adminUpdateMatch(editing, data);
    } else {
      await api.adminAddMatch(data);
    }
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this match and all its contests?')) return;
    await api.adminDeleteMatch(id);
    load();
  };

  const togglePlayer = (playerId, teamKey) => {
    setForm(prev => {
      const list = [...(prev[teamKey] || [])];
      const idx = list.indexOf(playerId);
      if (idx >= 0) list.splice(idx, 1); else list.push(playerId);
      return { ...prev, [teamKey]: list };
    });
  };

  const filteredPlayers = (teamKey) => {
    const teamCode = teamKey === 'team1Players' ? form.team1 : form.team2;
    return players.filter(p =>
      (!teamCode || p.team === teamCode) &&
      (!playerSearch || p.name.toLowerCase().includes(playerSearch.toLowerCase()))
    );
  };

  const filtered = matches.filter(m =>
    !search || `${m.team1} ${m.team2} ${m.team1Full} ${m.team2Full} ${m.venue}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-search-wrap">
          <Search size={18} />
          <input placeholder="Search matches..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="admin-add-btn" onClick={openAdd}><Plus size={18} /> Add Match</button>
      </div>

      <div className="admin-cards-list">
        {filtered.map(m => (
          <div key={m.id} className="admin-match-card">
            <div className="admin-mc-top">
              <span className={`admin-status-badge ${m.status}`}>{m.status}</span>
              <span className="admin-format-badge">{m.format}</span>
            </div>
            <div className="admin-mc-teams">
              <span className="admin-mc-flag">{m.team1Flag}</span>
              <strong>{m.team1Full || m.team1}</strong>
              <span className="admin-mc-vs">vs</span>
              <strong>{m.team2Full || m.team2}</strong>
              <span className="admin-mc-flag">{m.team2Flag}</span>
            </div>
            <div className="admin-mc-info">
              <span>{m.venue}</span>
              <span>{m.date ? new Date(m.date).toLocaleString() : 'TBD'}</span>
            </div>
            <div className="admin-mc-players">
              <span>T1: {(m.team1Players || []).length} players</span>
              <span>T2: {(m.team2Players || []).length} players</span>
            </div>
            <div className="admin-mc-actions">
              <button className="admin-icon-btn edit" onClick={() => openEdit(m)}><Edit3 size={16} /> Edit</button>
              <button className="admin-icon-btn delete" onClick={() => handleDelete(m.id)}><Trash2 size={16} /> Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="admin-empty-state">No matches found</div>}
      </div>

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editing ? 'Edit Match' : 'Add Match'}</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-grid">
                <div className="admin-field">
                  <label>Team 1 Code</label>
                  <input value={form.team1} onChange={e => setForm({ ...form, team1: e.target.value.toUpperCase() })} placeholder="IND" />
                </div>
                <div className="admin-field">
                  <label>Team 2 Code</label>
                  <input value={form.team2} onChange={e => setForm({ ...form, team2: e.target.value.toUpperCase() })} placeholder="AUS" />
                </div>
                <div className="admin-field">
                  <label>Team 1 Full Name</label>
                  <input value={form.team1Full} onChange={e => setForm({ ...form, team1Full: e.target.value })} placeholder="India" />
                </div>
                <div className="admin-field">
                  <label>Team 2 Full Name</label>
                  <input value={form.team2Full} onChange={e => setForm({ ...form, team2Full: e.target.value })} placeholder="Australia" />
                </div>
                <div className="admin-field">
                  <label>Team 1 Flag</label>
                  <input value={form.team1Flag} onChange={e => setForm({ ...form, team1Flag: e.target.value })} placeholder="🇮🇳" />
                </div>
                <div className="admin-field">
                  <label>Team 2 Flag</label>
                  <input value={form.team2Flag} onChange={e => setForm({ ...form, team2Flag: e.target.value })} placeholder="🇦🇺" />
                </div>
                <div className="admin-field">
                  <label>Format</label>
                  <select value={form.format} onChange={e => setForm({ ...form, format: e.target.value })}>
                    <option value="T20I">T20I</option><option value="ODI">ODI</option><option value="Test">Test</option><option value="T20">T20</option><option value="IPL">IPL</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="upcoming">Upcoming</option><option value="live">Live</option><option value="completed">Completed</option>
                  </select>
                </div>
                <div className="admin-field full">
                  <label>Venue</label>
                  <input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Wankhede Stadium, Mumbai" />
                </div>
                <div className="admin-field">
                  <label>Date & Time</label>
                  <input type="datetime-local" value={form.date ? form.date.slice(0, 16) : ''} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label>Lineup Announced</label>
                  <select value={form.lineupAnnounced ? 'true' : 'false'} onChange={e => setForm({ ...form, lineupAnnounced: e.target.value === 'true' })}>
                    <option value="true">Yes</option><option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="admin-player-picker">
                <h4>Select Players</h4>
                <input placeholder="Search players..." value={playerSearch} onChange={e => setPlayerSearch(e.target.value)} className="admin-player-search" />
                {['team1Players', 'team2Players'].map(teamKey => (
                  <div key={teamKey} className="admin-player-group">
                    <h5>{teamKey === 'team1Players' ? `Team 1 (${form.team1 || '?'})` : `Team 2 (${form.team2 || '?'})`} — {(form[teamKey] || []).length} selected</h5>
                    <div className="admin-player-chips">
                      {filteredPlayers(teamKey).map(p => (
                        <button key={p.id}
                          className={`admin-player-chip ${(form[teamKey] || []).includes(p.id) ? 'selected' : ''}`}
                          onClick={() => togglePlayer(p.id, teamKey)}>
                          {p.name} <span className="admin-player-role">{p.role}</span>
                        </button>
                      ))}
                      {filteredPlayers(teamKey).length === 0 && <span className="admin-no-players">No players for team code "{teamKey === 'team1Players' ? form.team1 : form.team2}"</span>}
                    </div>
                  </div>
                ))}
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
