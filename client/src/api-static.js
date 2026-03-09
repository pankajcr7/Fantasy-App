import playersData from './data/players.json';
import matchesData from './data/matches.json';
import contestsData from './data/contests.json';

const STORAGE_PREFIX = 'ld_';
const getStore = (key) => JSON.parse(localStorage.getItem(STORAGE_PREFIX + key) || '[]');
const setStore = (key, data) => localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));

if (!localStorage.getItem(STORAGE_PREFIX + 'contests_init')) {
  setStore('contests', contestsData);
  localStorage.setItem(STORAGE_PREFIX + 'contests_init', '1');
}

const hashPassword = async (pw) => {
  const enc = new TextEncoder().encode(pw);
  const hash = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
};

export const api = {
  register: async (data) => {
    const users = getStore('users');
    if (users.find(u => u.email === data.email)) return { error: 'Email already exists' };
    const hash = await hashPassword(data.password);
    const user = {
      id: 'u' + Date.now(), name: data.name, email: data.email, password: hash,
      mobile: data.mobile || '', balance: 500, avatar: data.name[0].toUpperCase(), joined: new Date().toISOString()
    };
    users.push(user);
    setStore('users', users);
    const token = btoa(JSON.stringify({ id: user.id, name: user.name, email: user.email, exp: Date.now() + 7 * 86400000 }));
    return { token, user: { id: user.id, name: user.name, email: user.email, balance: user.balance, avatar: user.avatar, mobile: user.mobile } };
  },

  login: async (data) => {
    const users = getStore('users');
    const user = users.find(u => u.email === data.email);
    if (!user) return { error: 'User not found' };
    const hash = await hashPassword(data.password);
    if (user.password !== hash) return { error: 'Wrong password' };
    const token = btoa(JSON.stringify({ id: user.id, name: user.name, email: user.email, exp: Date.now() + 7 * 86400000 }));
    return { token, user: { id: user.id, name: user.name, email: user.email, balance: user.balance, avatar: user.avatar, mobile: user.mobile } };
  },

  me: async () => {
    const token = localStorage.getItem('ld_token');
    if (!token) return { error: 'No token' };
    try {
      const payload = JSON.parse(atob(token));
      if (payload.exp < Date.now()) return { error: 'Expired' };
      const users = getStore('users');
      const user = users.find(u => u.id === payload.id);
      if (!user) return { error: 'Not found' };
      return { id: user.id, name: user.name, email: user.email, balance: user.balance, avatar: user.avatar, mobile: user.mobile, joined: user.joined };
    } catch { return { error: 'Invalid token' }; }
  },

  getMatches: async (status) => {
    if (status) return matchesData.filter(m => m.status === status);
    return matchesData;
  },

  getMatch: async (id) => matchesData.find(m => m.id === id) || { error: 'Not found' },

  getMatchPlayers: async (id) => {
    const match = matchesData.find(m => m.id === id);
    if (!match) return [];
    const allIds = [...(match.team1Players || []), ...(match.team2Players || [])];
    return playersData.filter(p => allIds.includes(p.id));
  },

  getContests: async (matchId) => {
    const contests = getStore('contests');
    if (matchId) return contests.filter(c => c.matchId === matchId);
    return contests;
  },

  getContest: async (id) => {
    const contests = getStore('contests');
    return contests.find(c => c.id === id) || { error: 'Not found' };
  },

  joinContest: async (contestId, teamId) => {
    const token = localStorage.getItem('ld_token');
    if (!token) return { error: 'Not logged in' };
    const payload = JSON.parse(atob(token));
    const contests = getStore('contests');
    const contest = contests.find(c => c.id === contestId);
    if (!contest) return { error: 'Contest not found' };
    if (contest.filledSpots >= contest.totalSpots) return { error: 'Contest full' };
    const joined = getStore('joinedContests');
    if (joined.find(j => j.contestId === contestId && j.userId === payload.id && j.teamId === teamId))
      return { error: 'Already joined with this team' };
    const users = getStore('users');
    const user = users.find(u => u.id === payload.id);
    if (!user) return { error: 'User not found' };
    if (user.balance < contest.entryFee) return { error: 'Insufficient balance' };
    user.balance -= contest.entryFee;
    setStore('users', users);
    contest.filledSpots++;
    setStore('contests', contests);
    const entry = { id: 'j' + Date.now(), userId: payload.id, contestId, teamId, joinedAt: new Date().toISOString(), rank: Math.floor(Math.random() * contest.filledSpots) + 1, points: Math.floor(Math.random() * 200) + 100 };
    joined.push(entry);
    setStore('joinedContests', joined);
    return { entry, balance: user.balance };
  },

  createTeam: async (data) => {
    const token = localStorage.getItem('ld_token');
    if (!token) return { error: 'Not logged in' };
    const payload = JSON.parse(atob(token));
    const { matchId, players, captain, viceCaptain, name } = data;
    if (!players || players.length !== 11) return { error: 'Must select 11 players' };
    if (!captain || !viceCaptain) return { error: 'Must select captain & vice captain' };
    const selectedPlayers = playersData.filter(p => players.includes(p.id));
    const totalCredits = selectedPlayers.reduce((s, p) => s + p.credits, 0);
    if (totalCredits > 100) return { error: 'Credit limit exceeded' };
    const roles = { WK: 0, BAT: 0, AR: 0, BOWL: 0 };
    selectedPlayers.forEach(p => roles[p.role]++);
    if (roles.WK < 1 || roles.BAT < 1 || roles.AR < 1 || roles.BOWL < 1) return { error: 'Invalid team composition' };
    const match = matchesData.find(m => m.id === matchId);
    if (!match) return { error: 'Match not found' };
    const t1 = selectedPlayers.filter(p => match.team1Players.includes(p.id)).length;
    const t2 = selectedPlayers.filter(p => match.team2Players.includes(p.id)).length;
    if (t1 > 7 || t2 > 7) return { error: 'Max 7 players from one team' };
    const teams = getStore('userTeams');
    const team = {
      id: 't' + Date.now(), userId: payload.id, matchId, players, captain, viceCaptain,
      name: name || `Team ${teams.filter(t => t.userId === payload.id && t.matchId === matchId).length + 1}`,
      createdAt: new Date().toISOString(), points: 0
    };
    teams.push(team);
    setStore('userTeams', teams);
    return team;
  },

  getMyTeams: async (matchId) => {
    const token = localStorage.getItem('ld_token');
    if (!token) return [];
    const payload = JSON.parse(atob(token));
    const teams = getStore('userTeams');
    let userTeams = teams.filter(t => t.userId === payload.id);
    if (matchId) userTeams = userTeams.filter(t => t.matchId === matchId);
    return userTeams;
  },

  getTeam: async (id) => {
    const token = localStorage.getItem('ld_token');
    if (!token) return { error: 'Not logged in' };
    const payload = JSON.parse(atob(token));
    const teams = getStore('userTeams');
    return teams.find(t => t.id === id && t.userId === payload.id) || { error: 'Not found' };
  },

  getMyContests: async () => {
    const token = localStorage.getItem('ld_token');
    if (!token) return [];
    const payload = JSON.parse(atob(token));
    const joined = getStore('joinedContests');
    const contests = getStore('contests');
    const teams = getStore('userTeams');
    return joined.filter(j => j.userId === payload.id).map(j => {
      const contest = contests.find(c => c.id === j.contestId);
      const match = contest ? matchesData.find(m => m.id === contest.matchId) : null;
      const team = teams.find(t => t.id === j.teamId);
      return { ...j, contest, match, team };
    });
  },

  getLeaderboard: async (contestId) => {
    const joined = getStore('joinedContests');
    const users = getStore('users');
    const entries = joined.filter(j => j.contestId === contestId).map(j => {
      const user = users.find(u => u.id === j.userId);
      return { ...j, userName: user ? user.name : 'Unknown', avatar: user ? user.avatar : '?' };
    });
    const names = ['Rahul M','Priya S','Amit K','Sneha R','Vikram P','Anita D','Karan J','Meera L','Ravi T','Pooja N','Deepak G','Neha B','Arjun V','Swati C','Manoj H'];
    const fake = names.map((n, i) => ({ id: 'fake' + i, userName: n, avatar: n[0], rank: i + 1, points: 300 - i * 12 + Math.floor(Math.random() * 10) }));
    return [...entries, ...fake].sort((a, b) => (b.points || 0) - (a.points || 0)).map((e, i) => ({ ...e, rank: i + 1 }));
  },

  addMoney: async (amount) => {
    const token = localStorage.getItem('ld_token');
    if (!token) return { error: 'Not logged in' };
    const payload = JSON.parse(atob(token));
    const users = getStore('users');
    const user = users.find(u => u.id === payload.id);
    if (!user) return { error: 'Not found' };
    user.balance += amount;
    setStore('users', users);
    return { balance: user.balance };
  },
};
