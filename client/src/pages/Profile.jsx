import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Wallet, HelpCircle, Shield, Star, LogOut, ChevronRight, Gift, Bell, FileText, MessageCircle } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: Wallet, title: 'My Wallet', desc: 'Add money, withdraw & transactions', color: '#2ec4b6', bg: 'rgba(46,196,182,0.12)', action: () => navigate('/wallet') },
    { icon: Gift, title: 'Refer & Earn', desc: 'Invite friends & earn rewards', color: '#f4a261', bg: 'rgba(244,162,97,0.12)', action: () => {} },
    { icon: Bell, title: 'Notifications', desc: 'Match alerts & contest updates', color: '#8264ff', bg: 'rgba(130,100,255,0.12)', action: () => {} },
    { icon: Star, title: 'How to Play', desc: 'Rules, scoring & FAQs', color: '#e63946', bg: 'rgba(230,57,70,0.12)', action: () => {} },
    { icon: FileText, title: 'Points System', desc: 'Cricket scoring breakdown', color: '#06d6a0', bg: 'rgba(6,214,160,0.12)', action: () => {} },
    { icon: Shield, title: 'Responsible Play', desc: 'Play responsibly & set limits', color: '#118ab2', bg: 'rgba(17,138,178,0.12)', action: () => {} },
    { icon: MessageCircle, title: 'Help & Support', desc: '24/7 customer support', color: '#ffd166', bg: 'rgba(255,209,102,0.12)', action: () => {} },
    { icon: HelpCircle, title: 'About Local Dream', desc: 'Terms, privacy & legality', color: '#a0a0c0', bg: 'rgba(160,160,192,0.12)', action: () => {} },
  ];

  return (
    <div className="page page-with-header">
      <Header title="Profile" />

      <div className="profile-header">
        <div className="profile-avatar">{user?.avatar || user?.name?.[0]}</div>
        <div className="profile-name">{user?.name}</div>
        <div className="profile-email">{user?.email}</div>
        {user?.mobile && <div className="profile-email">{user.mobile}</div>}
        <div className="profile-stats">
          <div className="profile-stat">
            <div className="val" style={{ color: 'var(--gold)' }}>&#8377;{user?.balance?.toLocaleString()}</div>
            <div className="lbl">Balance</div>
          </div>
          <div className="profile-stat">
            <div className="val" style={{ color: 'var(--green)' }}>-</div>
            <div className="lbl">Contests</div>
          </div>
          <div className="profile-stat">
            <div className="val" style={{ color: 'var(--primary)' }}>-</div>
            <div className="lbl">Winnings</div>
          </div>
        </div>
      </div>

      <div className="profile-menu">
        {menuItems.map((item, i) => (
          <button key={i} className="profile-menu-item" onClick={item.action}>
            <div className="profile-menu-icon" style={{ background: item.bg }}>
              <item.icon size={20} color={item.color} />
            </div>
            <div className="profile-menu-text">
              <div className="title">{item.title}</div>
              <div className="desc">{item.desc}</div>
            </div>
            <ChevronRight size={16} color="var(--text3)" />
          </button>
        ))}

        <button
          className="profile-menu-item"
          style={{ borderColor: 'rgba(230,57,70,0.2)', marginTop: 8 }}
          onClick={handleLogout}
        >
          <div className="profile-menu-icon" style={{ background: 'rgba(230,57,70,0.12)' }}>
            <LogOut size={20} color="#e63946" />
          </div>
          <div className="profile-menu-text">
            <div className="title" style={{ color: 'var(--primary)' }}>Logout</div>
            <div className="desc">Sign out of your account</div>
          </div>
        </button>
      </div>

      <div style={{ textAlign: 'center', padding: '16px', fontSize: 11, color: 'var(--text3)' }}>
        Local Dream v1.0.0 | Made with &#10084;&#65039; in India
      </div>
    </div>
  );
}
