import React from 'react';
import { Button } from '../actions/Button.jsx';
import { Icon } from '../icon/Icon.jsx';

/**
 * RSVPBar — the sticky bottom action bar on an event. Switches between
 * the three-state RSVP (Going / Maybe / Can't) and, once you're going,
 * the live "On my way" share toggle.
 */
export function RSVPBar({
  state,                  // null | 'going' | 'maybe' | 'cant'
  onRSVP,
  onMyWay,
  onWay = false,
  style = {},
}) {
  const Pill = ({ value, icon, label, color }) => {
    const on = state === value;
    return (
      <button onClick={() => onRSVP && onRSVP(value)}
        style={{ flex: 1, height: 50, borderRadius: 'var(--radius-pill)', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 15,
          border: on ? 'none' : '1.5px solid var(--border-default)',
          background: on ? color : 'var(--surface-card)',
          color: on ? '#fff' : 'var(--text-body)',
          boxShadow: on ? 'var(--shadow-sm)' : 'none',
          transition: 'all var(--dur-fast) var(--ease-out)' }}>
        <Icon name={icon} size={18} strokeWidth={2.4} /> {label}
      </button>
    );
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px 22px',
      background: 'var(--glass-light)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
      borderTop: '1px solid var(--border-subtle)', ...style,
    }}>
      {state === 'going' ? (
        <Button variant={onWay ? 'dark' : 'primary'} size="lg" block
          icon={onWay ? 'navigation' : 'navigation'} onClick={onMyWay}>
          {onWay ? "You're on the way · sharing live" : "I'm on my way"}
        </Button>
      ) : (
        <div style={{ display: 'flex', gap: 10 }}>
          <Pill value="going" icon="check" label="I'm in" color="var(--primary)" />
          <Pill value="maybe" icon="circle-help" label="Maybe" color="var(--warning)" />
          <Pill value="cant" icon="x" label="Can't" color="var(--ink-700)" />
        </div>
      )}
    </div>
  );
}
