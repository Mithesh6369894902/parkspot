import React from 'react';
import { Link } from 'react-router-dom';

export function LogoIcon({ size = 36, className = '' }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-400 p-[2px] shadow-lg shadow-blue-500/25 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-blue-500/40 ${className}`}
    >
      {/* Glossy inner container */}
      <div className="w-full h-full rounded-[14px] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center relative overflow-hidden">
        {/* Ambient radial glow inside */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-cyan-400/20 pointer-events-none" />
        
        {/* Stylized P + Location Pin SVG */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5 relative z-10"
        >
          <defs>
            <linearGradient id="psGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38bdf8" />
              <stop offset="0.5" stopColor="#60a5fa" />
              <stop offset="1" stopColor="#818cf8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Parking Bay outline */}
          <path
            d="M8 6H20C24.4183 6 28 9.58172 28 14C28 18.4183 24.4183 22 20 22H14V26"
            stroke="url(#psGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Vertical stem */}
          <path
            d="M8 6V26"
            stroke="#ffffff"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Glowing Beacon Spot inside P */}
          <circle
            cx="20"
            cy="14"
            r="3"
            fill="#38bdf8"
            className="animate-pulse"
          />
        </svg>
      </div>
    </div>
  );
}

export default function Logo({
  size = 'md',
  variant = 'dark', // 'dark' | 'light' | 'white'
  showTagline = false,
  to = '/',
  className = '',
}) {
  const sizeMap = {
    sm: { icon: 30, text: 'text-lg', badge: 'text-[9px]' },
    md: { icon: 38, text: 'text-2xl', badge: 'text-[10px]' },
    lg: { icon: 46, text: 'text-3xl', badge: 'text-[11px]' },
    xl: { icon: 56, text: 'text-4xl', badge: 'text-xs' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`inline-flex items-center gap-3 group select-none ${className}`}>
      <LogoIcon size={currentSize.icon} />
      <div className="flex flex-col justify-center">
        <div className={`font-black tracking-tight leading-none ${currentSize.text} flex items-center font-heading`}>
          <span className={variant === 'white' ? 'text-white' : 'text-slate-900'}>
            Park
          </span>
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent ml-[1px]">
            Spot
          </span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 ml-1 animate-ping inline-block" />
        </div>
        {showTagline && (
          <span className={`tracking-widest uppercase font-bold mt-1 ${currentSize.badge} ${variant === 'white' ? 'text-cyan-300/80' : 'text-slate-400'}`}>
            Smart Land Parking
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-block transition-opacity hover:opacity-95">
        {content}
      </Link>
    );
  }

  return content;
}
