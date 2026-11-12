import React from 'react';

export type CalloutTone = 'info' | 'warn' | 'danger' | 'success' | 'caution';

interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: CalloutTone;
  icon?: React.ReactNode;
}

export const Callout: React.FC<CalloutProps> = ({ tone = 'info', icon, className = '', children, ...rest }) => (
  <div className={`rg-callout rg-callout--${tone} ${className}`.trim()} {...rest}>
    {icon}
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);
