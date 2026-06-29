import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatIdToUUID = (id: string | number) => {
  const hexId = Number(id).toString(16).padStart(12, '0');
  return `00000000-0000-4000-8000-${hexId}`;
};
