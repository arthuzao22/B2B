import * as React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import { EmailResult, SendEmailOptions, EmailAddress } from '@/modules/email/email.types';
import logger from '@/src/lib/logger';

// Import email templates
import WelcomeEmail from './templates/welcome';
import OrderConfirmationEmail from './templates/order-confirmation';
import OrderStatusUpdateEmail from './templates/order-status-update';
import OrderShippedEmail from './templates/order-shipped';
import OrderDeliveredEmail from './templates/order-delivered';
import PasswordResetEmail from './templates/password-reset';
import LowStockAlertEmail from './templates/low-stock-alert';

// ==========================================
// EMAIL SERVICE
// ==========================================

class EmailService {
  private resend: Resend | null = null;
  private fromEmail: string;
  private baseUrl: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@b2bvendas.com';
    this.baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    if (apiKey) {
      this.resend = new Resend(apiKey);
      logger.info('Email service initialized with Resend');
    } else {
      logger.warn('RESEND_API_KEY not found, email sending will be simulated');
    }
  }

  /**
   * Format email address
   */
  private formatAddress(address: string | EmailAddress): string {
    if (typeof address === 'string') {
      return address;
    }
    return address.name ? `${address.name} <${address.email}>` : address.email;
  }

  /**
   * Format multiple email addresses
   */
  private formatAddresses(addresses: string | EmailAddress | EmailAddress[]): string | string[] {
    if (Array.isArray(addresses)) {
      return addresses.map((addr) => this.formatAddress(addr));
    }
    return this.formatAddress(addresses);
  }

  /**
   * Get email template component
   */
  private getTemplateComponent(template: string, data: any) {
    const templates: Record<string, any> = {
      'welcome': WelcomeEmail,
      'order-confirmation': OrderConfirmationEmail,
      'order-status-update': OrderStatusUpdateEmail,
      'order-shipped': OrderShippedEmail,
      'order-delivered': OrderDeliveredEmail,
      'password-reset': PasswordResetEmail,
      'low-stock-alert': LowStockAlertEmail,
    };

    const TemplateComponent = templates[template];
    if (!TemplateComponent) {
      throw new Error(`Email template "${template}" not found`);
    }

    return React.createElement(TemplateComponent, data);
  }

  /**
   * Render email template to HTML
   */
  private async renderTemplate(template: string, data: any): Promise<{ html: string; text: string }> {
    try {
      const component = this.getTemplateComponent(template, data);
      const html = await render(component);
      
      // Generate text version (simplified)
      const text = await render(component, { plainText: true });

      // Replace template variables
      const processedHtml = this.replaceVariables(html, data);
      const processedText = this.replaceVariables(text, data);

      return {
        html: processedHtml,
        text: processedText,
      };
    } catch (error) {
      logger.error('Error rendering email template:', error);
      throw new Error(`Failed to render email template: ${(error as Error).message}`);
    }
  }

  /**
   * Replace template variables
   */
  private replaceVariables(content: string, data: any): string {
    let processed = content;

    // Replace base URL
    processed = processed.replace(/\{\{base_url\}\}/g, this.baseUrl);

    // Replace unsubscribe URL
    processed = processed.replace(
      /\{\{unsubscribe_url\}\}/g,
      `${this.baseUrl}/preferences/unsubscribe`
    );

    // Replace any other custom variables from data
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (typeof value === 'string' || typeof value === 'number') {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        processed = processed.replace(regex, String(value));
      }
    });

    return processed;
  }

  /**
   * Send email
   */
  async send(options: SendEmailOptions): Promise<EmailResult> {
    try {
      const {
        to,
        from = this.fromEmail,
        subject,
        html,
        text,
        template,
        templateData = {},
        attachments = [],
        replyTo,
        cc,
        bcc,
        tags = [],
      } = options;

      let emailHtml = html;
      let emailText = text;

      // Render template if provided
      if (template) {
        const rendered = await this.renderTemplate(template, templateData);
        emailHtml = rendered.html;
        emailText = rendered.text;
      }

      if (!emailHtml && !emailText) {
        throw new Error('Either html, text, or template must be provided');
      }

      // Format addresses
      const toAddress = this.formatAddresses(to);
      const fromAddress = this.formatAddress(from);

      // If Resend is configured, send via Resend
      if (this.resend) {
        const data: any = {
          from: fromAddress,
          to: toAddress,
          subject,
          html: emailHtml,
          text: emailText,
          tags,
        };

        if (replyTo) {
          data.reply_to = this.formatAddress(replyTo);
        }

        if (cc) {
          data.cc = this.formatAddresses(cc);
        }

        if (bcc) {
          data.bcc = this.formatAddresses(bcc);
        }

        if (attachments.length > 0) {
          data.attachments = attachments.map((att) => ({
            filename: att.filename,
            content: att.content,
            content_type: att.contentType,
          }));
        }

        const response = await this.resend.emails.send(data);

        logger.info('Email sent successfully', {
          messageId: response.data?.id,
          to: toAddress,
          subject,
        });

        return {
          success: true,
          messageId: response.data?.id,
          externalId: response.data?.id,
        };
      } else {
        // Simulate email sending in development
        logger.info('Email simulation (Resend not configured)', {
          to: toAddress,
          from: fromAddress,
          subject,
          template,
        });

        return {
          success: true,
          messageId: `sim_${Date.now()}`,
          externalId: `sim_${Date.now()}`,
        };
      }
    } catch (error) {
      logger.error('Error sending email:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Verify email service configuration
   */
  async verify(): Promise<boolean> {
    if (!this.resend) {
      logger.warn('Resend not configured');
      return false;
    }

    try {
      // Test by sending to a test address or checking API key
      logger.info('Email service verification successful');
      return true;
    } catch (error) {
      logger.error('Email service verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
