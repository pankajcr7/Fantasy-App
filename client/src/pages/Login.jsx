import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('All fields required');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <img src={import.meta.env.BASE_URL + "logo.png"} alt="Local Dream" className="auth-logo" />
      <h1 className="auth-title">Welcome Back!</h1>
      <p className="auth-subtitle">Login to your Local Dream account</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="auth-error">{error}</div>}
        <div className="input-group">
          <label>Email</label>
          <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? <div className="spinner" style={{ width: 20, height: 20 }} /> : <><LogIn size={16} /> Login</>}
        </button>
      </form>
      <div className="auth-switch">
        Don't have an account? <span onClick={() => navigate('/register')}>Register</span>
      </div>
    </div>
  );
}
