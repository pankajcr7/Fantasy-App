import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Clock, Trophy, Users, ChevronRight, Award, Swords, Shield, Plus, Check } from 'lucide-react';

function ContestCard({ contest, onJoin, myTeams, joinedContests }) {
  const navigate = useNavigate();
  const fillPercent = Math.round((contest.filledSpots / contest.totalSpots) * 100);
  const spotsLeft = contest.totalSpots - contest.filledSpots;
  const isJoined = joinedContests?.some(j => j.contestId === contest.id);

  return (
    <div className="contest-card">
      <div className="contest-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span className="contest-title">{contest.name}</span>
          {contest.type === 'mega' && <span style={{ fontSize: 16 }}>&#127942;</span>}
        </div>
        <div className="contest-prize">
          <span className="prize-amount">&#8377;{contest.prizePool?.toLocaleString()}</span>
          <span className="prize-label">Prize Pool</span>
        </div>
        <div className="contest-progress">
          <div
            className={`contest-progress-fill ${fillPercent > 80 ? 'fill-red' : 'fill-green'}`}
            style={{ width: `${fillPercent}%` }}
          />
        </div>
        <div className="contest-spots">
          <span style={{ color: spotsLeft < 100 ? 'var(--primary)' : 'var(--text2)' }}>
            {spotsLeft.toLocaleString()} spots left
          </span>
          <span>{contest.totalSpots.toLocaleString()} spots</span>
        </div>
      </div>
      <div className="contest-footer">
        <div className="contest-info">
          <div className="contest-info-item">
            <Trophy size={12} />
            &#8377;{contest.firstPrize?.toLocaleString()}
          </div>
          <div className="contest-info-item">
            <Users size={12} />
            {contest.type === 'h2h' ? '1v1' : contest.type}
          </div>
        </div>
        {isJoined ? (
          <button className="btn btn-sm" style={{ background: 'rgba(46,196,182,0.15)', color: 'var(--green)', border: '1px solid var(--green)' }}>
            <Check size={14} /> Joined
          </button>
        ) : (
          <button
            className={`btn btn-sm ${contest.entryFee === 0 ? 'btn-gold' : 'btn-green'}`}
            onClick={() => onJoin(contest)}
          >
            {contest.entryFee === 0 ? 'FREE' : `&#8377;${contest.entryFee}`}
          </button>
        )}
      </div>
    </div>
  );
}

function TeamPreview({ team, players, match, onSelect, selected }) {
  const allPlayers = players || [];
  const teamPlayers = allPlayers.filter(p => team.players.includes(p.id));
  const roles = { WK: 0, BAT: 0, AR: 0, BOWL: 0 };
  teamPlayers.forEach(p => roles[p.role]++);
  const captain = allPlayers.find(p => p.id === team.captain);
  const vc = allPlayers.find(p => p.id === team.viceCaptain);

  return (
    <div
      className="team-preview"
      style={selected ? { borderColor: 'var(--green)' } : {}}
      onClick={() => onSelect && onSelect(team.id)}
    >
      <div className="team-preview-header">
        <span className="team-preview-name">{team.name}</span>
        {team.points > 0 && <span className="team-preview-points">{team.points} pts</span>}
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
}

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, showToast, refreshUser } = useAuth();
  const [match, setMatch] = useState(null);
  const [contests, setContests] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [joinedContests, setJoinedContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('contests');
  const [joinModal, setJoinModal] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    Promise.all([
      api.getMatch(id),
      api.getContests(id),
      api.getMyTeams(id),
      api.getMatchPlayers(id),
      api.getMyContests(),
    ]).then(([m, c, t, p, jc]) => {
      setMatch(m);
      setContests(c);
      setMyTeams(t);
      setPlayers(p);
      setJoinedContests(jc);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleJoinContest = async (contest) => {
    if (myTeams.length === 0) {
      showToast('Create a team first!', 'error');
      navigate(`/match/${id}/create-team`);
      return;
    }
    if (myTeams.length === 1) {
      try {
        const res = await api.joinContest(contest.id, myTeams[0].id);
        if (res.error) return showToast(res.error, 'error');
        showToast('Joined contest successfully!');
        refreshUser();
        const jc = await api.getMyContests();
        setJoinedContests(jc);
        const c = await api.getContests(id);
        setContests(c);
      } catch { showToast('Failed to join', 'error'); }
    } else {
      setJoinModal(contest);
      setSelectedTeam(myTeams[0]?.id);
    }
  };

  const confirmJoin = async () => {
    if (!joinModal || !selectedTeam) return;
    try {
      const res = await api.joinContest(joinModal.id, selectedTeam);
      if (res.error) return showToast(res.error, 'error');
      showToast('Joined contest successfully!');
      refreshUser();
      setJoinModal(null);
      const jc = await api.getMyContests();
      setJoinedContests(jc);
      const c = await api.getContests(id);
      setContests(c);
    } catch { showToast('Failed to join', 'error'); }
  };

  if (loading) return (
    <div className="page page-with-header">
      <Header title="Match" back={true} />
      <div className="loading-spinner"><div className="spinner" /></div>
    </div>
  );

  if (!match) return (
    <div className="page page-with-header">
      <Header title="Match" back={true} />
      <div className="empty-state">
        <div className="empty-state-title">Match not found</div>
      </div>
    </div>
  );

  const isUpcoming = match.status === 'upcoming';

  return (
    <div className="page page-with-header">
      <Header title={`${match.team1} vs ${match.team2}`} back="/home" showWallet />

      <div style={{ padding: '16px', textAlign: 'center', background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <div className="match-teams" style={{ padding: 0 }}>
          <div className="match-team">
            <span className="team-flag" style={{ fontSize: 40 }}>{match.team1Flag}</span>
            <span className="team-name">{match.team1}</span>
            {match.team1Score && <span className="match-score">{match.team1Score}</span>}
          </div>
          <div style={{ textAlign: 'center' }}>
            {match.status === 'live' && <div className="live-indicator" style={{ marginBottom: 4 }}><span className="live-dot" /> LIVE</div>}
            <div className="match-vs">VS</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{match.format}</div>
          </div>
          <div className="match-team">
            <span className="team-flag" style={{ fontSize: 40 }}>{match.team2Flag}</span>
            <span className="team-name">{match.team2}</span>
            {match.team2Score && <span className="match-score">{match.team2Score}</span>}
          </div>
        </div>
        {match.result && <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)', marginTop: 8 }}>{match.result}</div>}
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>{match.venue}</div>
      </div>

      <div className="tabs" style={{ margin: '12px 16px' }}>
        <button className={`tab ${tab === 'contests' ? 'active' : ''}`} onClick={() => setTab('contests')}>Contests</button>
        <button className={`tab ${tab === 'myTeams' ? 'active' : ''}`} onClick={() => setTab('myTeams')}>
          My Teams ({myTeams.length})
        </button>
      </div>

      {tab === 'contests' && (
        <div>
          {contests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">&#127942;</div>
              <div className="empty-state-title">No contests available</div>
            </div>
          ) : (
            contests.map(c => (
              <ContestCard
                key={c.id}
                contest={c}
                onJoin={handleJoinContest}
                myTeams={myTeams}
                joinedContests={joinedContests}
              />
            ))
          )}
        </div>
      )}

      {tab === 'myTeams' && (
        <div>
          {myTeams.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">&#127951;</div>
              <div className="empty-state-title">No teams created</div>
              <div className="empty-state-text">Create your first team for this match</div>
              {isUpcoming && (
                <button className="btn btn-primary" style={{ margin: '16px auto 0' }} onClick={() => navigate(`/match/${id}/create-team`)}>
                  <Plus size={16} /> Create Team
                </button>
              )}
            </div>
          ) : (
            myTeams.map(t => (
              <TeamPreview key={t.id} team={t} players={players} match={match} />
            ))
          )}
        </div>
      )}

      {isUpcoming && (
        <div className="floating-btn">
          <button className="btn btn-primary btn-full" style={{ padding: '14px', fontSize: 15, borderRadius: 14 }}
            onClick={() => navigate(`/match/${id}/create-team`)}>
            <Plus size={18} /> Create Team
          </button>
        </div>
      )}

      {joinModal && (
        <div className="modal-overlay" onClick={() => setJoinModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Select Team</div>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
              Choose a team to join <strong>{joinModal.name}</strong>
              {joinModal.entryFee > 0 && <> (Entry: &#8377;{joinModal.entryFee})</>}
            </p>
            {myTeams.map(t => (
              <TeamPreview
                key={t.id}
                team={t}
                players={players}
                match={match}
                onSelect={setSelectedTeam}
                selected={selectedTeam === t.id}
              />
            ))}
            <button className="btn btn-green btn-full" style={{ marginTop: 16 }} onClick={confirmJoin}>
              Join Contest {joinModal.entryFee > 0 ? `- &#8377;${joinModal.entryFee}` : '- FREE'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
