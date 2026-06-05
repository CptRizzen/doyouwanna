import React from 'react';
import { AvatarStack } from '../people/AvatarStack.jsx';
import { Badge } from '../people/Badge.jsx';

/**
 * EventCard — the signature hero unit: activity photo, bottom-up scrim,
 * a glass circle tag, the time/title, and a "who's going" stack.
 * `layout="hero"` (tall) or `layout="row"` (compact horizontal).
 */
export function EventCard({
  image,
  title,
  circle,                 // { name, color }
  time,
  going = [],
  goingTotal,
  distance,
  live = false,
  onClick,
  layout = 'hero',
  style = {},
}) {
  const tag = circle && (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, height: 28, padding: '0 11px 0 8px',
      borderRadius: 'var(--radius-pill)', background: 'var(--glass-light)',
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12, color: 'var(--ink-900)', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: circle.color || 'var(--circle-coral)' }} />
      {circle.name}
    </span>
  );

  if (layout === 'row') {
    return (
      <div onClick={onClick} style={{
        display: 'flex', gap: 13, alignItems: 'center', padding: 10, background: 'var(--surface-card)',
        borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)',
        cursor: onClick ? 'pointer' : 'default', ...style,
      }}>
        <div style={{ width: 76, height: 76, borderRadius: 'var(--radius-md)', flex: 'none', overflow: 'hidden', background: 'linear-gradient(135deg,#FF7855,#C22E13)' }}>
          {image && <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: circle?.color || 'var(--circle-coral)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{circle?.name}</span>
            {live && <Badge tone="live" dot size="sm">Live</Badge>}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600 }}>{time}</span>
            {distance && <span style={{ fontSize: 12.5, color: 'var(--text-subtle)' }}>· {distance}</span>}
            <span style={{ marginLeft: 'auto' }}><AvatarStack people={going} size={22} max={3} total={goingTotal} /></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClick} style={{
      position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
      boxShadow: 'var(--shadow-lg)', aspectRatio: '4 / 3', minHeight: 200,
      background: 'linear-gradient(135deg,#FF7855,#C22E13)', cursor: onClick ? 'pointer' : 'default', ...style,
    }}>
      {image && <img src={image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
      <div style={{ position: 'absolute', inset: 0, background: 'var(--scrim-photo)' }} />
      <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between' }}>
        {tag}
        {live && <Badge tone="live" variant="solid" dot>Live now</Badge>}
      </div>
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 15, color: '#fff' }}>
        {time && <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.92 }}>{time}</div>}
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, lineHeight: 1.1, marginTop: 3 }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 11 }}>
          <AvatarStack people={going} size={26} max={4} total={goingTotal} label={goingTotal ? `${goingTotal} going` : undefined} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.3))' }} />
          {distance && <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, opacity: 0.95 }}>{distance}</span>}
        </div>
      </div>
    </div>
  );
}
