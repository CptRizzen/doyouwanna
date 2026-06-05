import * as React from 'react';

export interface SegmentOption { value: string; label: string; }

/** iOS-style segmented switcher with sliding thumb. Full-width by default. */
export interface SegmentedControlProps {
  /** Array of `{value,label}` or plain strings. */
  options: (SegmentOption | string)[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** @default 'md' */
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export function SegmentedControl(props: SegmentedControlProps): JSX.Element;
