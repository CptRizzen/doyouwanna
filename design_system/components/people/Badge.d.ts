import * as React from 'react';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'live' | 'warning' | 'danger' | 'info';

/** Compact status/count token. `live` tone pulses. */
export interface BadgeProps {
  children?: React.ReactNode;
  /** @default 'neutral' */
  tone?: BadgeTone;
  /** @default 'soft' */
  variant?: 'soft' | 'solid' | 'outline';
  /** @default 'md' */
  size?: 'sm' | 'md';
  /** Show a leading status dot (pulses when tone="live"). */
  dot?: boolean;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Badge(props: BadgeProps): JSX.Element;
