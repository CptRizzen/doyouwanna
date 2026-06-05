import React from 'react';

/**
 * Card — the default white rounded surface. Optional pressable behavior
 * (scales on tap), selectable border, and padding control.
 */
export function Card({
  children,
  elevation = 'md',      // none | sm | md | lg
  padding = 16,
  radius = 'var(--radius-card)',
  pressable = false,
  selected = false,
  onClick,
  style = {},
  ...rest
}) {
  const shadows = { none: 'none', sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)' };
  const [pressed, setPressed] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseDown={() => pressable && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        background: 'var(--surface-card)', borderRadius: radius, padding,
        boxShadow: shadows[elevation] ?? shadows.md,
        border: selected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
        cursor: (pressable || onClick) ? 'pointer' : 'default',
        transform: pressed ? 'scale(0.985)' : 'scale(1)',
        transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
