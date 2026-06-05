import React from 'react';
import { Avatar } from './Avatar.jsx';

/**
 * AvatarStack — overlapping row of people who are going / in a circle,
 * with an optional "+N" overflow chip. The signature "who's coming" UI.
 */
export function AvatarStack({
  people = [],       // [{ src, name }]
  size = 28,
  max = 4,
  total,             // optional explicit total; else people.length
  label,             // optional trailing text e.g. "going"
  style = {},
}) {
  const shown = people.slice(0, max);
  const count = (total != null ? total : people.length) - shown.length;
  const overlap = Math.round(size * 0.32);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...style }}>
      <span style={{ display: 'inline-flex' }}>
        {shown.map((p, i) => (
          <span key={i} style={{ marginLeft: i === 0 ? 0 : -overlap, position: 'relative', zIndex: i }}>
            <Avatar src={p.src} name={p.name} size={size}
              style={{ boxShadow: '0 0 0 2.5px var(--surface-card)', borderRadius: '50%' }} />
          </span>
        ))}
        {count > 0 && (
          <span style={{
            marginLeft: -overlap, height: size, minWidth: size, padding: '0 7px',
            borderRadius: 'var(--radius-pill)', background: 'var(--ink-900)', color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: size * 0.38,
            boxShadow: '0 0 0 2.5px var(--surface-card)', position: 'relative', zIndex: 99,
          }}>+{count}</span>
        )}
      </span>
      {label && (
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      )}
    </span>
  );
}
