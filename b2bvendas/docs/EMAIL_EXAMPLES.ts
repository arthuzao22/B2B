/**
 * Email System Usage Examples
 * 
 * This file demonstrates how to use the email system in different scenarios.
 */

import { emailService } from '@/modules/email';

// ==========================================
// 1. WELCOME EMAIL
// ==========================================

export async function sendWelcomeEmailExample() {
  const result = await emailService.sendWelcomeEmail({
    userName: 'João Silva',
    userEmail: 'joao@example.com',
    companyName: 'ACME Indústria',
    activationLink: 'https://b2bvendas.com/activate/abc123',
  });

  console.log('Welcome email sent:', result);
}

// ==========================================
// 2. ORDER CONFIRMATION EMAIL
// ==========================================

export async function sendOrderConfirmationExample() {
  const result = await emailService.sendOrderConfirmationEmail(
    {
      orderNumber: 'ORD-2024-001',
      customerName: 'Maria Santos',
      items: [
        {
          name: 'Notebook Dell Inspiron 15',
          quantity: 2,
          price: 3500.00,
          total: 7000.00,
        },
        {
          name: 'Mouse Logitech MX Master',
          quantity: 5,
          price: 450.00,
          total: 2250.00,
        },
      ],
      subtotal: 9250.00,
      shipping: 150.00,
      discount: 925.00,
      total: 8475.00,
      orderDate: '21 de Janeiro de 2024',
      estimatedDelivery: '28 de Janeiro de 2024',
      shippingAddress: {
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
      },
    },
    'maria@example.com'
  );

  console.log('Order confirmation sent:', result);
}

// ==========================================
// 3. ORDER STATUS UPDATE EMAIL
// ==========================================

export async function sendOrderStatusUpdateExample() {
  const result = await emailService.sendOrderStatusUpdateEmail(
    {
      orderNumber: 'ORD-2024-001',
      customerName: 'Maria Santos',
      oldStatus: 'confirmado',
      newStatus: 'enviado',
      statusMessage: 'Seu pedido foi enviado e está a caminho!',
      orderLink: 'https://b2bvendas.com/orders/ORD-2024-001',
      trackingCode: 'BR123456789PT',
    },
    'maria@example.com'
  );

  console.log('Status update sent:', result);
}

// ==========================================
// 4. ORDER SHIPPED EMAIL
// ==========================================

export async function sendOrderShippedExample() {
  const result = await emailService.sendOrderShippedEmail(
    {
      orderNumber: 'ORD-2024-001',
      customerName: 'Maria Santos',
      trackingCode: 'BR123456789PT',
      trackingUrl: 'https://tracking.correios.com.br/BR123456789PT',
      carrier: 'Correios',
      estimatedDelivery: '28 de Janeiro de 2024',
      items: [
        { name: 'Notebook Dell Inspiron 15', quantity: 2 },
        { name: 'Mouse Logitech MX Master', quantity: 5 },
      ],
      shippingAddress: {
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
      },
    },
    'maria@example.com'
  );

  console.log('Shipped notification sent:', result);
}

// ==========================================
// 5. ORDER DELIVERED EMAIL
// ==========================================

export async function sendOrderDeliveredExample() {
  const result = await emailService.sendOrderDeliveredEmail(
    {
      orderNumber: 'ORD-2024-001',
      customerName: 'Maria Santos',
      deliveryDate: '27 de Janeiro de 2024',
      feedbackLink: 'https://b2bvendas.com/feedback/ORD-2024-001',
    },
    'maria@example.com'
  );

  console.log('Delivery confirmation sent:', result);
}

// ==========================================
// 6. PASSWORD RESET EMAIL
// ==========================================

export async function sendPasswordResetExample() {
  const result = await emailService.sendPasswordResetEmail(
    {
      userName: 'João Silva',
      resetLink: 'https://b2bvendas.com/reset-password?token=xyz789',
      expiresIn: '1 hora',
    },
    'joao@example.com'
  );

  console.log('Password reset sent:', result);
}

// ==========================================
// 7. LOW STOCK ALERT EMAIL
// ==========================================

export async function sendLowStockAlertExample() {
  const result = await emailService.sendLowStockAlertEmail(
    {
      supplierName: 'Tech Solutions Ltda',
      products: [
        {
          name: 'Notebook Dell Inspiron 15',
          sku: 'NB-DELL-INS15',
          currentStock: 3,
          minStock: 10,
        },
        {
          name: 'Mouse Logitech MX Master',
          sku: 'MS-LOG-MXM',
          currentStock: 0,
          minStock: 20,
        },
        {
          name: 'Teclado Mecânico Razer',
          sku: 'KB-RAZ-MEC',
          currentStock: 5,
          minStock: 15,
        },
      ],
      dashboardLink: 'https://b2bvendas.com/dashboard/inventory',
    },
    'supplier@example.com'
  );

  console.log('Low stock alert sent:', result);
}

// ==========================================
// 8. CUSTOM EMAIL
// ==========================================

export async function sendCustomEmailExample() {
  const result = await emailService.sendEmail(
    {
      to: 'customer@example.com',
      subject: 'Promoção Especial - 50% OFF',
      html: `
        <h1>Promoção Especial!</h1>
        <p>Aproveite 50% de desconto em todos os produtos!</p>
        <a href="https://b2bvendas.com/promocao">Ver Promoção</a>
      `,
      text: 'Promoção Especial! Aproveite 50% de desconto em todos os produtos!',
      tags: ['promocao', 'marketing'],
      metadata: {
        campaign: 'promo-janeiro-2024',
        segment: 'vip',
      },
    },
    true // Use queue
  );

  console.log('Custom email sent:', result);
}

// ==========================================
// 9. SEND BULK EMAILS
// ==========================================

export async function sendBulkEmailsExample() {
  const customers = [
    { name: 'Cliente 1', email: 'cliente1@example.com' },
    { name: 'Cliente 2', email: 'cliente2@example.com' },
    { name: 'Cliente 3', email: 'cliente3@example.com' },
  ];

  const emails = customers.map((customer) => ({
    to: customer.email,
    subject: 'Novidades B2B Vendas',
    template: 'welcome',
    templateData: {
      userName: customer.name,
      userEmail: customer.email,
    },
  }));

  const results = await emailService.sendBulkEmails(emails);

  console.log('Bulk emails sent:', results.length);
}

// ==========================================
// 10. GET EMAIL STATISTICS
// ==========================================

export async function getEmailStatsExample() {
  const stats = await emailService.getEmailStats(
    new Date('2024-01-01'),
    new Date('2024-01-31')
  );

  console.log('Email statistics:', {
    total: stats.total,
    sent: stats.byStatus.sent || 0,
    failed: stats.byStatus.failed || 0,
    pending: stats.byStatus.pending || 0,
    templates: stats.byTemplate,
  });
}

// ==========================================
// 11. RESEND FAILED EMAIL
// ==========================================

export async function resendFailedEmailExample() {
  const emailLogId = 'clxxx...'; // Email log ID from database
  
  const result = await emailService.resendEmail(emailLogId);

  console.log('Email resend result:', result);
}

// ==========================================
// 12. IMMEDIATE SEND (WITHOUT QUEUE)
// ==========================================

export async function sendImmediateEmailExample() {
  // For critical emails that need immediate delivery
  const result = await emailService.sendPasswordResetEmail(
    {
      userName: 'João Silva',
      resetLink: 'https://b2bvendas.com/reset-password?token=xyz789',
      expiresIn: '1 hora',
    },
    'joao@example.com',
    false // Don't use queue - send immediately
  );

  console.log('Immediate email sent:', result);
}

// ==========================================
// INTEGRATION EXAMPLES
// ==========================================

// Example: Send order confirmation after order creation
export async function onOrderCreated(order: any, customerEmail: string) {
  await emailService.sendOrderConfirmationEmail(
    {
      orderNumber: order.numeroPedido,
      customerName: order.cliente.usuario.nome,
      items: order.itens.map((item: any) => ({
        name: item.produto.nome,
        quantity: item.quantidade,
        price: Number(item.precoUnitario),
        total: Number(item.precoTotal),
      })),
      subtotal: Number(order.subtotal),
      shipping: Number(order.frete),
      discount: Number(order.desconto),
      total: Number(order.total),
      orderDate: new Date(order.criadoEm).toLocaleDateString('pt-BR'),
      estimatedDelivery: order.previsaoEntrega
        ? new Date(order.previsaoEntrega).toLocaleDateString('pt-BR')
        : undefined,
      shippingAddress: order.enderecoEntrega
        ? {
            address: order.enderecoEntrega,
            city: order.cidadeEntrega!,
            state: order.estadoEntrega!,
            zipCode: order.cepEntrega!,
          }
        : undefined,
    },
    customerEmail
  );
}

// Example: Send status update when order status changes
export async function onOrderStatusChanged(
  order: any,
  oldStatus: string,
  newStatus: string,
  customerEmail: string
) {
  const statusMessages: Record<string, string> = {
    confirmado: 'Seu pedido foi confirmado e está sendo processado.',
    processando: 'Seu pedido está sendo preparado para envio.',
    enviado: 'Seu pedido foi enviado e está a caminho!',
    entregue: 'Seu pedido foi entregue com sucesso!',
    cancelado: 'Seu pedido foi cancelado.',
  };

  await emailService.sendOrderStatusUpdateEmail(
    {
      orderNumber: order.numeroPedido,
      customerName: order.cliente.usuario.nome,
      oldStatus,
      newStatus,
      statusMessage: statusMessages[newStatus] || 'O status do seu pedido foi atualizado.',
      orderLink: `https://b2bvendas.com/orders/${order.numeroPedido}`,
      trackingCode: order.codigoRastreio || undefined,
    },
    customerEmail
  );
}

// Example: Check stock and send alert if low
export async function checkStockAndAlert(fornecedorId: string) {
  // This would be run periodically (e.g., daily cron job)
  const produtos = await prisma.produto.findMany({
    where: {
      fornecedorId,
      quantidadeEstoque: {
        lte: prisma.raw('estoque_minimo'),
      },
    },
    include: {
      fornecedor: {
        include: {
          usuario: true,
        },
      },
    },
  });

  if (produtos.length > 0) {
    await emailService.sendLowStockAlertEmail(
      {
        supplierName: produtos[0].fornecedor.nomeFantasia || produtos[0].fornecedor.razaoSocial,
        products: produtos.map((p) => ({
          name: p.nome,
          sku: p.sku,
          currentStock: p.quantidadeEstoque,
          minStock: p.estoqueMinimo,
        })),
        dashboardLink: 'https://b2bvendas.com/dashboard/inventory',
      },
      produtos[0].fornecedor.usuario.email
    );
  }
}
