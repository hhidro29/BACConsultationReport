import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLElement> & { as?: 'section' | 'div' }> = ({
  as: Tag = 'section',
  className = '',
  children,
  ...rest
}) => (
  <Tag className={`rg-card ${className}`.trim()} {...rest}>
    {children}
  </Tag>
);

interface SectionHeaderProps {
  title: React.ReactNode;
  hint?: React.ReactNode;
  level?: 2 | 3;
  right?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, hint, level = 2, right }) => {
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <div className="rg-section-head">
      <Heading>
        {title}
        {hint ? <span className="rg-hint"> {hint}</span> : null}
      </Heading>
      {right}
    </div>
  );
};
