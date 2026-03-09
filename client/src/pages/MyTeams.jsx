import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Header from '../components/Header';
import { Plus, Eye } from 'lucide-react';
import TeamPreviewModal from '../components/TeamPreviewModal';

export default function MyTeams() {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewTeam, setPreviewTeam] = useState(null);
  const [previewMatch, setPreviewMatch] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getMyTeams(), api.getMatches()])
      .then(async ([t, m]) => {
        setTeams(t);
        setMatches(m);
        const matchIds = [...new Set(t.map(team => team.matchId))];
        const allPlayers = [];
        for (const mid of matchIds) {
          const mp = await api.getMatchPlayers(mid);
          mp.forEach(p => { if (!allPlayers.find(x => x.id === p.id)) allPlayers.push(p); });
        }
        setPlayers(allPlayers);
      })
      .finally(() => setLoading(false));
  }, []);

  const getMatch = (matchId) => matches.find(m => m.id === matchId);

  const groupedByMatch = {};
  teams.forEach(t => {
    if (!groupedByMatch[t.matchId]) groupedByMatch[t.matchId] = [];
    groupedByMatch[t.matchId].push(t);
  });

  return (
    <div className="page page-with-header">
      <Header title="My Teams" showWallet />

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : teams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">&#127951;</div>
          <div className="empty-state-title">No teams created</div>
          <div className="empty-state-text">Create your first fantasy cricket team</div>
          <button className="btn btn-primary" style={{ margin: '16px auto 0' }} onClick={() => navigate('/home')}>
            Browse Matches
          </button>
        </div>
      ) : (
        Object.entries(groupedByMatch).map(([matchId, matchTeams]) => {
          const match = getMatch(matchId);
          return (
            <div key={matchId}>
              <div className="section-title" style={{ paddingBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {match && <><span>{match.team1Flag}</span> {match.team1} vs {match.team2} <span>{match.team2Flag}</span></>}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{match?.format}</span>
              </div>
              {matchTeams.map(team => {
                const teamPlayers = players.filter(p => team.players.includes(p.id));
                const roles = { WK: 0, BAT: 0, AR: 0, BOWL: 0 };
                teamPlayers.forEach(p => roles[p.role]++);
                const captain = players.find(p => p.id === team.captain);
                const vc = players.find(p => p.id === team.viceCaptain);

                return (
                  <div key={team.id} className="team-preview">
                    <div className="team-preview-header">
                      <span className="team-preview-name">{team.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {team.points > 0 && <span className="team-preview-points">{team.points} pts</span>}
                        <button
                          className="btn btn-sm btn-secondary"
                          style={{ padding: '5px 10px', fontSize: 11, gap: 4 }}
                          onClick={() => { setPreviewTeam(team); setPreviewMatch(match); }}
                        >
                          <Eye size={13} /> Preview
                        </button>
                      </div>
                    </div>
                    <div className="team-preview-composition">
                      {Object.entries(roles).map(([role, count]) => (
                        <div key={role} className="composition-item">
                          <div className="role">{role}</div>
                          <div className="num">{count}</div>
                        </div>
                      ))}
                    </div>
                    <div className="team-preview-players">
                      {teamPlayers.map(p => (
                        <div
                          key={p.id}
                          className={`mini-player ${p.id === team.captain ? 'captain' : ''} ${p.id === team.viceCaptain ? 'vice-captain' : ''}`}
                        >
                          {p.id === team.captain && <span className="badge c">C</span>}
                          {p.id === team.viceCaptain && <span className="badge vc">VC</span>}
                          {p.name.split(' ').pop()}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })
      )}

      {previewTeam && (
        <TeamPreviewModal
          players={players}
          selected={previewTeam.players}
          captain={previewTeam.captain}
          viceCaptain={previewTeam.viceCaptain}
          match={previewMatch}
          onClose={() => { setPreviewTeam(null); setPreviewMatch(null); }}
        />
      )}
    </div>
  );
}
