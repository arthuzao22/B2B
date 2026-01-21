import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/modules/email/email.service';
import { z } from 'zod';
import logger from '@/src/lib/logger';

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const sendEmailSchema = z.object({
  type: z.enum([
    'welcome',
    'order-confirmation',
    'order-status-update',
    'order-shipped',
    'order-delivered',
    'password-reset',
    'low-stock-alert',
    'custom',
  ]),
  to: z.string().email(),
  data: z.record(z.any()).optional(),
  useQueue: z.boolean().optional().default(true),
});

const customEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1),
  html: z.string().optional(),
  text: z.string().optional(),
  template: z.string().optional(),
  templateData: z.record(z.any()).optional(),
  useQueue: z.boolean().optional().default(true),
});

// ==========================================
// POST /api/email/send - Send email
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if it's a custom email or template-based
    if (body.type === 'custom' || !body.type) {
      // Validate custom email
      const validation = customEmailSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid request data',
            details: validation.error.issues,
          },
          { status: 400 }
        );
      }

      const { to, subject, html, text, template, templateData, useQueue } = validation.data;

      const result = await emailService.sendEmail(
        {
          to,
          subject,
          html,
          text,
          template,
          templateData,
        },
        useQueue
      );

      return NextResponse.json(result);
    } else {
      // Validate template-based email
      const validation = sendEmailSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid request data',
            details: validation.error.issues,
          },
          { status: 400 }
        );
      }

      const { type, to, data, useQueue } = validation.data;

      let result;

      switch (type) {
        case 'welcome':
          result = await emailService.sendWelcomeEmail(data as any, useQueue);
          break;

        case 'order-confirmation':
          result = await emailService.sendOrderConfirmationEmail(data as any, to, useQueue);
          break;

        case 'order-status-update':
          result = await emailService.sendOrderStatusUpdateEmail(data as any, to, useQueue);
          break;

        case 'order-shipped':
          result = await emailService.sendOrderShippedEmail(data as any, to, useQueue);
          break;

        case 'order-delivered':
          result = await emailService.sendOrderDeliveredEmail(data as any, to, useQueue);
          break;

        case 'password-reset':
          result = await emailService.sendPasswordResetEmail(data as any, to, useQueue);
          break;

        case 'low-stock-alert':
          result = await emailService.sendLowStockAlertEmail(data as any, to, useQueue);
          break;

        default:
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid email type',
            },
            { status: 400 }
          );
      }

      return NextResponse.json(result);
    }
  } catch (error) {
    logger.error('Error in POST /api/email/send:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send email',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// ==========================================
// GET /api/email/send - Get email templates info
// ==========================================

export async function GET(request: NextRequest) {
  try {
    const templates = [
      {
        type: 'welcome',
        description: 'Welcome email for new users',
        requiredData: ['userName', 'userEmail'],
        optionalData: ['companyName', 'activationLink'],
      },
      {
        type: 'order-confirmation',
        description: 'Order confirmation email',
        requiredData: ['orderNumber', 'customerName', 'items', 'subtotal', 'shipping', 'discount', 'total', 'orderDate'],
        optionalData: ['estimatedDelivery', 'shippingAddress'],
      },
      {
        type: 'order-status-update',
        description: 'Order status update notification',
        requiredData: ['orderNumber', 'customerName', 'oldStatus', 'newStatus', 'statusMessage', 'orderLink'],
        optionalData: ['trackingCode'],
      },
      {
        type: 'order-shipped',
        description: 'Order shipped notification',
        requiredData: ['orderNumber', 'customerName', 'trackingCode', 'trackingUrl', 'estimatedDelivery', 'items', 'shippingAddress'],
        optionalData: ['carrier'],
      },
      {
        type: 'order-delivered',
        description: 'Order delivered notification',
        requiredData: ['orderNumber', 'customerName', 'deliveryDate'],
        optionalData: ['feedbackLink'],
      },
      {
        type: 'password-reset',
        description: 'Password reset email',
        requiredData: ['userName', 'resetLink', 'expiresIn'],
        optionalData: [],
      },
      {
        type: 'low-stock-alert',
        description: 'Low stock alert for suppliers',
        requiredData: ['supplierName', 'products', 'dashboardLink'],
        optionalData: [],
      },
    ];

    return NextResponse.json({
      success: true,
      templates,
      usage: {
        endpoint: '/api/email/send',
        method: 'POST',
        body: {
          type: 'template_type',
          to: 'recipient@example.com',
          data: {},
          useQueue: true,
        },
      },
    });
  } catch (error) {
    logger.error('Error in GET /api/email/send:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get templates info',
      },
      { status: 500 }
    );
  }
}
