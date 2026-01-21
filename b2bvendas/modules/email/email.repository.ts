import { prisma } from '@/src/lib/prisma';
import { EmailStatus, EmailLog } from '@prisma/client';
import { EmailLogData } from './email.types';
import logger from '@/src/lib/logger';

// ==========================================
// EMAIL REPOSITORY
// ==========================================

export class EmailRepository {
  /**
   * Create email log
   */
  async create(data: EmailLogData): Promise<EmailLog> {
    try {
      const emailLog = await prisma.emailLog.create({
        data: {
          to: data.to,
          from: data.from,
          subject: data.subject,
          template: data.template,
          status: data.status || EmailStatus.pending,
          htmlContent: data.htmlContent,
          textContent: data.textContent,
          templateData: data.templateData || {},
          externalId: data.externalId,
          errorMessage: data.errorMessage,
          attempts: data.attempts || 0,
          metadata: data.metadata || {},
          tags: data.tags || [],
        },
      });

      logger.info('Email log created', { id: emailLog.id });

      return emailLog;
    } catch (error) {
      logger.error('Error creating email log:', error);
      throw error;
    }
  }

  /**
   * Update email log
   */
  async update(id: string, data: Partial<EmailLogData>): Promise<EmailLog> {
    try {
      const emailLog = await prisma.emailLog.update({
        where: { id },
        data: {
          status: data.status,
          externalId: data.externalId,
          errorMessage: data.errorMessage,
          attempts: data.attempts,
          lastAttemptAt: data.attempts ? new Date() : undefined,
          sentAt: data.status === EmailStatus.sent ? new Date() : undefined,
          deliveredAt: data.status === EmailStatus.delivered ? new Date() : undefined,
          openedAt: data.status === EmailStatus.opened ? new Date() : undefined,
          metadata: data.metadata,
          tags: data.tags,
        },
      });

      logger.info('Email log updated', { id: emailLog.id, status: data.status });

      return emailLog;
    } catch (error) {
      logger.error('Error updating email log:', error);
      throw error;
    }
  }

  /**
   * Find email log by ID
   */
  async findById(id: string): Promise<EmailLog | null> {
    try {
      return await prisma.emailLog.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error('Error finding email log:', error);
      throw error;
    }
  }

  /**
   * Find email log by external ID
   */
  async findByExternalId(externalId: string): Promise<EmailLog | null> {
    try {
      return await prisma.emailLog.findUnique({
        where: { externalId },
      });
    } catch (error) {
      logger.error('Error finding email log by external ID:', error);
      throw error;
    }
  }

  /**
   * Find email logs by recipient
   */
  async findByRecipient(to: string, limit: number = 50): Promise<EmailLog[]> {
    try {
      return await prisma.emailLog.findMany({
        where: { to },
        orderBy: { criadoEm: 'desc' },
        take: limit,
      });
    } catch (error) {
      logger.error('Error finding email logs by recipient:', error);
      throw error;
    }
  }

  /**
   * Find email logs by template
   */
  async findByTemplate(template: string, limit: number = 50): Promise<EmailLog[]> {
    try {
      return await prisma.emailLog.findMany({
        where: { template },
        orderBy: { criadoEm: 'desc' },
        take: limit,
      });
    } catch (error) {
      logger.error('Error finding email logs by template:', error);
      throw error;
    }
  }

  /**
   * Find email logs by status
   */
  async findByStatus(status: EmailStatus, limit: number = 50): Promise<EmailLog[]> {
    try {
      return await prisma.emailLog.findMany({
        where: { status },
        orderBy: { criadoEm: 'desc' },
        take: limit,
      });
    } catch (error) {
      logger.error('Error finding email logs by status:', error);
      throw error;
    }
  }

  /**
   * Get email statistics
   */
  async getStats(startDate?: Date, endDate?: Date) {
    try {
      const where: any = {};

      if (startDate || endDate) {
        where.criadoEm = {};
        if (startDate) where.criadoEm.gte = startDate;
        if (endDate) where.criadoEm.lte = endDate;
      }

      const [total, byStatus, byTemplate] = await Promise.all([
        prisma.emailLog.count({ where }),
        prisma.emailLog.groupBy({
          by: ['status'],
          where,
          _count: true,
        }),
        prisma.emailLog.groupBy({
          by: ['template'],
          where,
          _count: true,
        }),
      ]);

      const statusStats = byStatus.reduce<Record<string, number>>((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {});

      const templateStats = byTemplate.reduce<Record<string, number>>((acc, item) => {
        acc[item.template] = item._count;
        return acc;
      }, {});

      return {
        total,
        byStatus: statusStats,
        byTemplate: templateStats,
      };
    } catch (error) {
      logger.error('Error getting email stats:', error);
      throw error;
    }
  }

  /**
   * Get failed emails for retry
   */
  async getFailedEmails(limit: number = 100): Promise<EmailLog[]> {
    try {
      return await prisma.emailLog.findMany({
        where: {
          status: EmailStatus.failed,
          attempts: { lt: 3 },
        },
        orderBy: { criadoEm: 'asc' },
        take: limit,
      });
    } catch (error) {
      logger.error('Error getting failed emails:', error);
      throw error;
    }
  }

  /**
   * Delete old email logs
   */
  async deleteOldLogs(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await prisma.emailLog.deleteMany({
        where: {
          criadoEm: { lt: cutoffDate },
        },
      });

      logger.info('Old email logs deleted', { count: result.count, daysOld });

      return result.count;
    } catch (error) {
      logger.error('Error deleting old logs:', error);
      throw error;
    }
  }

  /**
   * Mark email as opened
   */
  async markAsOpened(externalId: string): Promise<EmailLog | null> {
    try {
      const emailLog = await prisma.emailLog.findUnique({
        where: { externalId },
      });

      if (!emailLog) {
        return null;
      }

      return await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: EmailStatus.opened,
          openedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error marking email as opened:', error);
      throw error;
    }
  }

  /**
   * Increment attempt count
   */
  async incrementAttempt(id: string): Promise<EmailLog> {
    try {
      return await prisma.emailLog.update({
        where: { id },
        data: {
          attempts: { increment: 1 },
          lastAttemptAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error incrementing attempt count:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const emailRepository = new EmailRepository();
export default emailRepository;
