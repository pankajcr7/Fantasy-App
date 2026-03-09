import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Bell, Clock, Flame, Calendar, Zap } from 'lucide-react';

function Countdown({ date }) {
  const [time, setTime] = useState('');
  useEffect(() => {
    const calc = () => {
      const diff = new Date(date) - new Date();
      if (diff <= 0) return setTime('Started');
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0) setTime(`${d}d ${h}h`);
      else if (h > 0) setTime(`${h}h ${m}m`);
      else setTime(`${m}m ${s}s`);
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [date]);
  return <span>{time}</span>;
}

function MatchCard({ match }) {
  const navigate = useNavigate();
  return (
    <div className="match-card" onClick={() => navigate(`/match/${match.id}`)}>
      <div className="match-card-header">
        <span className="match-format">{match.format}</span>
        {match.status === 'live' && (
          <span className="live-indicator"><span className="live-dot" /> LIVE</span>
        )}
        {match.status === 'upcoming' && (
          <div className="match-time">
            <Clock size={11} style={{ marginRight: 3, verticalAlign: -1 }} />
            <Countdown date={match.date} />
          </div>
        )}
        {match.status === 'completed' && (
          <span className="match-status status-completed">Completed</span>
        )}
      </div>
      <div className="match-teams">
        <div className="match-team">
          <span className="team-flag">{match.team1Flag}</span>
          <span className="team-name">{match.team1}</span>
          <span className="team-full-name">{match.team1Full}</span>
          {match.team1Score && <span className="match-score">{match.team1Score}</span>}
        </div>
        <div className="match-vs">VS</div>
        <div className="match-team">
          <span className="team-flag">{match.team2Flag}</span>
          <span className="team-name">{match.team2}</span>
          <span className="team-full-name">{match.team2Full}</span>
          {match.team2Score && <span className="match-score">{match.team2Score}</span>}
        </div>
      </div>
      {match.result && <div className="match-result">{match.result}</div>}
      <div className="match-card-footer">
        <span className="match-venue">{match.venue}</span>
        {match.lineupAnnounced && match.status === 'upcoming' && (
          <span className="lineup-badge"><span className="dot" /> Lineups Out</span>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [filter, setFilter] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    api.getMatches(filter === 'all' ? null : filter).then(setMatches).finally(() => setLoading(false));
  }, [filter]);

  const filters = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'live', label: 'Live' },
    { key: 'completed', label: 'Completed' },
    { key: 'all', label: 'All' },
  ];

  return (
    <div className="page page-with-header">
      <Header showWallet>
        <button className="header-back" onClick={() => navigate('/profile')}>
          <Bell size={16} />
        </button>
      </Header>

      <div className="banner-slider">
        <div className="banner-card" style={{ background: 'linear-gradient(135deg, #e63946, #c1121f)' }}>
          <div className="banner-title">India vs Pakistan</div>
          <div className="banner-desc">The biggest cricket rivalry! Win up to &#8377;10 Lakhs</div>
          <div className="banner-cta" onClick={() => {
            const indPak = matches.find(m => m.id === 'm5');
            if (indPak) navigate(`/match/m5`);
          }}>Play Now</div>
        </div>
        <div className="banner-card" style={{ background: 'linear-gradient(135deg, #2ec4b6, #06d6a0)' }}>
          <div className="banner-title">Refer & Earn</div>
          <div className="banner-desc">Invite friends and get &#8377;100 bonus per referral</div>
          <div className="banner-cta">Invite Now</div>
        </div>
        <div className="banner-card" style={{ background: 'linear-gradient(135deg, #f4a261, #e76f51)' }}>
          <div className="banner-title">First Deposit Bonus</div>
          <div className="banner-desc">100% cashback on your first deposit up to &#8377;1000</div>
          <div className="banner-cta" onClick={() => navigate('/wallet')}>Add Cash</div>
        </div>
      </div>

      <div className="quick-actions">
        <div className="quick-action" onClick={() => navigate('/my-contests')}>
          <div className="quick-action-icon" style={{ background: 'rgba(230,57,70,0.12)' }}>
            <Flame size={20} color="#e63946" />
          </div>
          <span>My Contests</span>
        </div>
        <div className="quick-action" onClick={() => navigate('/my-teams')}>
          <div className="quick-action-icon" style={{ background: 'rgba(46,196,182,0.12)' }}>
            <Zap size={20} color="#2ec4b6" />
          </div>
          <span>My Teams</span>
        </div>
        <div className="quick-action" onClick={() => navigate('/wallet')}>
          <div className="quick-action-icon" style={{ background: 'rgba(244,162,97,0.12)' }}>
            <Calendar size={20} color="#f4a261" />
          </div>
          <span>Wallet</span>
        </div>
        <div className="quick-action" onClick={() => navigate('/profile')}>
          <div className="quick-action-icon" style={{ background: 'rgba(130,100,255,0.12)' }}>
            <Bell size={20} color="#8264ff" />
          </div>
          <span>Profile</span>
        </div>
      </div>

      <div className="section-title">
        Cricket Matches
      </div>

      <div className="filter-chips">
        {filters.map(f => (
          <button
            key={f.key}
            className={`filter-chip ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key === 'live' && matches.some && filter !== 'live' ? '' : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">&#127951;</div>
          <div className="empty-state-title">No matches found</div>
          <div className="empty-state-text">Check back later for upcoming cricket matches</div>
        </div>
      ) : (
        <div style={{ paddingBottom: 16 }}>
          {matches.map(m => <MatchCard key={m.id} match={m} />)}
        </div>
      )}
    </div>
  );
}
