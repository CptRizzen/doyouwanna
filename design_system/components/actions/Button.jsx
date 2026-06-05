import React from 'react';
import { Icon } from '../icon/Icon.jsx';

/**
 * Button — the primary action primitive.
 * Variants: primary (coral fill + glow), secondary (ink outline),
 * ghost (transparent), accent (amber), danger (red), dark (ink fill).
 * Sizes: sm, md, lg. Pill-shaped by default (the bubbly brand).
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,            // lucide name (string) on the left
  trailingIcon,    // lucide name on the right
  block = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { h: 36, px: 16, fs: 14, gap: 6, ic: 16 },
    md: { h: 48, px: 22, fs: 16, gap: 8, ic: 19 },
    lg: { h: 56, px: 28, fs: 17, gap: 9, ic: 21 },
  };
  const s = sizes[size] || sizes.md;

  const variants = {
    primary: { background: 'var(--primary)', color: 'var(--on-primary)', boxShadow: 'var(--shadow-primary)', border: 'none' },
    accent:  { background: 'var(--accent)', color: 'var(--ink-900)', boxShadow: 'var(--shadow-accent)', border: 'none' },
    dark:    { background: 'var(--ink-900)', color: 'var(--text-on-dark)', boxShadow: 'var(--shadow-md)', border: 'none' },
    secondary: { background: 'var(--surface-card)', color: 'var(--text-strong)', boxShadow: 'none', border: '1.5px solid var(--border-default)' },
    ghost:   { background: 'transparent', color: 'var(--primary)', boxShadow: 'none', border: 'none' },
    danger:  { background: 'var(--danger)', color: '#fff', boxShadow: 'none', border: 'none' },
  };
  const v = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`dyw-btn dyw-btn--${variant}`}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: s.gap, height: s.h, padding: `0 ${s.px}px`, minWidth: s.h,
        width: block ? '100%' : 'auto',
        fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: s.fs,
        letterSpacing: '-0.01em', borderRadius: 'var(--radius-pill)',
        whiteSpace: 'nowrap',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'transform var(--dur-fast) var(--ease-out), filter var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
        WebkitTapHighlightColor: 'transparent', userSelect: 'none',
        ...v, ...style,
      }}
      onMouseDown={(e) => { if (!disabled && !loading) e.currentTarget.style.transform = 'scale(0.96)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      {...rest}
    >
      {loading ? (
        <span className="dyw-btn__spinner" style={{
          width: s.ic, height: s.ic, borderRadius: '50%',
          border: '2.5px solid currentColor', borderTopColor: 'transparent',
          animation: 'dyw-spin 0.7s linear infinite', opacity: 0.9,
        }} />
      ) : (
        <>
          {icon && <Icon name={icon} size={s.ic} strokeWidth={2.4} />}
          {children}
          {trailingIcon && <Icon name={trailingIcon} size={s.ic} strokeWidth={2.4} />}
        </>
      )}
      <style>{`@keyframes dyw-spin{to{transform:rotate(360deg)}}`}</style>
    </button>
  );
}
