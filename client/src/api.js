const API = '/api';

const getToken = () => localStorage.getItem('ld_token');

const headers = (json = true) => {
  const h = {};
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (json) h['Content-Type'] = 'application/json';
  return h;
};

export const api = {
  register: (data) => fetch(`${API}/auth/register`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),
  login: (data) => fetch(`${API}/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),
  me: () => fetch(`${API}/auth/me`, { headers: headers() }).then(r => r.json()),

  getMatches: (status) => fetch(`${API}/matches${status ? `?status=${status}` : ''}`, { headers: headers() }).then(r => r.json()),
  getMatch: (id) => fetch(`${API}/matches/${id}`, { headers: headers() }).then(r => r.json()),
  getMatchPlayers: (id) => fetch(`${API}/matches/${id}/players`, { headers: headers() }).then(r => r.json()),

  getContests: (matchId) => fetch(`${API}/contests${matchId ? `?matchId=${matchId}` : ''}`, { headers: headers() }).then(r => r.json()),
  getContest: (id) => fetch(`${API}/contests/${id}`, { headers: headers() }).then(r => r.json()),
  joinContest: (id, teamId) => fetch(`${API}/contests/${id}/join`, { method: 'POST', headers: headers(), body: JSON.stringify({ teamId }) }).then(r => r.json()),

  createTeam: (data) => fetch(`${API}/teams`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),
  getMyTeams: (matchId) => fetch(`${API}/teams${matchId ? `?matchId=${matchId}` : ''}`, { headers: headers() }).then(r => r.json()),
  getTeam: (id) => fetch(`${API}/teams/${id}`, { headers: headers() }).then(r => r.json()),

  getMyContests: () => fetch(`${API}/my-contests`, { headers: headers() }).then(r => r.json()),
  getLeaderboard: (contestId) => fetch(`${API}/leaderboard/${contestId}`, { headers: headers() }).then(r => r.json()),

  addMoney: (amount) => fetch(`${API}/wallet/add`, { method: 'POST', headers: headers(), body: JSON.stringify({ amount }) }).then(r => r.json()),
};
