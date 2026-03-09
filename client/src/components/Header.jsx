import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ title, back, showWallet = false, children }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {back && (
            <button className="header-back" onClick={() => navigate(back === true ? -1 : back)}>
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="header-title">
            {!back && <img src={import.meta.env.BASE_URL + "logo.png"} alt="Brutal Local Fantasy" />}
            {title || 'Brutal Local Fantasy'}
          </div>
        </div>
        <div className="header-actions">
          {showWallet && user && (
            <div className="wallet-badge" onClick={() => navigate('/wallet')}>
              <span style={{ fontSize: 14 }}>&#8377;</span>
              {user.balance?.toLocaleString()}
            </div>
          )}
          {children}
        </div>
      </div>
    </header>
  );
}
