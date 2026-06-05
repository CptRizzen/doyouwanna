import React from 'react';

/**
 * Avatar — a person. Photo with graceful fallback to initials on a
 * circle-colored disc. Optional colored ring (their circle) and a
 * status dot (online / on-my-way / live).
 */
export function Avatar({
  src,
  name = '',
  size = 44,
  ring,             // circle color token value, e.g. 'var(--circle-teal)'
  status,           // 'online' | 'away' | 'live' | undefined
  color,            // fallback disc color
  style = {},
}) {
  const [failed, setFailed] = React.useState(false);
  const initials = name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const discColors = ['var(--circle-coral)','var(--circle-teal)','var(--circle-grape)','var(--circle-sky)','var(--circle-amber)','var(--circle-rose)'];
  const disc = color || discColors[(name.charCodeAt(0) || 0) % discColors.length];
  const statusColors = { online: 'var(--success)', live: 'var(--live)', away: 'var(--amber-400)' };
  const ringW = Math.max(2, Math.round(size * 0.06));
  const dot = Math.max(9, Math.round(size * 0.26));

  return (
    <span style={{ position: 'relative', display: 'inline-flex', flex: 'none', ...style }}>
      <span
        style={{
          width: size, height: size, borderRadius: '50%', overflow: 'hidden',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: disc, color: '#fff', fontFamily: 'var(--font-sans)',
          fontWeight: 700, fontSize: size * 0.4, letterSpacing: '-0.02em',
          boxSizing: 'border-box',
          border: ring ? `${ringW}px solid ${ring}` : 'none',
          boxShadow: ring ? '0 0 0 2px var(--surface-card)' : 'none',
        }}
      >
        {src && !failed
          ? <img src={src} alt={name} onError={() => setFailed(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span>{initials || '?'}</span>}
      </span>
      {status && (
        <span style={{
          position: 'absolute', right: -1, bottom: -1, width: dot, height: dot,
          borderRadius: '50%', background: statusColors[status] || 'var(--success)',
          border: '2.5px solid var(--surface-card)', boxSizing: 'border-box',
        }} />
      )}
    </span>
  );
}
