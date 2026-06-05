import React from 'react';

/**
 * SegmentedControl — iOS-style segmented switcher with a sliding thumb.
 * Use for view toggles (e.g. List / Map, Going / Maybe / Can't).
 */
export function SegmentedControl({
  options = [],          // [{ value, label }] or [string]
  value,
  defaultValue,
  onChange,
  size = 'md',
  style = {},
}) {
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const isControlled = value !== undefined;
  const [val, setVal] = React.useState(defaultValue ?? opts[0]?.value);
  const current = isControlled ? value : val;
  const idx = Math.max(0, opts.findIndex((o) => o.value === current));
  const h = size === 'sm' ? 34 : 42;

  const pick = (v) => { if (!isControlled) setVal(v); onChange && onChange(v); };

  return (
    <div style={{
      position: 'relative', display: 'inline-flex', height: h, padding: 4,
      background: 'var(--ink-100)', borderRadius: 'var(--radius-pill)',
      width: '100%', boxSizing: 'border-box', ...style,
    }}>
      <div style={{
        position: 'absolute', top: 4, bottom: 4, left: 4,
        width: `calc((100% - 8px) / ${opts.length})`,
        transform: `translateX(${idx * 100}%)`,
        background: 'var(--surface-card)', borderRadius: 'var(--radius-pill)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform var(--dur-base) var(--ease-spring)',
      }} />
      {opts.map((o) => (
        <button
          key={o.value} type="button" onClick={() => pick(o.value)}
          style={{
            position: 'relative', zIndex: 1, flex: 1, border: 'none', background: 'transparent',
            cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 700,
            fontSize: size === 'sm' ? 13 : 14, letterSpacing: '-0.01em',
            color: o.value === current ? 'var(--text-strong)' : 'var(--text-muted)',
            transition: 'color var(--dur-fast) var(--ease-out)', whiteSpace: 'nowrap',
            WebkitTapHighlightColor: 'transparent',
          }}
        >{o.label}</button>
      ))}
    </div>
  );
}
