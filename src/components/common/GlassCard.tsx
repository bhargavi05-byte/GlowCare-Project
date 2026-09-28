import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'elevated' | 'dark';
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'default',
  hoverEffect = false,
  onClick
}) => {
  let baseStyle = 'glass-panel rounded-2xl transition-all duration-300';

  if (variant === 'subtle') {
    baseStyle = 'glass-panel-subtle rounded-2xl transition-all duration-300';
  } else if (variant === 'elevated') {
    baseStyle = 'bg-white/80 backdrop-blur-xl border border-white/90 shadow-xl shadow-rose-900/5 rounded-3xl transition-all duration-300';
  } else if (variant === 'dark') {
    baseStyle = 'glass-panel-dark text-white rounded-2xl transition-all duration-300';
  }

  const hoverStyle = hoverEffect
    ? 'hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-500/10 hover:border-rose-200/60 cursor-pointer'
    : '';

  return (
    <div
      onClick={onClick}
      className={`${baseStyle} ${hoverStyle} ${className}`}
    >
      {children}
    </div>
  );
};
