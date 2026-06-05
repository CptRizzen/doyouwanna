import * as React from 'react';

export type IconButtonTone = 'plain' | 'soft' | 'solid' | 'glass' | 'dark';
export type IconButtonShape = 'circle' | 'square';

/** A single-icon tap target for nav bars, toolbars, and map controls. */
export interface IconButtonProps {
  /** Lucide icon name. */
  icon: string;
  /** Square px size of the tap target. @default 44 */
  size?: number;
  /** Override the rendered icon size. */
  iconSize?: number;
  /** @default 'plain' */
  tone?: IconButtonTone;
  /** @default 'circle' */
  shape?: IconButtonShape;
  /** Accessible label. */
  label?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

export function IconButton(props: IconButtonProps): JSX.Element;
