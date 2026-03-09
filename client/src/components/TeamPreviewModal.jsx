import { X } from 'lucide-react';

export default function TeamPreviewModal({ players, selected, captain, viceCaptain, match, onClose }) {
  const teamPlayers = players.filter(p => selected.includes(p.id));
  const creditsUsed = teamPlayers.reduce((s, p) => s + p.credits, 0);

  const grouped = { WK: [], BAT: [], AR: [], BOWL: [] };
  teamPlayers.forEach(p => { if (grouped[p.role]) grouped[p.role].push(p); });

  const team1Count = match ? teamPlayers.filter(p => match.team1Players?.includes(p.id)).length : 0;
  const team2Count = match ? teamPlayers.filter(p => match.team2Players?.includes(p.id)).length : 0;

  const isTeam1 = (pid) => match?.team1Players?.includes(pid);

  return (
    <div className="tp-overlay" onClick={onClose}>
      <div className="tp-container" onClick={e => e.stopPropagation()}>

        <div className="tp-header">
          <div className="tp-header-left">
            {match && (
              <div className="tp-team-split">
                <span className="tp-team-badge tp-team1">{match.team1} <strong>{team1Count}</strong></span>
                <span className="tp-team-badge tp-team2">{match.team2} <strong>{team2Count}</strong></span>
              </div>
            )}
          </div>
          <div className="tp-credits-pill">{creditsUsed.toFixed(1)} / 100</div>
          <button className="tp-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="tp-field">
          <div className="tp-pitch">
            <div className="tp-pitch-inner" />
            <div className="tp-pitch-crease tp-crease-top" />
            <div className="tp-pitch-crease tp-crease-bot" />
          </div>

          <div className="tp-boundary" />

          {Object.entries(grouped).map(([role, arr]) => (
            arr.length > 0 && (
              <div key={role} className={`tp-role-row tp-row-${role.toLowerCase()}`}>
                <div className="tp-role-label">
                  {role === 'WK' ? 'WICKET-KEEPERS' : role === 'BAT' ? 'BATTERS' : role === 'AR' ? 'ALL-ROUNDERS' : 'BOWLERS'}
                </div>
                <div className="tp-players-row">
                  {arr.map(p => {
                    const isCap = captain === p.id;
                    const isVc = viceCaptain === p.id;
                    const t1 = isTeam1(p.id);
                    return (
                      <div key={p.id} className="tp-player">
                        {(isCap || isVc) && (
                          <div className={`tp-cv-badge ${isCap ? 'tp-cap' : 'tp-vc'}`}>
                            {isCap ? 'C' : 'VC'}
                          </div>
                        )}
                        <div className={`tp-player-img ${t1 ? 'tp-img-team1' : 'tp-img-team2'}`}>
                          {p.image
                            ? <img src={p.image} alt={p.name} onError={e => { e.target.style.display = 'none'; e.target.parentElement.textContent = p.name[0]; }} />
                            : p.name[0]
                          }
                        </div>
                        <div className={`tp-player-name ${t1 ? 'tp-name-team1' : 'tp-name-team2'}`}>
                          {p.name.split(' ').length > 1
                            ? `${p.name.split(' ')[0][0]} ${p.name.split(' ').slice(-1)[0]}`
                            : p.name
                          }
                        </div>
                        <div className="tp-player-credits">{p.credits} Cr</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
