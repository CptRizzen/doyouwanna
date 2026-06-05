import * as React from 'react';

/** Text field with optional label, leading icon, helper/error. Coral focus ring. */
export interface InputProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  /** Leading Lucide icon name. */
  icon?: string;
  type?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Node rendered at the right edge. */
  trailing?: React.ReactNode;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}

export function Input(props: InputProps): JSX.Element;
