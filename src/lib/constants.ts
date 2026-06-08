export const FALLBACK_IMAGE = 
  process.env.NEXT_PUBLIC_FALLBACK_IMAGE;

const maxFileSizeMb = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB);

export const MAX_FILE_SIZE_BYTES = maxFileSizeMb * 1024 * 1024;

const maxImageSizeMb = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE_MB);

export const MAX_IMAGE_SIZE_BYTES = maxImageSizeMb * 1024 * 1024;