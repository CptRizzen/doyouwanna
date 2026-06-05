import * as React from 'react';

/**
 * The signature hero unit — activity photo, scrim, circle tag, who's-going stack.
 * @startingPoint section="App" subtitle="Event/plan card — photo, circle, going stack" viewport="380x300"
 */
export interface EventCardProps {
  image?: string;
  title: React.ReactNode;
  circle?: EventCircleRef;
  /** Time/date string, e.g. "Saturday · 7:00 AM". */
  time?: string;
  going?: EventPerson[];
  goingTotal?: number;
  /** Distance string, e.g. "2.4 km". */
  distance?: string;
  /** Show a live indicator. @default false */
  live?: boolean;
  onClick?: () => void;
  /** 'hero' (tall) or 'row' (compact). @default 'hero' */
  layout?: 'hero' | 'row';
  style?: React.CSSProperties;
}

export function EventCard(props: EventCardProps): JSX.Element;

export interface EventCircleRef { name: string; color?: string; }
export interface EventPerson { src?: string; name?: string; }
