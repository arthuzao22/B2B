import * as React from 'react';
import { Text, Heading, Button, Section } from '@react-email/components';
import BaseEmailTemplate from './base-template';
import { OrderDeliveredEmailData } from '@/modules/email/email.types';

interface OrderDeliveredEmailProps extends OrderDeliveredEmailData {}

export const OrderDeliveredEmail: React.FC<OrderDeliveredEmailProps> = ({
  orderNumber,
  customerName,
  deliveryDate,
  feedbackLink,
}) => {
  return (
    <BaseEmailTemplate previewText={`Pedido ${orderNumber} entregue`}>
      <Section style={successIcon}>
        <Text style={iconText}>✅</Text>
      </Section>

      <Heading style={h1}>Pedido Entregue com Sucesso!</Heading>

      <Text style={text}>
        Olá <strong>{customerName}</strong>,
      </Text>

      <Text style={text}>
        Seu pedido <strong>#{orderNumber}</strong> foi entregue com sucesso em{' '}
        <strong>{deliveryDate}</strong>.
      </Text>

      <Section style={infoBox}>
        <Text style={infoText}>
          Esperamos que você esteja satisfeito com sua compra! Se você tiver alguma
          dúvida ou problema com os produtos recebidos, não hesite em entrar em contato.
        </Text>
      </Section>

      {feedbackLink && (
        <>
          <Text style={text}>
            Sua opinião é muito importante para nós! Por favor, reserve um momento
            para avaliar sua experiência de compra.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={feedbackLink}>
              Avaliar Minha Compra
            </Button>
          </Section>
        </>
      )}

      <Section style={nextStepsBox}>
        <Heading style={h2}>Próximos Passos</Heading>
        <Text style={listItem}>✓ Verifique se todos os itens estão corretos</Text>
        <Text style={listItem}>✓ Teste os produtos recebidos</Text>
        <Text style={listItem}>✓ Entre em contato se houver algum problema</Text>
        <Text style={listItem}>✓ Compartilhe sua experiência conosco</Text>
      </Section>

      <Text style={text}>
        Obrigado por escolher o B2B Vendas. Esperamos vê-lo novamente em breve!
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

const successIcon = {
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
  margin: '0 0 16px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const infoBox = {
  backgroundColor: '#f0fdf4',
  borderLeft: '4px solid #10b981',
  borderRadius: '4px',
  padding: '16px',
  margin: '24px 0',
};

const infoText = {
  color: '#166534',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
};

const buttonContainer = {
  margin: '32px 0',
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

const nextStepsBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const listItem = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
};

export default OrderDeliveredEmail;
