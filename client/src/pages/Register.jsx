import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) return setError('All fields required');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(name, email, password, mobile);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <img src={import.meta.env.BASE_URL + "logo.png"} alt="Brutal Local Fantasy" className="auth-logo" />
      <h1 className="auth-title">Join Brutal Local Fantasy</h1>
      <p className="auth-subtitle">Create your account & get &#8377;500 bonus!</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="auth-error">{error}</div>}
        <div className="input-group">
          <label>Full Name</label>
          <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Mobile (optional)</label>
          <input type="tel" placeholder="10-digit mobile" value={mobile} onChange={e => setMobile(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? <div className="spinner" style={{ width: 20, height: 20 }} /> : <><UserPlus size={16} /> Create Account</>}
        </button>
      </form>
      <div className="auth-switch">
        Already have an account? <span onClick={() => navigate('/login')}>Login</span>
      </div>
    </div>
  );
}
