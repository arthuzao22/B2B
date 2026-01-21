import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Img,
} from '@react-email/components';

interface BaseEmailTemplateProps {
  children: React.ReactNode;
  previewText?: string;
}

export const BaseEmailTemplate: React.FC<BaseEmailTemplateProps> = ({
  children,
  previewText = 'B2B Marketplace',
}) => {
  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>{previewText}</title>
      </Head>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://via.placeholder.com/150x50/4F46E5/ffffff?text=B2B+Vendas"
              alt="B2B Vendas"
              width="150"
              height="50"
              style={logo}
            />
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} B2B Vendas. Todos os direitos reservados.
            </Text>
            <Text style={footerText}>
              Este é um email transacional do sistema B2B Vendas.
            </Text>
            <Text style={footerText}>
              <Link href="{{unsubscribe_url}}" style={footerLink}>
                Gerenciar preferências de email
              </Link>
              {' | '}
              <Link href="{{base_url}}/politica-privacidade" style={footerLink}>
                Política de Privacidade
              </Link>
              {' | '}
              <Link href="{{base_url}}/termos" style={footerLink}>
                Termos de Uso
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// ==========================================
// STYLES
// ==========================================

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
};

const header = {
  padding: '20px 40px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #e6e6e6',
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '40px 40px',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '20px 0',
};

const footer = {
  padding: '20px 40px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '4px 0',
};

const footerLink = {
  color: '#4F46E5',
  textDecoration: 'underline',
};

export default BaseEmailTemplate;
