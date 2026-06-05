import * as React from 'react';

/** iOS-style toggle. Coral when on. Controlled (`checked`) or uncontrolled. */
export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  /** Track color when on. @default 'var(--primary)' */
  color?: string;
  /** @default 'md' */
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export function Switch(props: SwitchProps): JSX.Element;
