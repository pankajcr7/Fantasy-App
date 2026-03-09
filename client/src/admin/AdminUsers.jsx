import { useState, useEffect } from 'react';
import { api } from '../api';
import { Trash2, Search, DollarSign, X, Save } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [newBalance, setNewBalance] = useState(0);

  const load = () => { api.adminGetUsers().then(u => { setUsers(u); setLoading(false); }); };
  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user and all their data?')) return;
    await api.adminDeleteUser(id); load();
  };

  const handleUpdateBalance = async () => {
    if (!editUser) return;
    await api.adminUpdateUserBalance(editUser.id, Number(newBalance));
    setEditUser(null); load();
  };

  const filtered = users.filter(u =>
    !search || `${u.name} ${u.email} ${u.mobile}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-search-wrap">
          <Search size={18} />
          <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="admin-count-badge">{filtered.length} users</span>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>User</th><th>Email</th><th>Balance</th><th>Teams</th><th>Contests</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="admin-user-cell">
                    <span className="admin-avatar-sm">{u.avatar}</span>
                    <div>
                      <div className="admin-cell-name">{u.name}</div>
                      <div className="admin-cell-mobile">{u.mobile || '-'}</div>
                    </div>
                  </div>
                </td>
                <td>{u.email}</td>
                <td className="admin-money">₹{u.balance}</td>
                <td>{u.teamsCount}</td>
                <td>{u.contestsJoined}</td>
                <td>{u.joined ? new Date(u.joined).toLocaleDateString() : '-'}</td>
                <td>
                  <div className="admin-td-actions">
                    <button className="admin-icon-btn edit" title="Edit Balance" onClick={() => { setEditUser(u); setNewBalance(u.balance); }}><DollarSign size={14} /></button>
                    <button className="admin-icon-btn delete" title="Delete" onClick={() => handleDelete(u.id)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="admin-empty">No users found</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="admin-cards-list mobile-only">
        {filtered.map(u => (
          <div key={u.id} className="admin-user-card-m">
            <div className="admin-ucm-top">
              <span className="admin-avatar-sm">{u.avatar}</span>
              <div>
                <strong>{u.name}</strong>
                <span className="admin-ucm-email">{u.email}</span>
              </div>
            </div>
            <div className="admin-ucm-stats">
              <div><span>Balance</span><strong className="admin-money">₹{u.balance}</strong></div>
              <div><span>Teams</span><strong>{u.teamsCount}</strong></div>
              <div><span>Contests</span><strong>{u.contestsJoined}</strong></div>
            </div>
            <div className="admin-mc-actions">
              <button className="admin-icon-btn edit" onClick={() => { setEditUser(u); setNewBalance(u.balance); }}><DollarSign size={16} /> Balance</button>
              <button className="admin-icon-btn delete" onClick={() => handleDelete(u.id)}><Trash2 size={16} /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editUser && (
        <div className="admin-modal-overlay" onClick={() => setEditUser(null)}>
          <div className="admin-modal admin-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Update Balance</h3>
              <button onClick={() => setEditUser(null)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <p className="admin-balance-info">User: <strong>{editUser.name}</strong></p>
              <p className="admin-balance-info">Current: <strong>₹{editUser.balance}</strong></p>
              <div className="admin-field">
                <label>New Balance (₹)</label>
                <input type="number" value={newBalance} onChange={e => setNewBalance(e.target.value)} />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-cancel-btn" onClick={() => setEditUser(null)}>Cancel</button>
              <button className="admin-save-btn" onClick={handleUpdateBalance}><Save size={16} /> Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
