import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Star } from 'lucide-react';

export default function SelectCaptain() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const [players, setPlayers] = useState([]);
  const [teamData, setTeamData] = useState(null);
  const [captain, setCaptain] = useState(null);
  const [viceCaptain, setViceCaptain] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('createTeam');
    if (!data) return navigate(`/match/${id}/create-team`);
    const parsed = JSON.parse(data);
    setTeamData(parsed);
    api.getMatchPlayers(id).then(all => {
      setPlayers(all.filter(p => parsed.players.includes(p.id)));
    });
  }, [id]);

  const handleCaptain = (playerId) => {
    if (viceCaptain === playerId) setViceCaptain(null);
    setCaptain(playerId);
  };

  const handleVC = (playerId) => {
    if (captain === playerId) setCaptain(null);
    setViceCaptain(playerId);
  };

  const handleSave = async () => {
    if (!captain || !viceCaptain) return showToast('Select both C & VC', 'error');
    if (captain === viceCaptain) return showToast('C and VC must be different', 'error');
    setSaving(true);
    try {
      const res = await api.createTeam({
        matchId: id,
        players: teamData.players,
        captain,
        viceCaptain,
      });
      if (res.error) return showToast(res.error, 'error');
      sessionStorage.removeItem('createTeam');
      showToast('Team created successfully!');
      navigate(`/match/${id}`);
    } catch { showToast('Failed to create team', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="page page-with-header" style={{ paddingBottom: 100 }}>
      <Header title="Choose C & VC" back={`/match/${id}/create-team`} />

      <div style={{ padding: '16px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
          Captain gets <strong style={{ color: 'var(--primary)' }}>2x</strong> points &
          Vice Captain gets <strong style={{ color: 'var(--gold)' }}>1.5x</strong> points
        </p>
      </div>

      <div style={{ fontSize: 11, padding: '0 16px 8px', color: 'var(--text3)', display: 'flex', justifyContent: 'space-between' }}>
        <span>PLAYER</span>
        <span style={{ display: 'flex', gap: 20 }}>
          <span style={{ width: 36, textAlign: 'center' }}>C</span>
          <span style={{ width: 36, textAlign: 'center' }}>VC</span>
        </span>
      </div>

      {players.map(player => (
        <div key={player.id} className={`captain-card ${captain === player.id ? 'selected-c' : ''} ${viceCaptain === player.id ? 'selected-vc' : ''}`} style={{ margin: '0 16px 8px' }}>
          <div className="player-avatar" style={{ width: 40, height: 40, marginRight: 10 }}>
            {player.image ? <img src={player.image} alt={player.name} onError={e => { e.target.style.display = 'none'; e.target.parentElement.textContent = player.name[0]; }} /> : player.name[0]}
          </div>
          <div className="player-info" style={{ flex: 1 }}>
            <div className="player-name">{player.name}</div>
            <div className="player-team-role">
              <span className="player-team-badge">{player.team}</span>
              <span className="player-role-badge">{player.role}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div
              className={`captain-badge ${captain === player.id ? 'c-active' : ''}`}
              onClick={() => handleCaptain(player.id)}
            >
              C
            </div>
            <div
              className={`captain-badge ${viceCaptain === player.id ? 'vc-active' : ''}`}
              onClick={() => handleVC(player.id)}
            >
              VC
            </div>
          </div>
        </div>
      ))}

      <div className="floating-btn" style={{ bottom: 16 }}>
        <button
          className={`btn btn-full ${captain && viceCaptain ? 'btn-green' : 'btn-secondary'}`}
          style={{ padding: '14px', fontSize: 15, borderRadius: 14 }}
          onClick={handleSave}
          disabled={!captain || !viceCaptain || saving}
        >
          {saving ? <div className="spinner" style={{ width: 20, height: 20 }} /> : (
            <>
              <Star size={16} /> Save Team
            </>
          )}
        </button>
      </div>
    </div>
  );
}
