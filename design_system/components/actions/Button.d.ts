import * as React from 'react';

export type ButtonVariant = 'primary' | 'accent' | 'dark' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * The primary tappable action. Pill-shaped, bubbly, with a coral glow on primary.
 * @startingPoint section="Actions" subtitle="Pill button — primary, accent, ghost, danger" viewport="700x150"
 */
export interface ButtonProps {
  children?: React.ReactNode;
  /** Visual style. @default 'primary' */
  variant?: ButtonVariant;
  /** @default 'md' */
  size?: ButtonSize;
  /** Lucide icon name shown before the label. */
  icon?: string;
  /** Lucide icon name shown after the label. */
  trailingIcon?: string;
  /** Fill the container width. @default false */
  block?: boolean;
  /** Show a spinner and disable. @default false */
  loading?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
}

export function Button(props: ButtonProps): JSX.Element;
