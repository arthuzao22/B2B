import * as React from 'react';
import { Text, Heading, Section, Hr, Row, Column } from '@react-email/components';
import BaseEmailTemplate from './base-template';
import { OrderConfirmationEmailData } from '@/modules/email/email.types';

interface OrderConfirmationEmailProps extends OrderConfirmationEmailData {}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  orderNumber,
  customerName,
  items,
  subtotal,
  shipping,
  discount,
  total,
  orderDate,
  estimatedDelivery,
  shippingAddress,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <BaseEmailTemplate previewText={`Pedido ${orderNumber} confirmado`}>
      <Heading style={h1}>Pedido Confirmado! 🎉</Heading>

      <Text style={text}>
        Olá <strong>{customerName}</strong>,
      </Text>

      <Text style={text}>
        Seu pedido foi confirmado e está sendo processado. Obrigado por comprar conosco!
      </Text>

      <Section style={orderInfoBox}>
        <Text style={orderInfoText}>
          <strong>Número do Pedido:</strong> #{orderNumber}
        </Text>
        <Text style={orderInfoText}>
          <strong>Data do Pedido:</strong> {orderDate}
        </Text>
        {estimatedDelivery && (
          <Text style={orderInfoText}>
            <strong>Previsão de Entrega:</strong> {estimatedDelivery}
          </Text>
        )}
      </Section>

      <Heading style={h2}>Itens do Pedido</Heading>

      <Section style={itemsContainer}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <Row style={itemRow}>
              <Column style={itemColumn}>
                <Text style={itemName}>{item.name}</Text>
                <Text style={itemDetails}>
                  Quantidade: {item.quantity} × {formatCurrency(item.price)}
                </Text>
              </Column>
              <Column style={itemPriceColumn}>
                <Text style={itemPrice}>{formatCurrency(item.total)}</Text>
              </Column>
            </Row>
            {index < items.length - 1 && <Hr style={itemHr} />}
          </React.Fragment>
        ))}
      </Section>

      <Section style={totalsContainer}>
        <Row style={totalRow}>
          <Column>
            <Text style={totalLabel}>Subtotal:</Text>
          </Column>
          <Column style={totalValueColumn}>
            <Text style={totalValue}>{formatCurrency(subtotal)}</Text>
          </Column>
        </Row>

        {discount > 0 && (
          <Row style={totalRow}>
            <Column>
              <Text style={totalLabel}>Desconto:</Text>
            </Column>
            <Column style={totalValueColumn}>
              <Text style={discountValue}>-{formatCurrency(discount)}</Text>
            </Column>
          </Row>
        )}

        <Row style={totalRow}>
          <Column>
            <Text style={totalLabel}>Frete:</Text>
          </Column>
          <Column style={totalValueColumn}>
            <Text style={totalValue}>{formatCurrency(shipping)}</Text>
          </Column>
        </Row>

        <Hr style={totalHr} />

        <Row style={totalRow}>
          <Column>
            <Text style={grandTotalLabel}>Total:</Text>
          </Column>
          <Column style={totalValueColumn}>
            <Text style={grandTotalValue}>{formatCurrency(total)}</Text>
          </Column>
        </Row>
      </Section>

      {shippingAddress && (
        <>
          <Heading style={h2}>Endereço de Entrega</Heading>
          <Section style={addressBox}>
            <Text style={addressText}>{shippingAddress.address}</Text>
            <Text style={addressText}>
              {shippingAddress.city}, {shippingAddress.state}
            </Text>
            <Text style={addressText}>CEP: {shippingAddress.zipCode}</Text>
          </Section>
        </>
      )}

      <Text style={text}>
        Você receberá atualizações sobre o status do seu pedido por email.
      </Text>

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

const orderInfoBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const orderInfoText = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '4px 0',
};

const itemsContainer = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
};

const itemRow = {
  margin: '12px 0',
};

const itemColumn = {
  verticalAlign: 'top' as const,
};

const itemPriceColumn = {
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
};

const itemName = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0 0 4px',
};

const itemDetails = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const itemPrice = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0',
};

const itemHr = {
  borderColor: '#e5e7eb',
  margin: '12px 0',
};

const totalsContainer = {
  margin: '24px 0',
  padding: '20px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
};

const totalRow = {
  margin: '8px 0',
};

const totalLabel = {
  color: '#6b7280',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
};

const totalValue = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
};

const totalValueColumn = {
  textAlign: 'right' as const,
};

const discountValue = {
  color: '#10b981',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
};

const totalHr = {
  borderColor: '#d1d5db',
  margin: '12px 0',
};

const grandTotalLabel = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '700',
  lineHeight: '28px',
  margin: '0',
};

const grandTotalValue = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '700',
  lineHeight: '28px',
  margin: '0',
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

export default OrderConfirmationEmail;
