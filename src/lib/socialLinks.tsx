import React from 'react';

const InstagramIcon = ({ size = 24, className = "" }: { size?: number | string, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const YoutubeIcon = ({ size = 24, className = "" }: { size?: number | string, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const XIcon = ({ size = 24, className = "" }: { size?: number | string, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.005 4.15H5.059z"/>
  </svg>
);

const BehanceIcon = ({ size = 24, className = "" }: { size?: number | string, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.226-2.477-2.226-1.48 0-2.352.83-2.488 2.226zm-9.551-4v-3h-6.489v15h6.643c3.081 0 5.437-1.144 5.437-4.14 0-1.859-1.282-2.92-2.909-3.235 1.109-.434 2.064-1.411 2.064-2.88 0-2.417-1.894-3.745-4.746-3.745h-4zM2 17h3.766c1.611 0 2.502.518 2.502 1.834 0 1.256-.841 1.666-2.372 1.666h-3.896v-3.5zm0-6.5h3.585c1.171 0 2.122.383 2.122 1.541 0 1.181-.977 1.459-2.072 1.459h-3.635v-3z"/>
  </svg>
);


export const PLATFORM_REGEX: Record<string, RegExp> = {
  INSTAGRAM: /^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/?$/,
  YOUTUBE: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/,
  BEHANCE: /^https?:\/\/(www\.)?behance\.net\/[A-Za-z0-9_-]+\/?$/,
  TWITTER: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]+\/?$/,
  BINANCE: /^https?:\/\/(www\.)?binance\.com\/.*$/
};

export const ALLOWED_PLATFORMS = [
  { id: 'INSTAGRAM', label: 'Instagram', icon: InstagramIcon },
  { id: 'YOUTUBE', label: 'YouTube', icon: YoutubeIcon },
  { id: 'BEHANCE', label: 'Behance', icon: BehanceIcon },
  { id: 'TWITTER', label: 'X (Twitter)', icon: XIcon }
];

export const validateSocialUrl = (platformId: string, url: string): boolean => {
  if (!url) return true;
  const regex = PLATFORM_REGEX[platformId];
  return regex ? regex.test(url) : true;
};