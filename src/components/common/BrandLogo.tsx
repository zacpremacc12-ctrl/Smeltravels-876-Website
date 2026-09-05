import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  tagline?: string;
  badgeOnly?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  showText = true,
  tagline,
  badgeOnly = false,
}) => {
  // Dimension mappings for the logo badge
  const sizeClasses = {
    sm: 'w-9 h-9 min-w-[36px]',
    md: 'w-11 h-11 min-w-[44px]',
    lg: 'w-14 h-14 min-w-[56px]',
    xl: 'w-20 h-20 min-w-[80px]',
  };

  const imageSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-13 h-13',
    xl: 'w-18 h-18',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Badge: White card to ensure black airplane, black pins, and lime 876 pop on any background */}
      <div
        className={`${sizeClasses[size]} bg-white rounded-2xl p-0.5 shadow-md border border-white/20 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform`}
      >
        <img
          src="/logo.png"
          alt="SMELTRAVELS876 Logo"
          className={`${imageSizes[size]} object-contain rounded-xl`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback to vector icon if image load fails
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.classList.add('bg-[#FFC72C]', 'text-[#2E0249]');
              parent.innerHTML = '<span class="font-black text-sm">876</span>';
            }
          }}
        />
      </div>

      {/* Brand Text Block */}
      {showText && !badgeOnly && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-extrabold ${textSizes[size]} tracking-tight text-white font-['Outfit',sans-serif] leading-tight`}
            >
              SMELTRAVELS<span className="text-[#FFC72C]">876</span>
            </span>
            <span className="text-[10px] bg-[#FFC72C]/20 text-[#FFC72C] px-1.5 py-0.5 rounded font-bold border border-[#FFC72C]/30 hidden sm:inline-block">
              JA 🇯🇲
            </span>
          </div>
          {tagline && (
            <span className="text-[11px] font-semibold text-[#FFC72C] tracking-wider uppercase leading-tight">
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
