import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  useGradient?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 24, useGradient = false }) => {
  const id = React.useId();
  const gradientId = `logo-gradient-${id}`;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF3B30" /> {/* Red */}
            <stop offset="0.5" stopColor="#FF9500" /> {/* Orange */}
            <stop offset="1" stopColor="#FFCC00" /> {/* Yellow */}
        </linearGradient>
      </defs>

      {/* Main Body */}
      <path 
        d="M21.1 11.5C20.8 16.8 16.4 21 11 21C5.5 21 1 16.5 1 11C1 5.6 5.2 1.2 10.5 1V10.5H21.1Z" 
        fill={useGradient ? `url(#${gradientId})` : "currentColor"}
      />
      
      {/* Floating Segment */}
      <path 
        d="M22 8C22 8 22 3 17 3C17 3 13 3 13 7C13 7 13 8 13.5 8.5L22 8Z" 
        fill={useGradient ? `url(#${gradientId})` : "currentColor"}
        opacity="0.9"
      />
    </svg>
  );
};

export default Logo;