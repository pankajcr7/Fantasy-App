import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.adminLogin(email, password);
      if (res.error) { setError(res.error); setLoading(false); return; }
      navigate('/admin');
    } catch (err) {
      setError('Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-icon"><Shield size={40} /></div>
        <h1>Admin Panel</h1>
        <p>Brutal Local Fantasy</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="admin-error">{error}</div>}
          <div className="admin-field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Admin email" required />
          </div>
          <div className="admin-field">
            <label>Password</label>
            <div className="admin-pass-wrap">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
              <button type="button" className="admin-pass-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="admin-login-btn" disabled={loading}>
            <LogIn size={18} /> {loading ? 'Logging in...' : 'Login to Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
