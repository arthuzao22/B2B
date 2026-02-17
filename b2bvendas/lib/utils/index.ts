import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export {
  slugify,
  generateOrderNumber,
  formatCurrency,
  formatCNPJ,
  sanitizeForLog,
  calculateDiscount,
  getPaginationParams,
  validateRequestOrigin,
  sanitizeHtml,
  validateFileType,
  generateSecureToken,
  hashData,
  isValidIpAddress,
  maskSensitiveData,
  checkPasswordStrength,
  generateFormToken,
  verifyToken,
} from './helpers';

// Alias for slugify to match expected usage
export { slugify as generateSlug } from './helpers';
