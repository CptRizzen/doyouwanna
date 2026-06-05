import * as React from 'react';

/** A settings / menu / detail row: leading icon tile, title+subtitle, trailing slot. */
export interface ListRowProps {
  /** Leading Lucide icon name (rendered in a colored tile). */
  icon?: string;
  /** @default 'var(--primary)' */
  iconColor?: string;
  iconBg?: string;
  /** Custom leading node (e.g. <Avatar/>) — overrides icon. */
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-aligned muted value text. */
  value?: React.ReactNode;
  /** Custom right node (Switch, Badge, Button…). */
  trailing?: React.ReactNode;
  /** Show a trailing chevron. @default false */
  chevron?: boolean;
  /** Red destructive styling. @default false */
  danger?: boolean;
  onClick?: () => void;
  /** Hairline divider below. @default false */
  divider?: boolean;
  style?: React.CSSProperties;
}

export function ListRow(props: ListRowProps): JSX.Element;
