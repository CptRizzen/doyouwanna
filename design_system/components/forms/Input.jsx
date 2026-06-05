import React from 'react';
import { Icon } from '../icon/Icon.jsx';

/**
 * Input — text field with optional label, leading Lucide icon, helper/error.
 * Soft warm well by default; focuses with a coral ring.
 */
export function Input({
  label,
  value,
  defaultValue,
  placeholder,
  icon,
  type = 'text',
  helper,
  error,
  disabled = false,
  onChange,
  trailing,        // node rendered at the right (e.g. a clear button)
  style = {},
  inputStyle = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const borderCol = error ? 'var(--danger)' : focus ? 'var(--primary)' : 'transparent';
  const ring = error ? 'rgba(224,50,43,0.18)' : focus ? 'var(--focus-ring)' : 'transparent';

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7, width: '100%', ...style }}>
      {label && (
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13, color: 'var(--text-strong)' }}>{label}</span>
      )}
      <span style={{
        display: 'flex', alignItems: 'center', gap: 10, height: 52, padding: '0 16px',
        background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)',
        border: `1.5px solid ${borderCol}`, boxShadow: `0 0 0 4px ${ring}`,
        transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
        opacity: disabled ? 0.5 : 1,
      }}>
        {icon && <Icon name={icon} size={20} color={focus ? 'var(--primary)' : 'var(--text-muted)'} strokeWidth={2.2} />}
        <input
          type={type} value={value} defaultValue={defaultValue} placeholder={placeholder}
          disabled={disabled} onChange={onChange}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 500,
            color: 'var(--text-strong)', minWidth: 0, ...inputStyle,
          }}
          {...rest}
        />
        {trailing}
      </span>
      {(helper || error) && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 500, color: error ? 'var(--danger)' : 'var(--text-muted)' }}>
          {error || helper}
        </span>
      )}
    </label>
  );
}
