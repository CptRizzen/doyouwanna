import * as React from 'react';

/** Inline icon from the Lucide set. Requires the Lucide UMD script on the page. */
export interface IconProps {
  /** Lucide icon name, e.g. "map-pin", "users", "plus". */
  name: string;
  /** @default 20 */
  size?: number;
  /** @default 2 */
  strokeWidth?: number;
  /** @default 'currentColor' */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Icon(props: IconProps): JSX.Element;
