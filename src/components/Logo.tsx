import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className = '', size = 'md' }: LogoProps) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizes[size]} bg-[#7F56D9] rounded-2xl flex items-center justify-center relative`}>
        <div className="text-white font-bold text-2xl">
          CTE
        </div>
        <div className="absolute -right-1 -top-1 w-3 h-3 bg-white rounded-full" />
        <div className="absolute -left-1 -bottom-1 w-2 h-2 bg-white rounded-full" />
      </div>
    </div>
  );
};