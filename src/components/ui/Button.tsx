import React from 'react';

export type ButtonVariant = 'default' | 'primary' | 'soft' | 'ghost' | 'warn' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  icon,
  className = '',
  children,
  type = 'button',
  ...rest
}) => {
  const cls = [
    'rg-btn',
    variant !== 'default' ? `rg-btn--${variant}` : '',
    size === 'sm' ? 'rg-btn--sm' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button type={type} className={cls} {...rest}>
      {icon}
      {children}
    </button>
  );
};
