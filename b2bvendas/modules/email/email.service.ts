import { EmailStatus } from '@prisma/client';
import { emailService as baseEmailService } from '@/lib/email/email-service';
import { addEmailToQueue } from '@/lib/email/email-queue';
import { emailRepository } from './email.repository';
import {
  SendEmailOptions,
  EmailResult,
  WelcomeEmailData,
  OrderConfirmationEmailData,
  OrderStatusUpdateEmailData,
  OrderShippedEmailData,
  OrderDeliveredEmailData,
  PasswordResetEmailData,
  LowStockAlertEmailData,
} from './email.types';
import { logger } from '@/lib/logger';

// ==========================================
// EMAIL SERVICE WITH BUSINESS LOGIC
// ==========================================

class EmailService {
  /**
   * Send email with logging
   */
  async sendEmail(options: SendEmailOptions, useQueue: boolean = true): Promise<EmailResult> {
    try {
      // Create initial log entry
      const emailLog = await emailRepository.create({
        to: typeof options.to === 'string' ? options.to : Array.isArray(options.to) ? options.to[0].toString() : options.to.email,
        from: typeof options.from === 'string' ? options.from : options.from?.email || process.env.EMAIL_FROM || 'noreply@b2bvendas.com',
        subject: options.subject,
        template: options.template || 'custom',
        status: EmailStatus.pending,
        templateData: options.templateData,
        metadata: options.metadata,
        tags: options.tags,
      });

      // Send via queue or directly
      if (useQueue) {
        const jobId = await addEmailToQueue(options, options.priority);
        
        await emailRepository.update(emailLog.id, {
          metadata: { ...options.metadata, jobId },
        });

        return {
          success: true,
          messageId: emailLog.id,
        };
      } else {
        // Send directly
        const result = await baseEmailService.send(options);

        // Update log with result
        await emailRepository.update(emailLog.id, {
          status: result.success ? EmailStatus.sent : EmailStatus.failed,
          externalId: result.externalId,
          errorMessage: result.error,
          attempts: 1,
        });

        return result;
      }
    } catch (error) {
      logger.error('Error in sendEmail:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(data: WelcomeEmailData, useQueue: boolean = true): Promise<EmailResult> {
    return this.sendEmail({
      to: data.userEmail,
      subject: 'Bem-vindo ao B2B Vendas!',
      template: 'welcome',
      templateData: data,
      tags: ['welcome', 'onboarding'],
    }, useQueue);
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(
    data: OrderConfirmationEmailData,
    recipientEmail: string,
    useQueue: boolean = true
  ): Promise<EmailResult> {
    return this.sendEmail({
      to: recipientEmail,
      subject: `Pedido #${data.orderNumber} Confirmado`,
      template: 'order-confirmation',
      templateData: data,
      tags: ['order', 'confirmation'],
      priority: 'high',
    }, useQueue);
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdateEmail(
    data: OrderStatusUpdateEmailData,
    recipientEmail: string,
    useQueue: boolean = true
  ): Promise<EmailResult> {
    return this.sendEmail({
      to: recipientEmail,
      subject: `Status do Pedido #${data.orderNumber} Atualizado`,
      template: 'order-status-update',
      templateData: data,
      tags: ['order', 'status-update'],
      priority: 'high',
    }, useQueue);
  }

  /**
   * Send order shipped email
   */
  async sendOrderShippedEmail(
    data: OrderShippedEmailData,
    recipientEmail: string,
    useQueue: boolean = true
  ): Promise<EmailResult> {
    return this.sendEmail({
      to: recipientEmail,
      subject: `Pedido #${data.orderNumber} Enviado`,
      template: 'order-shipped',
      templateData: data,
      tags: ['order', 'shipped'],
      priority: 'high',
    }, useQueue);
  }

  /**
   * Send order delivered email
   */
  async sendOrderDeliveredEmail(
    data: OrderDeliveredEmailData,
    recipientEmail: string,
    useQueue: boolean = true
  ): Promise<EmailResult> {
    return this.sendEmail({
      to: recipientEmail,
      subject: `Pedido #${data.orderNumber} Entregue`,
      template: 'order-delivered',
      templateData: data,
      tags: ['order', 'delivered'],
    }, useQueue);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    data: PasswordResetEmailData,
    recipientEmail: string,
    useQueue: boolean = true
  ): Promise<EmailResult> {
    return this.sendEmail({
      to: recipientEmail,
      subject: 'Redefinição de Senha - B2B Vendas',
      template: 'password-reset',
      templateData: data,
      tags: ['security', 'password-reset'],
      priority: 'high',
    }, useQueue);
  }

  /**
   * Send low stock alert email
   */
  async sendLowStockAlertEmail(
    data: LowStockAlertEmailData,
    recipientEmail: string,
    useQueue: boolean = true
  ): Promise<EmailResult> {
    return this.sendEmail({
      to: recipientEmail,
      subject: `Alerta: ${data.products.length} Produto(s) com Estoque Baixo`,
      template: 'low-stock-alert',
      templateData: data,
      tags: ['alert', 'low-stock', 'inventory'],
      priority: 'normal',
    }, useQueue);
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(emails: SendEmailOptions[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];

    for (const email of emails) {
      const result = await this.sendEmail(email, true);
      results.push(result);
    }

    logger.info('Bulk emails queued', { count: results.length });

    return results;
  }

  /**
   * Resend failed email
   */
  async resendEmail(emailLogId: string): Promise<EmailResult> {
    const emailLog = await emailRepository.findById(emailLogId);

    if (!emailLog) {
      return {
        success: false,
        error: 'Email log not found',
      };
    }

    if (emailLog.attempts >= 3) {
      return {
        success: false,
        error: 'Maximum retry attempts reached',
      };
    }

    await emailRepository.incrementAttempt(emailLogId);

    const options: SendEmailOptions = {
      to: emailLog.to,
      from: emailLog.from,
      subject: emailLog.subject,
      template: emailLog.template,
      templateData: emailLog.templateData as Record<string, any>,
      tags: emailLog.tags,
    };

    return this.sendEmail(options, false);
  }

  /**
   * Get email statistics
   */
  async getEmailStats(startDate?: Date, endDate?: Date) {
    return emailRepository.getStats(startDate, endDate);
  }

  /**
   * Get email logs by recipient
   */
  async getEmailsByRecipient(email: string, limit: number = 50) {
    return emailRepository.findByRecipient(email, limit);
  }

  /**
   * Get email logs by template
   */
  async getEmailsByTemplate(template: string, limit: number = 50) {
    return emailRepository.findByTemplate(template, limit);
  }

  /**
   * Clean old email logs
   */
  async cleanOldLogs(daysOld: number = 90) {
    return emailRepository.deleteOldLogs(daysOld);
  }

  /**
   * Track email open
   */
  async trackEmailOpen(externalId: string) {
    return emailRepository.markAsOpened(externalId);
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;