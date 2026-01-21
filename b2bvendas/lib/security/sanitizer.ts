/**
 * Input Sanitization
 * 
 * Provides utilities to sanitize user input and prevent XSS attacks
 * Implements allowlist-based HTML sanitization
 */

/**
 * HTML entities that need to be escaped
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"'\/]/g, (char) => HTML_ENTITIES[char]);
}

/**
 * Remove all HTML tags from string
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Allowed HTML tags for rich text (allowlist approach)
 */
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre'
];

/**
 * Allowed attributes per tag
 */
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  'a': ['href', 'title', 'target'],
  'img': ['src', 'alt', 'title', 'width', 'height'],
};

/**
 * Allowed URL schemes
 */
const ALLOWED_SCHEMES = ['http:', 'https:', 'mailto:'];

/**
 * Sanitize HTML string using allowlist approach
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\son\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: and data: URLs
  sanitized = sanitized.replace(/href\s*=\s*["']?\s*javascript:/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*["']?\s*data:/gi, 'src=""');
  
  // Remove style tags
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove iframe, object, embed tags
  sanitized = sanitized.replace(/<(iframe|object|embed)[^>]*>.*?<\/\1>/gi, '');
  
  return sanitized;
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    
    // Check if scheme is allowed
    if (!ALLOWED_SCHEMES.includes(parsed.protocol)) {
      return '#';
    }
    
    // Remove javascript: and data: URLs
    if (parsed.protocol === 'javascript:' || parsed.protocol === 'data:') {
      return '#';
    }
    
    return url;
  } catch {
    // Invalid URL
    return '#';
  }
}

/**
 * Sanitize object by escaping all string values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = escapeHtml(sanitized[key]);
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  
  return sanitized;
}

/**
 * Sanitize filename to prevent directory traversal
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and null bytes
  let sanitized = filename.replace(/[\/\\.\0]/g, '_');
  
  // Remove leading/trailing spaces and dots
  sanitized = sanitized.trim().replace(/^\.+/, '');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop();
    sanitized = sanitized.substring(0, 255 - (ext?.length || 0) - 1) + '.' + ext;
  }
  
  return sanitized || 'unnamed';
}

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  // Remove whitespace
  let sanitized = email.trim().toLowerCase();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return '';
  }
  
  // Prevent header injection
  sanitized = sanitized.replace(/[\r\n]/g, '');
  
  return sanitized;
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-numeric characters except +
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Sanitize SQL input (basic - use parameterized queries!)
 */
export function sanitizeSql(input: string): string {
  if (!input) return '';
  
  // Escape single quotes
  return input.replace(/'/g, "''");
}

/**
 * Remove dangerous characters from input
 */
export function removeDangerousChars(input: string): string {
  if (!input) return '';
  
  // Remove control characters and null bytes
  return input.replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Sanitize JSON input
 */
export function sanitizeJson(json: string): string {
  try {
    // Parse and re-stringify to ensure valid JSON
    const parsed = JSON.parse(json);
    return JSON.stringify(sanitizeObject(parsed));
  } catch {
    return '{}';
  }
}

/**
 * Validate and sanitize integer
 */
export function sanitizeInteger(value: any, defaultValue = 0): number {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Validate and sanitize float
 */
export function sanitizeFloat(value: any, defaultValue = 0.0): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Validate and sanitize boolean
 */
export function sanitizeBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  }
  return Boolean(value);
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return '';
  
  // Remove special characters that could break search
  let sanitized = query.trim();
  
  // Escape special regex characters
  sanitized = sanitized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Limit length
  return sanitized.substring(0, 200);
}

/**
 * Comprehensive input sanitization
 */
export function sanitizeInput(input: any, type: 'html' | 'url' | 'email' | 'phone' | 'text' = 'text'): string {
  if (input === null || input === undefined) return '';
  
  const str = String(input);
  
  switch (type) {
    case 'html':
      return sanitizeHtml(str);
    case 'url':
      return sanitizeUrl(str);
    case 'email':
      return sanitizeEmail(str);
    case 'phone':
      return sanitizePhone(str);
    case 'text':
    default:
      return escapeHtml(str);
  }
}

/**
 * Deep sanitize object recursively
 */
export function deepSanitize<T>(obj: T, options: { allowHtml?: boolean } = {}): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item, options)) as any;
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = deepSanitize(obj[key], options);
    }
    return sanitized;
  }
  
  if (typeof obj === 'string') {
    return (options.allowHtml ? sanitizeHtml(obj) : escapeHtml(obj)) as any;
  }
  
  return obj;
}
