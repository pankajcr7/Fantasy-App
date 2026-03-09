import { useNavigate } from 'react-router-dom';
import { Shield, Trophy, Users, Zap, ChevronRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <img src={import.meta.env.BASE_URL + "logo.png"} alt="Brutal Local Fantasy" className="landing-logo" />
        <h1 className="landing-title">
          Play <span className="highlight">Brutal</span> Fantasy Cricket!
        </h1>
        <p className="landing-desc">
          Create your dream team, join exciting contests, and compete with millions of cricket fans across India.
        </p>
        <div className="landing-actions">
          <button className="btn btn-primary btn-full" style={{ padding: '14px 24px', fontSize: 16 }} onClick={() => navigate('/register')}>
            <Zap size={18} /> Get Started Free
          </button>
          <button className="btn btn-secondary btn-full" onClick={() => navigate('/login')}>
            Already have an account? Login <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="section-title" style={{ paddingTop: 0 }}>How It Works</div>
      <div className="how-it-works">
        <div className="how-step">
          <div className="how-step-num">1</div>
          <div className="how-step-text">
            <div className="hs-title">Select a Match</div>
            <div className="hs-desc">Choose from upcoming cricket matches across international tournaments</div>
          </div>
        </div>
        <div className="how-step">
          <div className="how-step-num">2</div>
          <div className="how-step-text">
            <div className="hs-title">Create Your Team</div>
            <div className="hs-desc">Pick 11 players within 100 credits. Choose captain & vice-captain wisely</div>
          </div>
        </div>
        <div className="how-step">
          <div className="how-step-num">3</div>
          <div className="how-step-text">
            <div className="hs-title">Join Contests</div>
            <div className="hs-desc">Enter free or paid contests and compete against other fans</div>
          </div>
        </div>
        <div className="how-step">
          <div className="how-step-num">4</div>
          <div className="how-step-text">
            <div className="hs-title">Win Prizes</div>
            <div className="hs-desc">Score points based on real match performance and win cash prizes</div>
          </div>
        </div>
      </div>

      <div className="section-title">Why Brutal Local Fantasy?</div>
      <div className="landing-features">
        <div className="feature-card">
          <div className="feature-icon" style={{ background: 'rgba(230,57,70,0.12)' }}>
            <Trophy size={24} color="#e63946" />
          </div>
          <div className="feature-text">
            <div className="ft-title">Win Big Prizes</div>
            <div className="ft-desc">Lakhs of rupees in prize pools every day across multiple contests</div>
          </div>
        </div>
        <div className="feature-card">
          <div className="feature-icon" style={{ background: 'rgba(46,196,182,0.12)' }}>
            <Shield size={24} color="#2ec4b6" />
          </div>
          <div className="feature-text">
            <div className="ft-title">100% Safe & Secure</div>
            <div className="ft-desc">Instant withdrawals, secure payments, and fair gameplay guaranteed</div>
          </div>
        </div>
        <div className="feature-card">
          <div className="feature-icon" style={{ background: 'rgba(244,162,97,0.12)' }}>
            <Users size={24} color="#f4a261" />
          </div>
          <div className="feature-text">
            <div className="ft-title">Play with Friends</div>
            <div className="ft-desc">Create private contests and challenge your friends to prove who knows cricket best</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px', textAlign: 'center' }}>
        <button className="btn btn-primary btn-full" style={{ padding: '14px 24px', fontSize: 16 }} onClick={() => navigate('/register')}>
          Start Playing Now
        </button>
        <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 12 }}>
          Join 10 Lakh+ fantasy cricket players on Brutal Local Fantasy
        </p>
      </div>
    </div>
  );
}
