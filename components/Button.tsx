import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'premium';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-8 py-4 font-bold tracking-wider uppercase transition-all duration-300 text-sm md:text-base clip-path-slant";
  
  const variants = {
    primary: "bg-transparent border-2 border-neon text-neon hover:bg-neon hover:text-darkbg neon-glow",
    secondary: "bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-darkbg gold-glow",
    outline: "bg-transparent border border-silver text-silver hover:border-white hover:text-white",
  };

  return (
    <button 
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;