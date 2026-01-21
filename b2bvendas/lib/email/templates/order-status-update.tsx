import * as React from 'react';
import { Text, Heading, Button, Section } from '@react-email/components';
import BaseEmailTemplate from './base-template';
import { OrderStatusUpdateEmailData } from '@/modules/email/email.types';

interface OrderStatusUpdateEmailProps extends OrderStatusUpdateEmailData {}

export const OrderStatusUpdateEmail: React.FC<OrderStatusUpdateEmailProps> = ({
  orderNumber,
  customerName,
  oldStatus,
  newStatus,
  statusMessage,
  orderLink,
  trackingCode,
}) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendente: '#f59e0b',
      confirmado: '#3b82f6',
      processando: '#8b5cf6',
      enviado: '#10b981',
      entregue: '#059669',
      cancelado: '#ef4444',
    };
    return colors[status.toLowerCase()] || '#6b7280';
  };

  return (
    <BaseEmailTemplate previewText={`Status do pedido ${orderNumber} atualizado`}>
      <Heading style={h1}>Status do Pedido Atualizado</Heading>

      <Text style={text}>
        Olá <strong>{customerName}</strong>,
      </Text>

      <Text style={text}>
        O status do seu pedido <strong>#{orderNumber}</strong> foi atualizado.
      </Text>

      <Section style={statusBox}>
        <div style={statusRow}>
          <div style={statusBadge(getStatusColor(oldStatus))}>
            {oldStatus}
          </div>
          <span style={arrow}>→</span>
          <div style={statusBadge(getStatusColor(newStatus))}>
            {newStatus}
          </div>
        </div>
      </Section>

      <Section style={messageBox}>
        <Text style={messageText}>{statusMessage}</Text>
      </Section>

      {trackingCode && (
        <Section style={trackingBox}>
          <Text style={trackingLabel}>Código de Rastreamento:</Text>
          <Text style={trackingCode}>{trackingCode}</Text>
        </Section>
      )}

      <Section style={buttonContainer}>
        <Button style={button} href={orderLink}>
          Ver Detalhes do Pedido
        </Button>
      </Section>

      <Text style={text}>
        Atenciosamente,<br />
        <strong>Equipe B2B Vendas</strong>
      </Text>
    </BaseEmailTemplate>
  );
};

// ==========================================
// STYLES
// ==========================================

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '36px',
  margin: '0 0 20px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const statusBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const statusRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
};

const statusBadge = (color: string) => ({
  backgroundColor: color,
  color: '#ffffff',
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
});

const arrow = {
  fontSize: '24px',
  color: '#9ca3af',
  fontWeight: '600',
};

const messageBox = {
  backgroundColor: '#eff6ff',
  borderLeft: '4px solid #3b82f6',
  borderRadius: '4px',
  padding: '16px',
  margin: '24px 0',
};

const messageText = {
  color: '#1e40af',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
};

const trackingBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const trackingLabel = {
  color: '#166534',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const trackingCode = {
  color: '#15803d',
  fontSize: '20px',
  fontWeight: '700',
  fontFamily: 'monospace',
  margin: '0',
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#4F46E5',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

export default OrderStatusUpdateEmail;
