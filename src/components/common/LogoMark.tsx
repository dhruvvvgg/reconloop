import React from 'react';

interface LogoMarkProps {
  className?: string;
  size?: number;
}

export const LogoMark: React.FC<LogoMarkProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Loop Path 1 */}
      <path
        d="M6 14C6 8.5 10.5 4 16 4C21.5 4 24 9 20 15L15 21C11 27 6 24 6 18V14Z"
        fill="currentColor"
        fillOpacity="0.85"
      />
      {/* Loop Path 2 */}
      <path
        d="M30 22C30 27.5 25.5 32 20 32C14.5 32 12 27 16 21L21 15C25 9 30 12 30 18V22Z"
        fill="currentColor"
        fillOpacity="0.55"
      />
      {/* Central Anchor */}
      <circle cx="18" cy="18" r="3" fill="var(--accent, #0D94FB)" />
      <circle cx="18" cy="18" r="1.2" fill="var(--canvas, #0a0a0a)" />
    </svg>
  );
};
