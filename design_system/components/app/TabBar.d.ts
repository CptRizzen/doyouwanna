import * as React from 'react';

export interface TabItem {
  key: string;
  /** Lucide icon name. */
  icon: string;
  label: string;
  /** Optional notification count/dot. */
  badge?: number | string;
}

/** iOS bottom navigation with an optional raised coral center action. */
export interface TabBarProps {
  items: TabItem[];
  active: string;
  onChange?: (key: string) => void;
  /** Raise the middle item into a floating coral button. @default true */
  raisedCenter?: boolean;
  style?: React.CSSProperties;
}

export function TabBar(props: TabBarProps): JSX.Element;
