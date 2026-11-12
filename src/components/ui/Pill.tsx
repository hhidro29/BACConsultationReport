import React from 'react';

export type PillTone = 'done' | 'near' | 'mid' | 'far' | 'primary' | 'neutral';

interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: PillTone;
}

export const Pill: React.FC<PillProps> = ({ tone = 'neutral', className = '', children, ...rest }) => (
  <span className={`rg-pill rg-pill--${tone} ${className}`.trim()} {...rest}>
    {children}
  </span>
);

export const Tag: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className = '', children, ...rest }) => (
  <span className={`rg-tag ${className}`.trim()} {...rest}>
    {children}
  </span>
);

/** Same bands as getZoneFromGap: >=0 done, -1..-30 near, -31..-90 mid, below -90 far. */
export function toneForGap(gap: number): PillTone {
  if (gap >= 0) return 'done';
  if (gap >= -30) return 'near';
  if (gap >= -90) return 'mid';
  return 'far';
}
