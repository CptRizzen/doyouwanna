import * as React from 'react';

export type RSVPState = null | 'going' | 'maybe' | 'cant';

/** Sticky bottom RSVP / "on my way" action bar for an event. */
export interface RSVPBarProps {
  state?: RSVPState;
  onRSVP?: (state: 'going' | 'maybe' | 'cant') => void;
  onMyWay?: () => void;
  /** Whether the user has tapped "on my way" (live sharing). @default false */
  onWay?: boolean;
  style?: React.CSSProperties;
}

export function RSVPBar(props: RSVPBarProps): JSX.Element;
