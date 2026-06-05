import React from 'react';
import { Icon } from '../icon/Icon.jsx';

/**
 * ListRow — a settings / menu / detail row. Leading icon in a colored
 * tile, title + optional subtitle, and a trailing slot (chevron, value,
 * switch, badge). Tap target ≥ 56px.
 */
export function ListRow({
  icon,
  iconColor = 'var(--primary)',
  iconBg,                 // defaults to a tint of iconColor
  leading,                // custom leading node (e.g. Avatar) overrides icon
  title,
  subtitle,
  value,                  // right-aligned muted text
  trailing,               // custom right node (Switch, Badge…)
  chevron = false,
  danger = false,
  onClick,
  divider = false,
  style = {},
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, minHeight: 56, padding: '10px 4px',
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: divider ? '1px solid var(--divider)' : 'none',
        WebkitTapHighlightColor: 'transparent', ...style,
      }}
    >
      {leading || (icon && (
        <span style={{
          width: 38, height: 38, borderRadius: 'var(--radius-md)', flex: 'none',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: iconBg || (danger ? 'var(--danger-soft)' : `color-mix(in srgb, ${iconColor} 15%, white)`),
          color: danger ? 'var(--danger)' : iconColor,
        }}>
          <Icon name={icon} size={20} strokeWidth={2.2} />
        </span>
      ))}
      <span style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, flex: 1 }}>
        <span style={{
          fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15.5,
          color: danger ? 'var(--danger)' : 'var(--text-strong)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{title}</span>
        {subtitle && (
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</span>
        )}
      </span>
      {value && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', flex: 'none' }}>{value}</span>}
      {trailing}
      {chevron && <Icon name="chevron-right" size={20} color="var(--text-subtle)" strokeWidth={2.4} />}
    </div>
  );
}
