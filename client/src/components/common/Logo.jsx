import React from 'react';

export default function Logo({ className = "w-8 h-8" }) {
  return (
    <svg 
      className={`${className} shadow-md`}
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="26" fill="url(#logo-grad)" />
      {/* Styled vector trend arrow */}
      <path 
        d="M28 72L48 52L62 64L78 38" 
        stroke="white" 
        strokeWidth="9" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M60 38H78V56" 
        stroke="white" 
        strokeWidth="9" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f46e5" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
