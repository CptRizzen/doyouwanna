import React from 'react';
import { Icon } from '../icon/Icon.jsx';

/**
 * IconButton — a square/circular tap target wrapping a single icon.
 * Used for nav bars, toolbars, map controls, close buttons.
 * Shapes: circle (default) | square. Tones: plain, soft, solid, glass, dark.
 */
export function IconButton({
  icon,
  size = 44,
  iconSize,
  tone = 'plain',
  shape = 'circle',
  label,
  disabled = false,
  onClick,
  style = {},
  ...rest
}) {
  const tones = {
    plain: { background: 'transparent', color: 'var(--text-strong)', border: 'none' },
    soft:  { background: 'var(--ink-100)', color: 'var(--text-strong)', border: 'none' },
    solid: { background: 'var(--primary)', color: '#fff', border: 'none', boxShadow: 'var(--shadow-primary-sm)' },
    glass: { background: 'var(--glass-light)', color: 'var(--ink-900)', border: 'none', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' },
    dark:  { background: 'var(--ink-900)', color: '#fff', border: 'none' },
  };
  const t = tones[tone] || tones.plain;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label || icon}
      className={`dyw-iconbtn dyw-iconbtn--${tone}`}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size,
        borderRadius: shape === 'square' ? 'var(--radius-md)' : 'var(--radius-pill)',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
        transition: 'transform var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)',
        WebkitTapHighlightColor: 'transparent',
        ...t, ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.9)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      {...rest}
    >
      <Icon name={icon} size={iconSize || Math.round(size * 0.46)} strokeWidth={2.2} />
    </button>
  );
}
