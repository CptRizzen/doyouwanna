import * as React from 'react';

/** The default white rounded surface. Optionally pressable / selectable. */
export interface CardProps {
  children?: React.ReactNode;
  /** @default 'md' */
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  /** @default 16 */
  padding?: number | string;
  /** @default 'var(--radius-card)' */
  radius?: string;
  /** Scale-on-tap feedback. @default false */
  pressable?: boolean;
  /** Coral selection border. @default false */
  selected?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card(props: CardProps): JSX.Element;
