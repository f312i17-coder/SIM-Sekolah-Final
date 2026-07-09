import React from 'react';

export const SchoolLogo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      viewBox="0 0 400 500" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        {/* Real drop shadow for high-end feel */}
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      {/* Golden Outer Shield Base */}
      <path 
        d="M 200 470 C 275 420, 360 320, 360 140 L 360 80 L 200 80 L 40 80 L 40 140 C 40 320, 125 420, 200 470 Z" 
        fill="#C5A85C" 
        stroke="#E6C687" 
        strokeWidth="6"
        strokeLinejoin="round"
        filter="url(#shadow)"
      />
      
      {/* Top Text Header Banner */}
      <rect x="35" y="15" width="330" height="50" rx="4" fill="#1E3A8A" stroke="#C5A85C" strokeWidth="4" />
      <text 
        x="200" 
        y="46" 
        fill="#FFFFFF" 
        fontSize="17" 
        fontFamily="sans-serif" 
        fontWeight="bold" 
        textAnchor="middle" 
        letterSpacing="1"
      >
        SMP NEGERI 1 RANGSANG
      </text>
      
      {/* Inner Red Border */}
      <path 
        d="M 200 455 C 265 410, 345 315, 345 145 L 345 90 L 200 90 L 55 90 L 55 145 C 55 315, 135 410, 200 455 Z" 
        fill="#DC2626" 
        stroke="#C5A85C" 
        strokeWidth="2"
      />
      
      {/* Inner Shield Body - Split Diagonally (White top-left, Blue bottom-right) */}
      <clipPath id="innerShieldClip">
        <path d="M 200 445 C 260 400, 335 310, 335 150 L 335 100 L 200 100 L 65 100 L 65 150 C 65 310, 140 400, 200 445 Z" />
      </clipPath>
      
      <g clipPath="url(#innerShieldClip)">
        {/* White background (Top Left) */}
        <rect x="0" y="0" width="400" height="500" fill="#FFFFFF" />
        {/* Blue background (Bottom Right - Diagonal Split) */}
        <path d="M 65 300 L 335 150 L 335 450 L 200 450 Z" fill="#1E3A8A" />
        
        {/* Orange Sailboat (Centerpiece) */}
        {/* Mast */}
        <rect x="198" y="150" width="4" height="150" fill="#333333" />
        {/* Sail Left */}
        <path d="M 194 155 C 150 190, 120 250, 120 280 C 145 285, 180 285, 194 280 Z" fill="#FF7700" />
        {/* Sail Right */}
        <path d="M 202 185 C 235 210, 275 255, 275 280 C 255 285, 220 285, 202 280 Z" fill="#FF9933" />
        {/* Boat Hull */}
        <path d="M 160 285 L 240 285 L 225 300 L 175 300 Z" fill="#8B0000" />
        {/* Sea Waves below sailboat */}
        <path d="M 140 305 Q 160 295 180 305 T 220 305 T 260 305" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" fill="none" />
        
        {/* Golden Paddy (Left side) */}
        <path d="M 110 130 C 95 180, 95 240, 110 290" stroke="#C5A85C" strokeWidth="3" fill="none" />
        {/* Paddy grains */}
        <circle cx="106" cy="140" r="4" fill="#E6C687" />
        <circle cx="102" cy="155" r="4" fill="#E6C687" />
        <circle cx="100" cy="170" r="4" fill="#E6C687" />
        <circle cx="98" cy="185" r="4" fill="#E6C687" />
        <circle cx="98" cy="200" r="4" fill="#E6C687" />
        <circle cx="100" cy="215" r="4" fill="#E6C687" />
        <circle cx="102" cy="230" r="4" fill="#E6C687" />
        <circle cx="106" cy="245" r="4" fill="#E6C687" />
        <circle cx="112" cy="260" r="4" fill="#E6C687" />
        
        {/* Cotton Stalk (Right side) */}
        <path d="M 290 130 C 305 180, 305 240, 290 290" stroke="#15803D" strokeWidth="3" fill="none" />
        {/* Cotton blossoms */}
        <circle cx="294" cy="140" r="6" fill="#FFFFFF" stroke="#15803D" strokeWidth="1.5" />
        <circle cx="298" cy="160" r="6" fill="#FFFFFF" stroke="#15803D" strokeWidth="1.5" />
        <circle cx="300" cy="180" r="6" fill="#FFFFFF" stroke="#15803D" strokeWidth="1.5" />
        <circle cx="302" cy="200" r="6" fill="#FFFFFF" stroke="#15803D" strokeWidth="1.5" />
        <circle cx="302" cy="220" r="6" fill="#FFFFFF" stroke="#15803D" strokeWidth="1.5" />
        <circle cx="300" cy="240" r="6" fill="#FFFFFF" stroke="#15803D" strokeWidth="1.5" />
        <circle cx="298" cy="260" r="6" fill="#FFFFFF" stroke="#15803D" strokeWidth="1.5" />
        
        {/* Open Book (Below waves) */}
        <path d="M 200 340 C 185 325, 155 325, 140 335 L 140 365 C 155 355, 185 355, 200 370 C 215 355, 245 355, 260 365 L 260 335 C 245 325, 215 325, 200 340 Z" fill="#FFFFFF" stroke="#333333" strokeWidth="2" />
        <line x1="200" y1="340" x2="200" y2="370" stroke="#333333" strokeWidth="2" />
        
        {/* Red Ribbon with Gold Text "KECAMATAN RANGSANG" */}
        <path d="M 100 380 L 300 380 L 285 405 L 115 405 Z" fill="#DC2626" stroke="#C5A85C" strokeWidth="1.5" />
        <text 
          x="200" 
          y="397" 
          fill="#E6C687" 
          fontSize="10" 
          fontFamily="sans-serif" 
          fontWeight="bold" 
          textAnchor="middle"
        >
          KECAMATAN RANGSANG
        </text>
        
        {/* Year 1984 in gold */}
        <text 
          x="200" 
          y="435" 
          fill="#E6C687" 
          fontSize="18" 
          fontFamily="sans-serif" 
          fontWeight="bold" 
          textAnchor="middle"
        >
          1984
        </text>
      </g>
    </svg>
  );
};
