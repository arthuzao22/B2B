import { EmailStatus } from '@prisma/client';

// ==========================================
// EMAIL TYPES
// ==========================================

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface SendEmailOptions {
  to: string | EmailAddress | EmailAddress[];
  from?: string | EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  templateData?: Record<string, any>;
  attachments?: EmailAttachment[];
  replyTo?: string | EmailAddress;
  cc?: string | EmailAddress | EmailAddress[];
  bcc?: string | EmailAddress | EmailAddress[];
  tags?: string[];
  metadata?: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  externalId?: string;
  error?: string;
}

export interface EmailLogData {
  to: string;
  from: string;
  subject: string;
  template: string;
  status: EmailStatus;
  htmlContent?: string;
  textContent?: string;
  templateData?: Record<string, any>;
  externalId?: string;
  errorMessage?: string;
  attempts?: number;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface EmailQueueJob {
  id: string;
  emailOptions: SendEmailOptions;
  priority: number;
  attempts: number;
  maxAttempts: number;
}

// ==========================================
// EMAIL TEMPLATE DATA TYPES
// ==========================================

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  companyName?: string;
  activationLink?: string;
}

export interface OrderConfirmationEmailData {
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  orderDate: string;
  estimatedDelivery?: string;
  shippingAddress?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface OrderStatusUpdateEmailData {
  orderNumber: string;
  customerName: string;
  oldStatus: string;
  newStatus: string;
  statusMessage: string;
  orderLink: string;
  trackingCode?: string;
}

export interface OrderShippedEmailData {
  orderNumber: string;
  customerName: string;
  trackingCode: string;
  trackingUrl: string;
  carrier?: string;
  estimatedDelivery: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface OrderDeliveredEmailData {
  orderNumber: string;
  customerName: string;
  deliveryDate: string;
  feedbackLink?: string;
}

export interface PasswordResetEmailData {
  userName: string;
  resetLink: string;
  expiresIn: string;
}

export interface LowStockAlertEmailData {
  supplierName: string;
  products: Array<{
    name: string;
    sku: string;
    currentStock: number;
    minStock: number;
  }>;
  dashboardLink: string;
}
