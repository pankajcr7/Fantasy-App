import { X } from 'lucide-react';

export default function TeamPreviewModal({ players, selected, captain, viceCaptain, match, onClose }) {
  const teamPlayers = players.filter(p => selected.includes(p.id));
  const creditsUsed = teamPlayers.reduce((s, p) => s + p.credits, 0);

  const grouped = { WK: [], BAT: [], AR: [], BOWL: [] };
  teamPlayers.forEach(p => {
    if (grouped[p.role]) grouped[p.role].push(p);
  });

  const team1Players = match ? teamPlayers.filter(p => match.team1Players?.includes(p.id)) : [];
  const team2Players = match ? teamPlayers.filter(p => match.team2Players?.includes(p.id)) : [];

  const roleLabels = { WK: 'Wicket-Keepers', BAT: 'Batsmen', AR: 'All-Rounders', BOWL: 'Bowlers' };
  const roleColors = { WK: '#f4a261', BAT: '#e63946', AR: '#2ec4b6', BOWL: '#8264ff' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '92vh', borderRadius: '24px 24px 0 0' }}>
        <div className="modal-handle" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="modal-title" style={{ margin: 0 }}>Team Preview</div>
          <button
            onClick={onClose}
            style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, padding: '10px 12px', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Players</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)' }}>{teamPlayers.length}</div>
          </div>
          <div style={{ flex: 1, padding: '10px 12px', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Credits</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--gold)' }}>{creditsUsed.toFixed(1)}</div>
          </div>
          {match && (
            <>
              <div style={{ flex: 1, padding: '10px 12px', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>{match.team1}</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{team1Players.length}</div>
              </div>
              <div style={{ flex: 1, padding: '10px 12px', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>{match.team2}</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{team2Players.length}</div>
              </div>
            </>
          )}
        </div>

        <div style={{ background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #0f3460, #1a1a2e)', padding: '14px 16px', display: 'flex', justifyContent: 'center', gap: 24 }}>
            {Object.entries(grouped).map(([role, arr]) => (
              <div key={role} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: roleColors[role], letterSpacing: 0.5, textTransform: 'uppercase' }}>{role}</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{arr.length}</div>
              </div>
            ))}
          </div>

          {Object.entries(grouped).map(([role, arr]) => (
            arr.length > 0 && (
              <div key={role}>
                <div style={{ padding: '10px 16px 4px', fontSize: 11, fontWeight: 700, color: roleColors[role], letterSpacing: 0.5, textTransform: 'uppercase', background: 'rgba(255,255,255,0.02)' }}>
                  {roleLabels[role]} ({arr.length})
                </div>
                {arr.map(player => {
                  const isCaptain = captain === player.id;
                  const isVC = viceCaptain === player.id;
                  return (
                    <div key={player.id} style={{
                      display: 'flex', alignItems: 'center', padding: '10px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      background: isCaptain ? 'rgba(230,57,70,0.06)' : isVC ? 'rgba(244,162,97,0.06)' : 'transparent'
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', background: 'var(--bg3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginRight: 10,
                        overflow: 'hidden', flexShrink: 0,
                        border: isCaptain ? '2px solid var(--primary)' : isVC ? '2px solid var(--gold)' : '2px solid transparent'
                      }}>
                        {player.image
                          ? <img src={player.image} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={e => { e.target.style.display = 'none'; e.target.parentElement.textContent = player.name[0]; }} />
                          : player.name[0]
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.name}</span>
                          {isCaptain && <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 4, background: 'var(--primary)', color: 'white' }}>C</span>}
                          {isVC && <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 4, background: 'var(--gold)', color: 'white' }}>VC</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 5px', borderRadius: 3, background: 'rgba(230,57,70,0.12)', color: 'var(--primary)' }}>{player.team}</span>
                          <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                            {player.role === 'BOWL'
                              ? `${player.stats?.wickets || 0} wkts`
                              : `Avg: ${player.stats?.avg || '-'}`
                            }
                          </span>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gold)', flexShrink: 0 }}>
                        {player.credits}
                        <span style={{ fontSize: 9, color: 'var(--text3)', marginLeft: 2 }}>CR</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ))}
        </div>

        {(captain || viceCaptain) && (
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {captain && (() => {
              const cp = teamPlayers.find(p => p.id === captain);
              return cp ? (
                <div style={{ flex: 1, padding: 12, background: 'rgba(230,57,70,0.08)', borderRadius: 12, border: '1px solid rgba(230,57,70,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>C</div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>Captain (2x)</div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{cp.name}</div>
                  </div>
                </div>
              ) : null;
            })()}
            {viceCaptain && (() => {
              const vp = teamPlayers.find(p => p.id === viceCaptain);
              return vp ? (
                <div style={{ flex: 1, padding: 12, background: 'rgba(244,162,97,0.08)', borderRadius: 12, border: '1px solid rgba(244,162,97,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>VC</div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>Vice Captain (1.5x)</div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{vp.name}</div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
