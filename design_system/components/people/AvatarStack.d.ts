import * as React from 'react';

export interface StackPerson { src?: string; name?: string; }

/** Overlapping "who's going" avatar row with optional +N overflow chip. */
export interface AvatarStackProps {
  people?: StackPerson[];
  /** @default 28 */
  size?: number;
  /** Max faces before collapsing to +N. @default 4 */
  max?: number;
  /** Explicit total for the +N math; defaults to people.length. */
  total?: number;
  /** Trailing caption, e.g. "going". */
  label?: string;
  style?: React.CSSProperties;
}

export function AvatarStack(props: AvatarStackProps): JSX.Element;
