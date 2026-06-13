// lib/socialLinks.ts
import { FaInstagram, FaYoutube, FaTwitter, FaBehance } from "react-icons/fa"

export const PLATFORM_REGEX: Record<string, RegExp> = {
  INSTAGRAM: /^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/?$/,
  YOUTUBE: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/,
  BEHANCE: /^https?:\/\/(www\.)?behance\.net\/[A-Za-z0-9_-]+\/?$/,
  TWITTER: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]+\/?$/,
  BINANCE: /^https?:\/\/(www\.)?binance\.com\/.*$/
};

export const ALLOWED_PLATFORMS = [
  { id: 'INSTAGRAM', label: 'Instagram', icon: FaInstagram },
  { id: 'YOUTUBE', label: 'YouTube', icon: FaYoutube },
  { id: 'BEHANCE', label: 'Behance', icon: FaBehance },
  { id: 'TWITTER', label: 'Twitter / X', icon: FaTwitter }
];

export const validateSocialUrl = (platformId: string, url: string): boolean => {
  if (!url) return true;
  const regex = PLATFORM_REGEX[platformId];
  return regex ? regex.test(url) : true;
};