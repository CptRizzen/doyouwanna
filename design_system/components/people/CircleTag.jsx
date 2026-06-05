import React from 'react';

/**
 * CircleTag — a pill identifying a friend circle by its color + name.
 * Used as a chip on cards, filters, and headers. Selectable variant
 * for filter rows.
 */
export function CircleTag({
  name,
  color = 'var(--circle-coral)',
  size = 'md',
  selected = false,
  onClick,
  icon,             // optional small leading glyph (emoji/char) instead of dot
  style = {},
}) {
  const sizes = { sm: { h: 26, fs: 12, px: 9, dot: 8 }, md: { h: 32, fs: 13, px: 11, dot: 9 }, lg: { h: 38, fs: 14, px: 13, dot: 10 } };
  const s = sizes[size] || sizes.md;
  const clickable = !!onClick;

  return (
    <span
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      className="dyw-circletag"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, height: s.h,
        padding: `0 ${s.px + 2}px 0 ${s.px}px`, borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: s.fs,
        cursor: clickable ? 'pointer' : 'default', userSelect: 'none',
        whiteSpace: 'nowrap',
        background: selected ? color : 'var(--ink-100)',
        color: selected ? '#fff' : 'var(--text-body)',
        boxShadow: selected ? 'var(--shadow-sm)' : 'none',
        transition: 'background var(--dur-fast) var(--ease-out)',
        ...style,
      }}
    >
      {icon
        ? <span style={{ fontSize: s.fs + 1 }}>{icon}</span>
        : <span style={{ width: s.dot, height: s.dot, borderRadius: '50%', background: selected ? 'rgba(255,255,255,0.9)' : color, flex: 'none' }} />}
      {name}
    </span>
  );
}
