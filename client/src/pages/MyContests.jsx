import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Header from '../components/Header';
import { Trophy, ChevronRight, Clock, Award } from 'lucide-react';

export default function MyContests() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    api.getMyContests().then(setEntries).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? entries : entries.filter(e => e.match?.status === filter);

  return (
    <div className="page page-with-header">
      <Header title="My Contests" showWallet />

      <div className="filter-chips">
        {['all', 'upcoming', 'live', 'completed'].map(f => (
          <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">&#127942;</div>
          <div className="empty-state-title">No contests joined</div>
          <div className="empty-state-text">Join contests from upcoming matches to start playing</div>
          <button className="btn btn-primary" style={{ margin: '16px auto 0' }} onClick={() => navigate('/home')}>
            Browse Matches
          </button>
        </div>
      ) : (
        filtered.map(entry => (
          <div
            key={entry.id}
            className="contest-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/leaderboard/${entry.contestId}`)}
          >
            {entry.match && (
              <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{entry.match.team1Flag}</span>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{entry.match.team1} vs {entry.match.team2}</span>
                  <span>{entry.match.team2Flag}</span>
                </div>
                {entry.match.status === 'live' && <span className="live-indicator"><span className="live-dot" /> LIVE</span>}
                {entry.match.status === 'upcoming' && <span className="match-status status-upcoming" style={{ fontSize: 10 }}><Clock size={10} /> Upcoming</span>}
                {entry.match.status === 'completed' && <span className="match-status status-completed" style={{ fontSize: 10 }}>Completed</span>}
              </div>
            )}
            <div className="contest-header" style={{ paddingBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="contest-title">{entry.contest?.name}</span>
                <ChevronRight size={16} color="var(--text3)" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Prize Pool</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gold)' }}>&#8377;{entry.contest?.prizePool?.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Rank</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>#{entry.rank}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Points</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--green)' }}>{entry.points}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Team</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{entry.team?.name}</div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
