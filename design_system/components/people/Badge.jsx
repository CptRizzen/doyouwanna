import React from 'react';

/**
 * Badge — compact status/count token. Tones map to the status palette.
 * Use `dot` for a tiny indicator, `count` for numeric notification badges.
 */
export function Badge({
  children,
  tone = 'neutral',   // neutral | primary | success | live | warning | danger | info
  variant = 'soft',   // soft | solid | outline
  size = 'md',        // sm | md
  dot = false,
  icon,               // small leading glyph node
  style = {},
}) {
  const palette = {
    neutral: { soft: ['var(--ink-100)', 'var(--text-body)'], solid: ['var(--ink-900)', '#fff'], base: 'var(--ink-400)' },
    primary: { soft: ['var(--primary-soft)', 'var(--coral-700)'], solid: ['var(--primary)', '#fff'], base: 'var(--primary)' },
    success: { soft: ['var(--success-soft)', 'var(--green-600)'], solid: ['var(--success)', '#fff'], base: 'var(--success)' },
    live:    { soft: ['var(--success-soft)', 'var(--green-600)'], solid: ['var(--live)', '#fff'], base: 'var(--live)' },
    warning: { soft: ['var(--warning-soft)', 'var(--amber-700)'], solid: ['var(--warning)', 'var(--ink-900)'], base: 'var(--warning)' },
    danger:  { soft: ['var(--danger-soft)', 'var(--red-600)'], solid: ['var(--danger)', '#fff'], base: 'var(--danger)' },
    info:    { soft: ['var(--info-soft)', 'var(--sky-600)'], solid: ['var(--info)', '#fff'], base: 'var(--info)' },
  };
  const p = palette[tone] || palette.neutral;
  const s = size === 'sm' ? { h: 18, fs: 11, px: 7 } : { h: 22, fs: 12, px: 9 };
  const isLive = tone === 'live';

  let bg, fg, border = 'none';
  if (variant === 'solid') { [bg, fg] = p.solid; }
  else if (variant === 'outline') { bg = 'transparent'; fg = p.soft[1]; border = `1.5px solid ${p.base}`; }
  else { [bg, fg] = p.soft; }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, height: s.h,
      padding: `0 ${s.px}px`, borderRadius: 'var(--radius-pill)', border,
      background: bg, color: fg, fontFamily: 'var(--font-sans)', fontWeight: 700,
      fontSize: s.fs, letterSpacing: '0.01em', whiteSpace: 'nowrap', ...style,
    }}>
      {dot && (
        <span className={isLive ? 'dyw-livedot' : undefined}
          style={{ width: 7, height: 7, borderRadius: '50%', background: variant === 'solid' ? '#fff' : p.base, flex: 'none' }} />
      )}
      {icon}
      {children}
    </span>
  );
}
