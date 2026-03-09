import { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 600);
    const t3 = setTimeout(() => setPhase(3), 1200);
    const t4 = setTimeout(() => setPhase(4), 2000);
    const t5 = setTimeout(() => onFinish(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, []);

  return (
    <div className={`splash ${phase >= 4 ? 'splash-exit' : ''}`}>
      <div className="splash-bg">
        <div className="splash-circle splash-c1" />
        <div className="splash-circle splash-c2" />
        <div className="splash-circle splash-c3" />
        <div className="splash-particles">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="splash-particle" style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }} />
          ))}
        </div>
      </div>

      <div className="splash-content">
        <div className={`splash-logo-wrap ${phase >= 1 ? 'splash-logo-in' : ''}`}>
          <div className="splash-logo-glow" />
          <img
            src={import.meta.env.BASE_URL + "logo.png"}
            alt="Brutal Local Fantasy"
            className="splash-logo"
          />
        </div>

        <div className={`splash-text ${phase >= 2 ? 'splash-text-in' : ''}`}>
          <div className="splash-name">
            <span className="splash-name-brutal">BRUTAL</span>
            <span className="splash-name-local">LOCAL FANTASY</span>
          </div>
        </div>

        <div className={`splash-tagline ${phase >= 3 ? 'splash-tagline-in' : ''}`}>
          Fantasy Cricket Redefined
        </div>

        <div className={`splash-loader ${phase >= 2 ? 'splash-loader-in' : ''}`}>
          <div className="splash-loader-track">
            <div className={`splash-loader-fill ${phase >= 2 ? 'splash-loader-go' : ''}`} />
          </div>
        </div>
      </div>

      <div className={`splash-footer ${phase >= 3 ? 'splash-footer-in' : ''}`}>
        <div className="splash-cricket-ball">
          <div className="splash-ball-seam" />
        </div>
      </div>
    </div>
  );
}
