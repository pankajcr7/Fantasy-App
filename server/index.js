const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'localdream_secret_2026';
const DATA_DIR = path.join(__dirname, 'data');

const readJSON = (file) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
const writeJSON = (file, data) => fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));

if (!fs.existsSync(path.join(DATA_DIR, 'users.json'))) writeJSON('users.json', []);
if (!fs.existsSync(path.join(DATA_DIR, 'userTeams.json'))) writeJSON('userTeams.json', []);
if (!fs.existsSync(path.join(DATA_DIR, 'joinedContests.json'))) writeJSON('joinedContests.json', []);

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;
    const users = readJSON('users.json');
    if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = { id: 'u' + Date.now(), name, email, password: hash, mobile, balance: 500, avatar: name[0].toUpperCase(), joined: new Date().toISOString() };
    users.push(user);
    writeJSON('users.json', users);
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, balance: user.balance, avatar: user.avatar, mobile: user.mobile } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = readJSON('users.json');
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ error: 'User not found' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Wrong password' });
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, balance: user.balance, avatar: user.avatar, mobile: user.mobile } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/auth/me', auth, (req, res) => {
  const users = readJSON('users.json');
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ id: user.id, name: user.name, email: user.email, balance: user.balance, avatar: user.avatar, mobile: user.mobile, joined: user.joined });
});

app.get('/api/matches', (req, res) => {
  const matches = readJSON('matches.json');
  const { status } = req.query;
  if (status) return res.json(matches.filter(m => m.status === status));
  res.json(matches);
});

app.get('/api/matches/:id', (req, res) => {
  const matches = readJSON('matches.json');
  const match = matches.find(m => m.id === req.params.id);
  if (!match) return res.status(404).json({ error: 'Not found' });
  res.json(match);
});

app.get('/api/matches/:id/players', (req, res) => {
  const matches = readJSON('matches.json');
  const players = readJSON('players.json');
  const match = matches.find(m => m.id === req.params.id);
  if (!match) return res.status(404).json({ error: 'Not found' });
  const allIds = [...(match.team1Players || []), ...(match.team2Players || [])];
  const matchPlayers = players.filter(p => allIds.includes(p.id));
  res.json(matchPlayers);
});

app.get('/api/contests', (req, res) => {
  const contests = readJSON('contests.json');
  const { matchId } = req.query;
  if (matchId) return res.json(contests.filter(c => c.matchId === matchId));
  res.json(contests);
});

app.get('/api/contests/:id', (req, res) => {
  const contests = readJSON('contests.json');
  const contest = contests.find(c => c.id === req.params.id);
  if (!contest) return res.status(404).json({ error: 'Not found' });
  res.json(contest);
});

app.post('/api/teams', auth, (req, res) => {
  try {
    const { matchId, players, captain, viceCaptain, name } = req.body;
    if (!players || players.length !== 11) return res.status(400).json({ error: 'Must select 11 players' });
    if (!captain || !viceCaptain) return res.status(400).json({ error: 'Must select captain & vice captain' });
    const allPlayers = readJSON('players.json');
    const selectedPlayers = allPlayers.filter(p => players.includes(p.id));
    const totalCredits = selectedPlayers.reduce((s, p) => s + p.credits, 0);
    if (totalCredits > 100) return res.status(400).json({ error: 'Credit limit exceeded' });
    const roles = { WK: 0, BAT: 0, AR: 0, BOWL: 0 };
    selectedPlayers.forEach(p => roles[p.role]++);
    if (roles.WK < 1 || roles.BAT < 1 || roles.AR < 1 || roles.BOWL < 1) return res.status(400).json({ error: 'Invalid team composition' });
    const matches = readJSON('matches.json');
    const match = matches.find(m => m.id === matchId);
    if (!match) return res.status(400).json({ error: 'Match not found' });
    const t1count = selectedPlayers.filter(p => match.team1Players.includes(p.id)).length;
    const t2count = selectedPlayers.filter(p => match.team2Players.includes(p.id)).length;
    if (t1count > 7 || t2count > 7) return res.status(400).json({ error: 'Max 7 players from one team' });
    const teams = readJSON('userTeams.json');
    const team = {
      id: 't' + Date.now(),
      userId: req.user.id,
      matchId, players, captain, viceCaptain,
      name: name || `Team ${teams.filter(t => t.userId === req.user.id && t.matchId === matchId).length + 1}`,
      createdAt: new Date().toISOString(),
      points: 0
    };
    teams.push(team);
    writeJSON('userTeams.json', teams);
    res.json(team);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/teams', auth, (req, res) => {
  const teams = readJSON('userTeams.json');
  const { matchId } = req.query;
  let userTeams = teams.filter(t => t.userId === req.user.id);
  if (matchId) userTeams = userTeams.filter(t => t.matchId === matchId);
  res.json(userTeams);
});

app.get('/api/teams/:id', auth, (req, res) => {
  const teams = readJSON('userTeams.json');
  const team = teams.find(t => t.id === req.params.id && t.userId === req.user.id);
  if (!team) return res.status(404).json({ error: 'Not found' });
  res.json(team);
});

app.post('/api/contests/:id/join', auth, (req, res) => {
  try {
    const { teamId } = req.body;
    const contests = readJSON('contests.json');
    const contest = contests.find(c => c.id === req.params.id);
    if (!contest) return res.status(404).json({ error: 'Contest not found' });
    if (contest.filledSpots >= contest.totalSpots) return res.status(400).json({ error: 'Contest full' });
    const joined = readJSON('joinedContests.json');
    if (joined.find(j => j.contestId === req.params.id && j.userId === req.user.id && j.teamId === teamId))
      return res.status(400).json({ error: 'Already joined with this team' });
    const users = readJSON('users.json');
    const user = users.find(u => u.id === req.user.id);
    if (user.balance < contest.entryFee) return res.status(400).json({ error: 'Insufficient balance' });
    user.balance -= contest.entryFee;
    writeJSON('users.json', users);
    contest.filledSpots++;
    writeJSON('contests.json', contests);
    const entry = { id: 'j' + Date.now(), userId: req.user.id, contestId: req.params.id, teamId, joinedAt: new Date().toISOString(), rank: Math.floor(Math.random() * contest.filledSpots) + 1, points: Math.floor(Math.random() * 200) + 100 };
    joined.push(entry);
    writeJSON('joinedContests.json', joined);
    res.json({ entry, balance: user.balance });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/my-contests', auth, (req, res) => {
  const joined = readJSON('joinedContests.json');
  const contests = readJSON('contests.json');
  const matches = readJSON('matches.json');
  const teams = readJSON('userTeams.json');
  const userJoined = joined.filter(j => j.userId === req.user.id).map(j => {
    const contest = contests.find(c => c.id === j.contestId);
    const match = contest ? matches.find(m => m.id === contest.matchId) : null;
    const team = teams.find(t => t.id === j.teamId);
    return { ...j, contest, match, team };
  });
  res.json(userJoined);
});

app.get('/api/leaderboard/:contestId', (req, res) => {
  const joined = readJSON('joinedContests.json');
  const users = readJSON('users.json');
  const entries = joined.filter(j => j.contestId === req.params.contestId)
    .map(j => {
      const user = users.find(u => u.id === j.userId);
      return { ...j, userName: user ? user.name : 'Unknown', avatar: user ? user.avatar : '?' };
    })
    .sort((a, b) => a.rank - b.rank);
  const fakeEntries = [];
  const names = ['Rahul M', 'Priya S', 'Amit K', 'Sneha R', 'Vikram P', 'Anita D', 'Karan J', 'Meera L', 'Ravi T', 'Pooja N', 'Deepak G', 'Neha B', 'Arjun V', 'Swati C', 'Manoj H'];
  for (let i = 0; i < 15; i++) {
    fakeEntries.push({ id: 'fake' + i, userName: names[i], avatar: names[i][0], rank: i + 1, points: 300 - i * 12 + Math.floor(Math.random() * 10) });
  }
  const all = [...entries, ...fakeEntries].sort((a, b) => (b.points || 0) - (a.points || 0)).map((e, i) => ({ ...e, rank: i + 1 }));
  res.json(all);
});

app.post('/api/wallet/add', auth, (req, res) => {
  const { amount } = req.body;
  const users = readJSON('users.json');
  const user = users.find(u => u.id === req.user.id);
  user.balance += amount;
  writeJSON('users.json', users);
  res.json({ balance: user.balance });
});

app.get('/api/players', (req, res) => {
  const players = readJSON('players.json');
  res.json(players);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
