
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'shimmer' | 'dark';
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, variant = 'default' }) => {
  const variantClasses = {
    default: 'cultural-glass',
    shimmer: 'cultural-glass shimmer-titanium',
    dark: 'bg-black/40 border border-white/10 backdrop-blur-2xl'
  };

  return (
    <div 
      onClick={onClick}
      className={`rounded-[2.5rem] p-8 transition-all duration-500 group ${variantClasses[variant]} ${onClick ? 'cursor-pointer hover:scale-[1.02] hover:border-white/20 active:scale-95' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
