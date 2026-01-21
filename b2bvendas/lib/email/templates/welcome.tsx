import * as React from 'react';
import { Text, Heading, Button, Section } from '@react-email/components';
import BaseEmailTemplate from './base-template';
import { WelcomeEmailData } from '@/modules/email/email.types';

interface WelcomeEmailProps extends WelcomeEmailData {}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  userName,
  userEmail,
  companyName,
  activationLink,
}) => {
  return (
    <BaseEmailTemplate previewText={`Bem-vindo ao B2B Vendas, ${userName}!`}>
      <Heading style={h1}>Bem-vindo ao B2B Vendas! 🎉</Heading>
      
      <Text style={text}>
        Olá <strong>{userName}</strong>,
      </Text>
      
      <Text style={text}>
        Estamos muito felizes em ter você conosco! Sua conta foi criada com sucesso
        e você já pode começar a aproveitar todos os recursos da nossa plataforma B2B.
      </Text>

      {companyName && (
        <Text style={text}>
          <strong>Empresa:</strong> {companyName}
        </Text>
      )}

      <Text style={text}>
        <strong>Email:</strong> {userEmail}
      </Text>

      {activationLink && (
        <Section style={buttonContainer}>
          <Button style={button} href={activationLink}>
            Ativar Minha Conta
          </Button>
        </Section>
      )}

      <Section style={infoBox}>
        <Heading style={h2}>O que você pode fazer agora:</Heading>
        <Text style={listItem}>✓ Explorar nosso catálogo de produtos</Text>
        <Text style={listItem}>✓ Configurar seu perfil empresarial</Text>
        <Text style={listItem}>✓ Conectar-se com fornecedores</Text>
        <Text style={listItem}>✓ Fazer seu primeiro pedido</Text>
      </Section>

      <Text style={text}>
        Se você tiver alguma dúvida ou precisar de ajuda, nossa equipe de suporte
        está sempre pronta para ajudar.
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
  margin: '0 0 12px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
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

const infoBox = {
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

export default WelcomeEmail;
