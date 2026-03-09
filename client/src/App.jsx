import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import SplashScreen from './components/SplashScreen';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MatchDetail from './pages/MatchDetail';
import CreateTeam from './pages/CreateTeam';
import SelectCaptain from './pages/SelectCaptain';
import MyContests from './pages/MyContests';
import MyTeams from './pages/MyTeams';
import Profile from './pages/Profile';
import Wallet from './pages/Wallet';
import Leaderboard from './pages/Leaderboard';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import './admin/admin.css';

export default function App() {
  const { user, loading, toast } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (!isAdmin && (showSplash || loading)) return (
    <SplashScreen onFinish={() => setShowSplash(false)} />
  );

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminLayout />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      {toast && <Toast message={toast.msg} type={toast.type} />}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/home" /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/home" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/home" /> : <Register />} />
        <Route path="/home" element={user ? <Home /> : <Navigate to="/" />} />
        <Route path="/match/:id" element={user ? <MatchDetail /> : <Navigate to="/" />} />
        <Route path="/match/:id/create-team" element={user ? <CreateTeam /> : <Navigate to="/" />} />
        <Route path="/match/:id/select-captain" element={user ? <SelectCaptain /> : <Navigate to="/" />} />
        <Route path="/my-contests" element={user ? <MyContests /> : <Navigate to="/" />} />
        <Route path="/my-teams" element={user ? <MyTeams /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
        <Route path="/wallet" element={user ? <Wallet /> : <Navigate to="/" />} />
        <Route path="/leaderboard/:contestId" element={user ? <Leaderboard /> : <Navigate to="/" />} />
      </Routes>
      {user && <BottomNav />}
    </div>
  );
}
