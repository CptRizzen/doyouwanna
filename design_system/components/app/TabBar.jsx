import React from 'react';
import { Icon } from '../icon/Icon.jsx';

/**
 * TabBar — the iOS bottom navigation. A center "create" action can be
 * raised into a floating coral button. Frosted-glass background.
 */
export function TabBar({
  items = [],            // [{ key, icon, label, badge }]
  active,
  onChange,
  raisedCenter = true,   // raise the middle item as a coral FAB
  style = {},
}) {
  const centerIdx = raisedCenter ? Math.floor(items.length / 2) : -1;

  return (
    <nav style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around',
      padding: '10px 8px 0', height: 'var(--tabbar-height)', boxSizing: 'border-box',
      background: 'var(--glass-light)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
      borderTop: '1px solid var(--border-subtle)', ...style,
    }}>
      {items.map((it, i) => {
        const on = it.key === active;
        if (i === centerIdx) {
          return (
            <button key={it.key} onClick={() => onChange && onChange(it.key)} aria-label={it.label}
              style={{ position: 'relative', top: -14, width: 58, height: 58, borderRadius: 'var(--radius-pill)',
                border: '4px solid var(--surface-page)', background: 'var(--primary)', color: '#fff',
                boxShadow: 'var(--shadow-primary)', cursor: 'pointer', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Icon name={it.icon} size={26} strokeWidth={2.6} />
            </button>
          );
        }
        return (
          <button key={it.key} onClick={() => onChange && onChange(it.key)} aria-label={it.label}
            style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'transparent', border: 'none', cursor: 'pointer', flex: 1, padding: '2px 0',
              color: on ? 'var(--primary)' : 'var(--text-subtle)', WebkitTapHighlightColor: 'transparent' }}>
            <span style={{ position: 'relative' }}>
              <Icon name={it.icon} size={24} strokeWidth={on ? 2.6 : 2.1} />
              {it.badge != null && (
                <span style={{ position: 'absolute', top: -4, right: -8, minWidth: 16, height: 16, padding: '0 4px',
                  borderRadius: 'var(--radius-pill)', background: 'var(--primary)', color: '#fff', fontSize: 10,
                  fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--surface-page)', boxSizing: 'border-box' }}>{it.badge}</span>
              )}
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.01em' }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
