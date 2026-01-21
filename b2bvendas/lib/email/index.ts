// Export email service
export { emailService, default as defaultEmailService } from './email-service';

// Export email queue
export {
  emailQueue,
  emailWorker,
  addEmailToQueue,
  addBulkEmailsToQueue,
  getQueueStats,
  getJobStatus,
  retryJob,
  removeJob,
  cleanQueue,
  pauseQueue,
  resumeQueue,
  drainQueue,
  obliterateQueue,
} from './email-queue';

// Export templates
export { default as BaseEmailTemplate } from './templates/base-template';
export { default as WelcomeEmail } from './templates/welcome';
export { default as OrderConfirmationEmail } from './templates/order-confirmation';
export { default as OrderStatusUpdateEmail } from './templates/order-status-update';
export { default as OrderShippedEmail } from './templates/order-shipped';
export { default as OrderDeliveredEmail } from './templates/order-delivered';
export { default as PasswordResetEmail } from './templates/password-reset';
export { default as LowStockAlertEmail } from './templates/low-stock-alert';
