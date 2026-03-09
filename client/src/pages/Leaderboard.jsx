import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Header from '../components/Header';
import { Trophy, Medal } from 'lucide-react';

export default function Leaderboard() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getLeaderboard(contestId),
      api.getContest(contestId),
    ]).then(([e, c]) => {
      setEntries(e);
      setContest(c);
    }).finally(() => setLoading(false));
  }, [contestId]);

  return (
    <div className="page page-with-header">
      <Header title="Leaderboard" back={true} />

      {contest && (
        <div style={{ padding: '16px', background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{contest.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                {contest.filledSpots?.toLocaleString()} / {contest.totalSpots?.toLocaleString()} joined
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Prize Pool</div>
              <div style={{ fontWeight: 800, fontSize: 20, fontFamily: 'Poppins', background: 'var(--gradient4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                &#8377;{contest.prizePool?.toLocaleString()}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <div style={{ flex: 1, padding: '10px', background: 'var(--bg3)', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>1st Prize</div>
              <div style={{ fontWeight: 700, color: 'var(--gold)' }}>&#8377;{contest.firstPrize?.toLocaleString()}</div>
            </div>
            <div style={{ flex: 1, padding: '10px', background: 'var(--bg3)', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Entry</div>
              <div style={{ fontWeight: 700, color: 'var(--green)' }}>{contest.entryFee === 0 ? 'FREE' : `&#8377;${contest.entryFee}`}</div>
            </div>
            <div style={{ flex: 1, padding: '10px', background: 'var(--bg3)', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Type</div>
              <div style={{ fontWeight: 700 }}>{contest.type?.toUpperCase()}</div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <div>
          <div style={{ display: 'flex', padding: '10px 16px', fontSize: 11, color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>
            <span style={{ width: 40 }}>#</span>
            <span style={{ flex: 1 }}>PLAYER</span>
            <span style={{ width: 60, textAlign: 'right' }}>POINTS</span>
          </div>
          {entries.map((entry, i) => (
            <div key={entry.id || i} className="leaderboard-row">
              <span className={`leaderboard-rank ${i === 0 ? 'top-1' : i === 1 ? 'top-2' : i === 2 ? 'top-3' : ''}`}>
                {i < 3 ? (i === 0 ? '&#127941;' : i === 1 ? '&#129352;' : '&#129353;') : entry.rank}
              </span>
              <div className="leaderboard-avatar">{entry.avatar}</div>
              <span className="leaderboard-name">{entry.userName}</span>
              <span className="leaderboard-points">{entry.points}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
