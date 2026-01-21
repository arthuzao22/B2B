import * as React from 'react';
import { Text, Heading, Button, Section } from '@react-email/components';
import BaseEmailTemplate from './base-template';
import { PasswordResetEmailData } from '@/modules/email/email.types';

interface PasswordResetEmailProps extends PasswordResetEmailData {}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  userName,
  resetLink,
  expiresIn,
}) => {
  return (
    <BaseEmailTemplate previewText="Redefinição de senha solicitada">
      <Heading style={h1}>Redefinição de Senha</Heading>

      <Text style={text}>
        Olá <strong>{userName}</strong>,
      </Text>

      <Text style={text}>
        Recebemos uma solicitação para redefinir a senha da sua conta. Se você não
        fez esta solicitação, pode ignorar este email com segurança.
      </Text>

      <Section style={warningBox}>
        <Text style={warningText}>
          ⚠️ Este link expira em <strong>{expiresIn}</strong>.
        </Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={resetLink}>
          Redefinir Minha Senha
        </Button>
      </Section>

      <Text style={text}>
        Ou copie e cole este link no seu navegador:
      </Text>

      <Section style={linkBox}>
        <Text style={linkText}>{resetLink}</Text>
      </Section>

      <Section style={securityBox}>
        <Heading style={h2}>Dicas de Segurança</Heading>
        <Text style={securityText}>
          • Nunca compartilhe sua senha com ninguém
        </Text>
        <Text style={securityText}>
          • Use uma senha forte e única
        </Text>
        <Text style={securityText}>
          • Ative a autenticação de dois fatores quando disponível
        </Text>
        <Text style={securityText}>
          • Desconfie de emails suspeitos solicitando sua senha
        </Text>
      </Section>

      <Text style={text}>
        Se você não solicitou esta redefinição de senha, recomendamos que entre em
        contato com nossa equipe de suporte imediatamente.
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
  fontSize: '18px',
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

const warningBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #f59e0b',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const warningText = {
  color: '#92400e',
  fontSize: '15px',
  fontWeight: '600',
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

const linkBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '6px',
  padding: '12px',
  margin: '16px 0',
  wordBreak: 'break-all' as const,
};

const linkText = {
  color: '#4F46E5',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
  fontFamily: 'monospace',
};

const securityBox = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const securityText = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '6px 0',
};

export default PasswordResetEmail;
