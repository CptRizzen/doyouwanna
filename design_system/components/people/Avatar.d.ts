import * as React from 'react';

export type AvatarStatus = 'online' | 'away' | 'live';

/** A person: photo with initials fallback, optional circle ring + status dot. */
export interface AvatarProps {
  src?: string;
  /** Used for initials fallback and disc color. */
  name?: string;
  /** @default 44 */
  size?: number;
  /** Circle color token for the ring, e.g. "var(--circle-teal)". */
  ring?: string;
  status?: AvatarStatus;
  /** Override fallback disc color. */
  color?: string;
  style?: React.CSSProperties;
}

export function Avatar(props: AvatarProps): JSX.Element;
