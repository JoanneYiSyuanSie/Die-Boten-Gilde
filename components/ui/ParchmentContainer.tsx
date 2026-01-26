
import React from 'react';

export const ParchmentContainer: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => {
  return (
    // Changed p-8 to p-4 md:p-8 for responsive padding
    <div className={`relative p-4 md:p-8 bg-[#f3e5ab] text-[#2c1810] font-body rounded-lg shadow-2xl border-4 border-double border-[#2c1810] bg-paper-texture ${className}`}>
        {children}
    </div>
  );
};
