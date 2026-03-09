import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Check } from 'lucide-react';

export default function CreateTeam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const [match, setMatch] = useState(null);
  const [players, setPlayers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getMatch(id), api.getMatchPlayers(id)])
      .then(([m, p]) => { setMatch(m); setPlayers(p); })
      .finally(() => setLoading(false));
  }, [id]);

  const togglePlayer = (playerId) => {
    if (selected.includes(playerId)) {
      setSelected(selected.filter(id => id !== playerId));
    } else {
      if (selected.length >= 11) return showToast('Max 11 players', 'error');
      const player = players.find(p => p.id === playerId);
      const newSelected = [...selected, playerId];
      const selectedPlayers = players.filter(p => newSelected.includes(p.id));
      const credits = selectedPlayers.reduce((s, p) => s + p.credits, 0);
      if (credits > 100) return showToast('Credit limit exceeded (100)', 'error');
      if (match) {
        const t1 = selectedPlayers.filter(p => match.team1Players?.includes(p.id)).length;
        const t2 = selectedPlayers.filter(p => match.team2Players?.includes(p.id)).length;
        if (t1 > 7 || t2 > 7) return showToast('Max 7 from one team', 'error');
      }
      setSelected(newSelected);
    }
  };

  const selectedPlayers = players.filter(p => selected.includes(p.id));
  const creditsUsed = selectedPlayers.reduce((s, p) => s + p.credits, 0);
  const roles = { WK: 0, BAT: 0, AR: 0, BOWL: 0 };
  selectedPlayers.forEach(p => roles[p.role]++);

  const filteredPlayers = players.filter(p => {
    if (roleFilter !== 'ALL' && p.role !== roleFilter) return false;
    if (teamFilter !== 'ALL' && p.team !== teamFilter) return false;
    return true;
  });

  const handleNext = () => {
    if (selected.length !== 11) return showToast('Select exactly 11 players', 'error');
    if (roles.WK < 1) return showToast('Select at least 1 WK', 'error');
    if (roles.BAT < 1) return showToast('Select at least 1 BAT', 'error');
    if (roles.AR < 1) return showToast('Select at least 1 AR', 'error');
    if (roles.BOWL < 1) return showToast('Select at least 1 BOWL', 'error');
    sessionStorage.setItem('createTeam', JSON.stringify({ matchId: id, players: selected }));
    navigate(`/match/${id}/select-captain`);
  };

  if (loading) return (
    <div className="page page-with-header">
      <Header title="Create Team" back={true} />
      <div className="loading-spinner"><div className="spinner" /></div>
    </div>
  );

  const roleOptions = [
    { key: 'ALL', label: 'ALL' },
    { key: 'WK', label: `WK (${roles.WK})` },
    { key: 'BAT', label: `BAT (${roles.BAT})` },
    { key: 'AR', label: `AR (${roles.AR})` },
    { key: 'BOWL', label: `BOWL (${roles.BOWL})` },
  ];

  return (
    <div className="page page-with-header" style={{ paddingBottom: 140 }}>
      <Header title="Create Team" back={`/match/${id}`} />

      <div className="credits-bar">
        <div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Players</div>
          <div className="credits-value">{selected.length}/11</div>
        </div>
        <div className="team-count">
          {Object.entries(roles).map(([role, count]) => (
            <div key={role} className="team-count-item">
              <div className="count" style={{ color: count > 0 ? 'var(--green)' : 'var(--text3)' }}>{count}</div>
              <div className="label">{role}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Credits Left</div>
          <div className="credits-value">{(100 - creditsUsed).toFixed(1)}</div>
        </div>
      </div>

      {match && (
        <div className="filter-chips" style={{ paddingBottom: 0 }}>
          <button className={`filter-chip ${teamFilter === 'ALL' ? 'active' : ''}`} onClick={() => setTeamFilter('ALL')}>All</button>
          <button className={`filter-chip ${teamFilter === match.team1 ? 'active' : ''}`} onClick={() => setTeamFilter(match.team1)}>
            {match.team1Flag} {match.team1}
          </button>
          <button className={`filter-chip ${teamFilter === match.team2 ? 'active' : ''}`} onClick={() => setTeamFilter(match.team2)}>
            {match.team2Flag} {match.team2}
          </button>
        </div>
      )}

      <div className="role-tabs">
        {roleOptions.map(r => (
          <button key={r.key} className={`role-tab ${roleFilter === r.key ? 'active' : ''}`} onClick={() => setRoleFilter(r.key)}>
            {r.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 11, padding: '0 16px 8px', color: 'var(--text3)', display: 'flex', justifyContent: 'space-between' }}>
        <span>PLAYER</span>
        <span>CREDITS</span>
      </div>

      {filteredPlayers.map(player => {
        const isSelected = selected.includes(player.id);
        return (
          <div
            key={player.id}
            className={`player-card ${isSelected ? 'selected' : ''}`}
            onClick={() => togglePlayer(player.id)}
          >
            <div className="player-avatar">
              {player.image ? <img src={player.image} alt={player.name} onError={e => { e.target.style.display = 'none'; e.target.parentElement.textContent = player.name[0]; }} /> : player.name[0]}
            </div>
            <div className="player-info">
              <div className="player-name">{player.name}</div>
              <div className="player-team-role">
                <span className="player-team-badge">{player.team}</span>
                <span className="player-role-badge">{player.role}</span>
              </div>
              <div className="player-stats">
                {player.role === 'BOWL'
                  ? `${player.stats?.wickets || 0} wkts | Eco: ${player.stats?.economy || '-'}`
                  : `Avg: ${player.stats?.avg || '-'} | SR: ${player.stats?.sr || '-'}`
                }
              </div>
            </div>
            <div className="player-credits">{player.credits}</div>
            <div className="player-select-indicator">
              {isSelected && <Check size={14} color="white" />}
            </div>
          </div>
        );
      })}

      <div className="floating-btn" style={{ bottom: 16 }}>
        <button
          className={`btn btn-full ${selected.length === 11 ? 'btn-green' : 'btn-secondary'}`}
          style={{ padding: '14px', fontSize: 15, borderRadius: 14 }}
          onClick={handleNext}
          disabled={selected.length !== 11}
        >
          Next: Choose Captain & Vice Captain ({selected.length}/11)
        </button>
      </div>
    </div>
  );
}
