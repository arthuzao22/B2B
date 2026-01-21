import * as React from 'react';
import { Text, Heading, Button, Section, Hr } from '@react-email/components';
import BaseEmailTemplate from './base-template';
import { LowStockAlertEmailData } from '@/modules/email/email.types';

interface LowStockAlertEmailProps extends LowStockAlertEmailData {}

export const LowStockAlertEmail: React.FC<LowStockAlertEmailProps> = ({
  supplierName,
  products,
  dashboardLink,
}) => {
  return (
    <BaseEmailTemplate previewText="Alerta de estoque baixo">
      <Section style={alertIcon}>
        <Text style={iconText}>⚠️</Text>
      </Section>

      <Heading style={h1}>Alerta de Estoque Baixo</Heading>

      <Text style={text}>
        Olá <strong>{supplierName}</strong>,
      </Text>

      <Text style={text}>
        Alguns dos seus produtos estão com estoque baixo e precisam de reposição urgente.
      </Text>

      <Section style={alertBox}>
        <Text style={alertText}>
          <strong>{products.length}</strong> produto(s) precisam de atenção imediata
        </Text>
      </Section>

      <Heading style={h2}>Produtos com Estoque Baixo</Heading>

      <Section style={productsContainer}>
        {products.map((product, index) => (
          <React.Fragment key={index}>
            <Section style={productCard}>
              <Text style={productName}>{product.name}</Text>
              <Text style={productSku}>SKU: {product.sku}</Text>
              <div style={stockRow}>
                <div style={stockColumn}>
                  <Text style={stockLabel}>Estoque Atual</Text>
                  <Text style={stockValueLow}>{product.currentStock}</Text>
                </div>
                <div style={stockColumn}>
                  <Text style={stockLabel}>Estoque Mínimo</Text>
                  <Text style={stockValue}>{product.minStock}</Text>
                </div>
                <div style={stockColumn}>
                  <Text style={stockLabel}>Status</Text>
                  <Text style={statusBadge}>
                    {product.currentStock === 0 ? 'SEM ESTOQUE' : 'BAIXO'}
                  </Text>
                </div>
              </div>
            </Section>
            {index < products.length - 1 && <Hr style={productHr} />}
          </React.Fragment>
        ))}
      </Section>

      <Section style={infoBox}>
        <Text style={infoText}>
          <strong>Ação Recomendada:</strong> Faça a reposição do estoque o quanto
          antes para evitar perda de vendas e manter a satisfação dos seus clientes.
        </Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={dashboardLink}>
          Gerenciar Estoque
        </Button>
      </Section>

      <Section style={tipBox}>
        <Heading style={h3}>💡 Dicas para Gestão de Estoque</Heading>
        <Text style={tipText}>
          • Configure alertas automáticos para níveis críticos
        </Text>
        <Text style={tipText}>
          • Mantenha um estoque de segurança adequado
        </Text>
        <Text style={tipText}>
          • Analise o histórico de vendas para prever demanda
        </Text>
        <Text style={tipText}>
          • Automatize pedidos de reposição quando possível
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

const alertIcon = {
  textAlign: 'center' as const,
  margin: '0 0 20px',
};

const iconText = {
  fontSize: '64px',
  lineHeight: '64px',
  margin: '0',
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '36px',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '24px 0 16px',
};

const h3 = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0 0 12px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const alertBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #f59e0b',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const alertText = {
  color: '#92400e',
  fontSize: '18px',
  fontWeight: '700',
  lineHeight: '24px',
  margin: '0',
};

const productsContainer = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const productCard = {
  padding: '12px 0',
};

const productName = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0 0 4px',
};

const productSku = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 12px',
  fontFamily: 'monospace',
};

const stockRow = {
  display: 'flex',
  gap: '16px',
  justifyContent: 'space-between',
};

const stockColumn = {
  flex: 1,
  textAlign: 'center' as const,
};

const stockLabel = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
};

const stockValue = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '700',
  lineHeight: '28px',
  margin: '0',
};

const stockValueLow = {
  color: '#dc2626',
  fontSize: '20px',
  fontWeight: '700',
  lineHeight: '28px',
  margin: '0',
};

const statusBadge = {
  color: '#dc2626',
  fontSize: '12px',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0',
};

const productHr = {
  borderColor: '#e5e7eb',
  margin: '12px 0',
};

const infoBox = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #ef4444',
  borderRadius: '4px',
  padding: '16px',
  margin: '24px 0',
};

const infoText = {
  color: '#991b1b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#ef4444',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const tipBox = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const tipText = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '6px 0',
};

export default LowStockAlertEmail;
