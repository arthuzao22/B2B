import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/modules/email';
import logger from '@/src/lib/logger';

// ==========================================
// GET /api/email/test - Test email templates
// ==========================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const template = searchParams.get('template') || 'welcome';
    const email = searchParams.get('email') || 'test@example.com';

    let result;

    switch (template) {
      case 'welcome':
        result = await emailService.sendWelcomeEmail(
          {
            userName: 'Test User',
            userEmail: email,
            companyName: 'Test Company',
            activationLink: 'https://example.com/activate/test',
          },
          false // Send immediately for testing
        );
        break;

      case 'order-confirmation':
        result = await emailService.sendOrderConfirmationEmail(
          {
            orderNumber: 'TEST-001',
            customerName: 'Test User',
            items: [
              {
                name: 'Test Product',
                quantity: 2,
                price: 100.0,
                total: 200.0,
              },
            ],
            subtotal: 200.0,
            shipping: 20.0,
            discount: 0,
            total: 220.0,
            orderDate: new Date().toLocaleDateString('pt-BR'),
          },
          email,
          false
        );
        break;

      case 'order-status-update':
        result = await emailService.sendOrderStatusUpdateEmail(
          {
            orderNumber: 'TEST-001',
            customerName: 'Test User',
            oldStatus: 'pendente',
            newStatus: 'confirmado',
            statusMessage: 'Seu pedido foi confirmado e está sendo processado.',
            orderLink: 'https://example.com/orders/TEST-001',
          },
          email,
          false
        );
        break;

      case 'order-shipped':
        result = await emailService.sendOrderShippedEmail(
          {
            orderNumber: 'TEST-001',
            customerName: 'Test User',
            trackingCode: 'BR123456789PT',
            trackingUrl: 'https://tracking.example.com/BR123456789PT',
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
            items: [
              { name: 'Test Product', quantity: 2 },
            ],
            shippingAddress: {
              address: 'Rua Teste, 123',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01234-567',
            },
          },
          email,
          false
        );
        break;

      case 'order-delivered':
        result = await emailService.sendOrderDeliveredEmail(
          {
            orderNumber: 'TEST-001',
            customerName: 'Test User',
            deliveryDate: new Date().toLocaleDateString('pt-BR'),
            feedbackLink: 'https://example.com/feedback/TEST-001',
          },
          email,
          false
        );
        break;

      case 'password-reset':
        result = await emailService.sendPasswordResetEmail(
          {
            userName: 'Test User',
            resetLink: 'https://example.com/reset-password?token=test123',
            expiresIn: '1 hora',
          },
          email,
          false
        );
        break;

      case 'low-stock-alert':
        result = await emailService.sendLowStockAlertEmail(
          {
            supplierName: 'Test Supplier',
            products: [
              {
                name: 'Test Product 1',
                sku: 'TEST-001',
                currentStock: 3,
                minStock: 10,
              },
              {
                name: 'Test Product 2',
                sku: 'TEST-002',
                currentStock: 0,
                minStock: 20,
              },
            ],
            dashboardLink: 'https://example.com/dashboard/inventory',
          },
          email,
          false
        );
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid template',
            availableTemplates: [
              'welcome',
              'order-confirmation',
              'order-status-update',
              'order-shipped',
              'order-delivered',
              'password-reset',
              'low-stock-alert',
            ],
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${email}`,
      template,
      result,
    });
  } catch (error) {
    logger.error('Error in GET /api/email/test:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send test email',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
