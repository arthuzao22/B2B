export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PED-${timestamp}-${random}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function sanitizeForLog(data: any): any {
  if (!data) return data;
  
  const sensitive = ['senha', 'password', 'token', 'secret', 'authorization'];
  const sanitized = { ...data };
  
  for (const key of Object.keys(sanitized)) {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

export function calculateDiscount(
  basePrice: number,
  discountType: 'percentual' | 'fixo',
  discountValue: number
): number {
  if (discountType === 'percentual') {
    return basePrice * (1 - discountValue / 100);
  }
  return basePrice - discountValue;
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const pagina = Math.max(1, parseInt(searchParams.get('pagina') || '1'));
  const limite = Math.min(100, Math.max(1, parseInt(searchParams.get('limite') || '10')));
  const ordenarPor = searchParams.get('ordenarPor') || undefined;
  const ordem = (searchParams.get('ordem') || 'desc') as 'asc' | 'desc';
  
  return { pagina, limite, ordenarPor, ordem };
}

// ==========================================
// Security Helper Functions
// ==========================================

/**
 * Validate request origin
 */
export function validateRequestOrigin(
  origin: string | null,
  allowedOrigins: string[]
): boolean {
  if (!origin) return false;
  
  try {
    const originUrl = new URL(origin);
    return allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      if (allowed.startsWith('*.')) {
        const domain = allowed.substring(2);
        return originUrl.hostname.endsWith(domain);
      }
      return originUrl.origin === allowed;
    });
  } catch {
    return false;
  }
}

/**
 * Sanitize HTML (basic version - see sanitizer.ts for full version)
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/href\s*=\s*["']?\s*javascript:/gi, 'href="#"')
    .replace(/<(iframe|object|embed)[^>]*>.*?<\/\1>/gi, '');
}

/**
 * Validate file type
 */
export function validateFileType(
  filename: string,
  allowedExtensions: string[]
): boolean {
  const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return allowedExtensions.includes(extension);
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length = 32): string {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Hash sensitive data
 */
export function hashData(data: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Validate IP address format
 */
export function isValidIpAddress(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  if (ipv4Regex.test(ip)) {
    return ip.split('.').every(part => parseInt(part) <= 255);
  }
  
  return ipv6Regex.test(ip);
}

/**
 * Mask sensitive data for logs
 */
export function maskSensitiveData(data: string, visibleChars = 4): string {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }
  return data.substring(0, visibleChars) + '*'.repeat(data.length - visibleChars);
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (password.length < 8) feedback.push('Use at least 8 characters');
  if (!/[a-z]/.test(password)) feedback.push('Add lowercase letters');
  if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters');
  if (!/\d/.test(password)) feedback.push('Add numbers');
  if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('Add special characters');
  
  return { score, feedback };
}

/**
 * Generate CSRF-safe form token
 */
export function generateFormToken(): string {
  return generateSecureToken(32);
}

/**
 * Verify token timing-safe
 */
export function verifyToken(token1: string, token2: string): boolean {
  if (!token1 || !token2 || token1.length !== token2.length) {
    return false;
  }
  
  const crypto = require('crypto');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token1),
      Buffer.from(token2)
    );
  } catch {
    return false;
  }
}
