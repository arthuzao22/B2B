/**
 * File Upload Validator
 * 
 * Validates file uploads for security:
 * - File type validation (MIME type and extension)
 * - File size limits
 * - Malicious content detection
 * - Virus scanning integration ready
 */

import { NextRequest } from 'next/server';

/**
 * Allowed file types configuration
 */
export const ALLOWED_FILE_TYPES = {
  images: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  documents: {
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  archives: {
    extensions: ['.zip', '.tar', '.gz', '.rar'],
    mimeTypes: [
      'application/zip',
      'application/x-tar',
      'application/gzip',
      'application/x-rar-compressed',
    ],
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  videos: {
    extensions: ['.mp4', '.webm', '.ogg'],
    mimeTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
};

/**
 * Dangerous file extensions that should never be allowed
 */
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
  '.jar', '.app', '.deb', '.rpm', '.dmg', '.pkg', '.sh', '.ps1',
  '.msi', '.apk', '.ipa', '.dll', '.so', '.dylib'
];

/**
 * File validation result
 */
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  file?: {
    name: string;
    size: number;
    type: string;
    extension: string;
  };
}

/**
 * Extract file extension from filename
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(lastDot).toLowerCase() : '';
}

/**
 * Check if file extension is dangerous
 */
function isDangerousExtension(extension: string): boolean {
  return DANGEROUS_EXTENSIONS.includes(extension.toLowerCase());
}

/**
 * Validate file size
 */
function validateFileSize(size: number, maxSize: number): string | null {
  if (size > maxSize) {
    return `File size exceeds maximum allowed size of ${formatFileSize(maxSize)}`;
  }
  if (size === 0) {
    return 'File is empty';
  }
  return null;
}

/**
 * Validate file extension
 */
function validateFileExtension(
  extension: string,
  allowedExtensions: string[]
): string | null {
  if (!extension) {
    return 'File has no extension';
  }
  
  if (isDangerousExtension(extension)) {
    return `File extension ${extension} is not allowed for security reasons`;
  }
  
  if (!allowedExtensions.includes(extension.toLowerCase())) {
    return `File extension ${extension} is not allowed. Allowed: ${allowedExtensions.join(', ')}`;
  }
  
  return null;
}

/**
 * Validate MIME type
 */
function validateMimeType(
  mimeType: string,
  allowedMimeTypes: string[]
): string | null {
  if (!mimeType) {
    return 'File has no MIME type';
  }
  
  // Normalize MIME type
  const normalizedMime = mimeType.toLowerCase().split(';')[0].trim();
  
  if (!allowedMimeTypes.includes(normalizedMime)) {
    return `File type ${normalizedMime} is not allowed. Allowed: ${allowedMimeTypes.join(', ')}`;
  }
  
  return null;
}

/**
 * Check for double extensions (e.g., file.pdf.exe)
 */
function hasDoubleExtension(filename: string): boolean {
  const parts = filename.split('.');
  return parts.length > 2 && parts.slice(-2).some(part => 
    DANGEROUS_EXTENSIONS.includes(`.${part.toLowerCase()}`)
  );
}

/**
 * Detect null bytes in filename (directory traversal attempt)
 */
function hasNullBytes(filename: string): boolean {
  return filename.includes('\0');
}

/**
 * Validate filename for security issues
 */
function validateFilename(filename: string): string[] {
  const warnings: string[] = [];
  
  if (hasNullBytes(filename)) {
    warnings.push('Filename contains null bytes (security risk)');
  }
  
  if (hasDoubleExtension(filename)) {
    warnings.push('Filename has double extension (potential security risk)');
  }
  
  if (filename.includes('..')) {
    warnings.push('Filename contains path traversal characters');
  }
  
  if (filename.startsWith('.')) {
    warnings.push('Hidden file detected');
  }
  
  if (filename.length > 255) {
    warnings.push('Filename is too long');
  }
  
  return warnings;
}

/**
 * Check file signature (magic numbers) for images
 */
async function validateFileSignature(file: File): Promise<string | null> {
  const signatures: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38]],
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
  };
  
  const expectedSignature = signatures[file.type];
  if (!expectedSignature) {
    return null; // No signature check for this type
  }
  
  try {
    const buffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    const matches = expectedSignature.some(sig => 
      sig.every((byte, i) => bytes[i] === byte)
    );
    
    if (!matches) {
      return `File signature does not match declared type ${file.type}`;
    }
  } catch (error) {
    return 'Failed to read file signature';
  }
  
  return null;
}

/**
 * Format file size for human readability
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate uploaded file
 */
export async function validateFile(
  file: File,
  category: keyof typeof ALLOWED_FILE_TYPES
): Promise<FileValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const config = ALLOWED_FILE_TYPES[category];
  const extension = getFileExtension(file.name);
  
  // Validate filename
  warnings.push(...validateFilename(file.name));
  
  // Validate extension
  const extError = validateFileExtension(extension, config.extensions);
  if (extError) errors.push(extError);
  
  // Validate MIME type
  const mimeError = validateMimeType(file.type, config.mimeTypes);
  if (mimeError) errors.push(mimeError);
  
  // Validate file size
  const sizeError = validateFileSize(file.size, config.maxSize);
  if (sizeError) errors.push(sizeError);
  
  // Validate file signature for images and PDFs
  if (errors.length === 0) {
    const signatureError = await validateFileSignature(file);
    if (signatureError) errors.push(signatureError);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    file: {
      name: file.name,
      size: file.size,
      type: file.type,
      extension,
    },
  };
}

/**
 * Validate multiple files
 */
export async function validateFiles(
  files: File[],
  category: keyof typeof ALLOWED_FILE_TYPES,
  maxFiles = 10
): Promise<{
  valid: boolean;
  results: FileValidationResult[];
  errors: string[];
}> {
  const errors: string[] = [];
  
  if (files.length > maxFiles) {
    errors.push(`Too many files. Maximum allowed: ${maxFiles}`);
    return { valid: false, results: [], errors };
  }
  
  const results = await Promise.all(
    files.map(file => validateFile(file, category))
  );
  
  const allValid = results.every(r => r.valid) && errors.length === 0;
  
  return {
    valid: allValid,
    results,
    errors,
  };
}

/**
 * Extract file metadata
 */
export function extractFileMetadata(file: File) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    extension: getFileExtension(file.name),
    lastModified: file.lastModified,
    formattedSize: formatFileSize(file.size),
  };
}

/**
 * Check if file type is allowed
 */
export function isFileTypeAllowed(
  filename: string,
  mimeType: string,
  category: keyof typeof ALLOWED_FILE_TYPES
): boolean {
  const config = ALLOWED_FILE_TYPES[category];
  const extension = getFileExtension(filename);
  
  return (
    config.extensions.includes(extension.toLowerCase()) &&
    config.mimeTypes.includes(mimeType.toLowerCase())
  );
}

/**
 * Sanitize uploaded filename
 */
export function sanitizeUploadedFilename(filename: string): string {
  // Remove path components
  const name = filename.replace(/^.*[\\\/]/, '');
  
  // Remove dangerous characters
  const sanitized = name
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_');
  
  // Add timestamp to prevent collisions
  const timestamp = Date.now();
  const extension = getFileExtension(sanitized);
  const nameWithoutExt = sanitized.substring(0, sanitized.length - extension.length);
  
  return `${nameWithoutExt}_${timestamp}${extension}`;
}
