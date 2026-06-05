import * as React from 'react';

/**
 * A pill identifying a friend circle by color + name. Selectable for filter rows.
 * @startingPoint section="People" subtitle="Friend-circle pill — color dot + name" viewport="700x120"
 */
export interface CircleTagProps {
  name: string;
  /** Circle color token value. @default 'var(--circle-coral)' */
  color?: string;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Filled (active filter) vs neutral. @default false */
  selected?: boolean;
  /** Optional leading glyph instead of the color dot. */
  icon?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function CircleTag(props: CircleTagProps): JSX.Element;
