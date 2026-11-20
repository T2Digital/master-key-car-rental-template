import React from 'react';
import { BRAND_LOGO_BASE64 } from '../data/brandLogoData';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'gold-luxury' | 'gold-dark' | 'print-clean' | 'compact';
  showPhones?: boolean;
}

/**
 * Official Brand Logo for CAREEM CAR RENTAL / MASTER KEY (KRM)
 * Uses in-memory base64 to ensure instant rendering across all devices, mobile export & printing.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'gold-luxury',
  showPhones = true,
}) => {
  const sizeMap = {
    sm: { imgWidth: 'w-10 h-10', text: 'text-[9px]', sub: 'text-[7px]', phone: 'text-[6px]' },
    md: { imgWidth: 'w-20 h-20', text: 'text-xs font-black tracking-widest', sub: 'text-[9px]', phone: 'text-[8px]' },
    lg: { imgWidth: 'w-28 h-28', text: 'text-base font-black tracking-[0.2em]', sub: 'text-xs', phone: 'text-[10px]' },
    xl: { imgWidth: 'w-44 h-44', text: 'text-xl font-black tracking-[0.25em]', sub: 'text-sm', phone: 'text-xs' },
  }[size];

  const isPrint = variant === 'print-clean';

  return (
    <div className={`inline-flex flex-col items-center select-none text-center ${className}`} dir="ltr">
      <div className={`relative ${sizeMap.imgWidth} flex items-center justify-center`}>
        <img
          src={BRAND_LOGO_BASE64}
          alt="Careem Car Rental Official Logo"
          className={`w-full h-full object-contain rounded-lg ${isPrint ? 'mix-blend-multiply filter contrast-125' : 'drop-shadow-[0_2px_8px_rgba(217,178,89,0.3)]'}`}
          referrerPolicy="no-referrer"
        />
      </div>

      {showPhones && (
        <div className="flex flex-col items-center mt-1">
          <span 
            className={`${sizeMap.phone} font-mono font-bold tracking-wider`}
            style={{ color: isPrint ? '#0f172a' : '#cbd5e1' }}
          >
            01146442004 • 01022221258
          </span>
          <span 
            className="text-[7px] font-bold tracking-[0.2em] text-amber-600 mt-0.5 uppercase"
          >
            — EGYPT • مصر —
          </span>
        </div>
      )}
    </div>
  );
};
