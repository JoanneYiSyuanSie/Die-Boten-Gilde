import React from 'react';

interface FantasyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const FantasyButton: React.FC<FantasyButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "relative inline-flex items-center justify-center px-6 py-2 font-fantasy font-bold text-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border-2";
  
  const variants = {
    primary: "bg-[#8a1c1c] text-[#f3e5ab] border-[#2c1810] hover:bg-[#a62424]", // Red Wax Seal style
    secondary: "bg-[#2c1810] text-[#f3e5ab] border-[#8a1c1c] hover:bg-[#3e2318]", // Dark Leather style
    danger: "bg-red-900 text-white border-black hover:bg-red-800"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className} rounded-sm`} {...props}>
      {/* Decorative corners could go here */}
      {children}
    </button>
  );
};
