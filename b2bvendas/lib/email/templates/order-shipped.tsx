import * as React from 'react';
import { Text, Heading, Button, Section, Hr } from '@react-email/components';
import BaseEmailTemplate from './base-template';
import { OrderShippedEmailData } from '@/modules/email/email.types';

interface OrderShippedEmailProps extends OrderShippedEmailData {}

export const OrderShippedEmail: React.FC<OrderShippedEmailProps> = ({
  orderNumber,
  customerName,
  trackingCode,
  trackingUrl,
  carrier,
  estimatedDelivery,
  items,
  shippingAddress,
}) => {
  return (
    <BaseEmailTemplate previewText={`Pedido ${orderNumber} enviado`}>
      <Heading style={h1}>Seu Pedido Foi Enviado! 📦</Heading>

      <Text style={text}>
        Olá <strong>{customerName}</strong>,
      </Text>

      <Text style={text}>
        Boas notícias! Seu pedido <strong>#{orderNumber}</strong> foi enviado e está
        a caminho!
      </Text>

      <Section style={trackingBox}>
        <Text style={trackingTitle}>Código de Rastreamento</Text>
        <Text style={trackingCode}>{trackingCode}</Text>
        {carrier && (
          <Text style={carrierText}>
            Transportadora: <strong>{carrier}</strong>
          </Text>
        )}
        <Text style={deliveryText}>
          Previsão de entrega: <strong>{estimatedDelivery}</strong>
        </Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={trackingUrl}>
          Rastrear Pedido
        </Button>
      </Section>

      <Heading style={h2}>Itens do Pedido</Heading>
      <Section style={itemsBox}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <Text style={itemText}>
              {item.quantity}× {item.name}
            </Text>
            {index < items.length - 1 && <Hr style={itemHr} />}
          </React.Fragment>
        ))}
      </Section>

      <Heading style={h2}>Endereço de Entrega</Heading>
      <Section style={addressBox}>
        <Text style={addressText}>{shippingAddress.address}</Text>
        <Text style={addressText}>
          {shippingAddress.city}, {shippingAddress.state}
        </Text>
        <Text style={addressText}>CEP: {shippingAddress.zipCode}</Text>
      </Section>

      <Section style={tipBox}>
        <Text style={tipText}>
          💡 <strong>Dica:</strong> Certifique-se de que alguém estará disponível
          no endereço de entrega para receber o pedido.
        </Text>
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

const h2 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '24px 0 16px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const trackingBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #10b981',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const trackingTitle = {
  color: '#166534',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 12px',
};

const trackingCode = {
  color: '#15803d',
  fontSize: '24px',
  fontWeight: '700',
  fontFamily: 'monospace',
  margin: '0 0 16px',
};

const carrierText = {
  color: '#166534',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
};

const deliveryText = {
  color: '#166534',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
};

const buttonContainer = {
  margin: '24px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#10b981',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const itemsBox = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
};

const itemText = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
};

const itemHr = {
  borderColor: '#e5e7eb',
  margin: '8px 0',
};

const addressBox = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
};

const addressText = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '4px 0',
};

const tipBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const tipText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

export default OrderShippedEmail;
