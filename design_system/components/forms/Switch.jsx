import React from 'react';

/**
 * Switch — iOS-style toggle. Controlled or uncontrolled. Coral when on.
 * Use for privacy toggles like Discovery and Live location.
 */
export function Switch({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  color = 'var(--primary)',
  size = 'md',
  style = {},
}) {
  const isControlled = checked !== undefined;
  const [on, setOn] = React.useState(defaultChecked);
  const val = isControlled ? checked : on;
  const dims = size === 'sm' ? { w: 42, h: 26, knob: 20 } : { w: 52, h: 32, knob: 26 };
  const pad = (dims.h - dims.knob) / 2;

  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setOn(!val);
    onChange && onChange(!val);
  };

  return (
    <button
      type="button" role="switch" aria-checked={val} onClick={toggle} disabled={disabled}
      style={{
        position: 'relative', width: dims.w, height: dims.h, flex: 'none',
        borderRadius: 'var(--radius-pill)', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: val ? color : 'var(--ink-300)', opacity: disabled ? 0.5 : 1, padding: 0,
        transition: 'background var(--dur-base) var(--ease-out)',
        WebkitTapHighlightColor: 'transparent', ...style,
      }}
    >
      <span style={{
        position: 'absolute', top: pad, left: val ? dims.w - dims.knob - pad : pad,
        width: dims.knob, height: dims.knob, borderRadius: '50%', background: '#fff',
        boxShadow: '0 2px 5px rgba(23,20,15,0.25)',
        transition: 'left var(--dur-base) var(--ease-spring)',
      }} />
    </button>
  );
}
