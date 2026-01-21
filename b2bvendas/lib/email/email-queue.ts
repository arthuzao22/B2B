import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { SendEmailOptions } from '@/modules/email/email.types';
import { emailService } from './email-service';
import logger from '@/src/lib/logger';

// ==========================================
// REDIS CONNECTION
// ==========================================

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// ==========================================
// EMAIL QUEUE
// ==========================================

export const emailQueue = new Queue('email-queue', {
  connection: connection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // 2 seconds, 4 seconds, 8 seconds
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs
      age: 7 * 24 * 3600, // Keep for 7 days
    },
  },
});

// ==========================================
// EMAIL WORKER
// ==========================================

export const emailWorker = new Worker(
  'email-queue',
  async (job: Job<SendEmailOptions>) => {
    const { data } = job;
    
    logger.info('Processing email job', {
      jobId: job.id,
      to: data.to,
      subject: data.subject,
      template: data.template,
      attempt: job.attemptsMade + 1,
    });

    try {
      const result = await emailService.send(data);

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      logger.info('Email job completed successfully', {
        jobId: job.id,
        messageId: result.messageId,
      });

      return result;
    } catch (error) {
      logger.error('Email job failed', {
        jobId: job.id,
        error: (error as Error).message,
        attempt: job.attemptsMade + 1,
      });

      throw error;
    }
  },
  {
    connection: connection as any,
    concurrency: 10, // Process up to 10 emails concurrently
    limiter: {
      max: 100, // Max 100 jobs
      duration: 60000, // per 60 seconds (rate limiting)
    },
  }
);

// ==========================================
// QUEUE EVENTS
// ==========================================

const queueEvents = new QueueEvents('email-queue', { connection: connection as any });

queueEvents.on('completed', ({ jobId }) => {
  logger.info('Email job completed', { jobId });
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error('Email job failed', { jobId, failedReason });
});

queueEvents.on('stalled', ({ jobId }) => {
  logger.warn('Email job stalled', { jobId });
});

// ==========================================
// QUEUE FUNCTIONS
// ==========================================

/**
 * Add email to queue
 */
export async function addEmailToQueue(
  emailOptions: SendEmailOptions,
  priority: 'high' | 'normal' | 'low' = 'normal'
): Promise<string> {
  const priorityMap = {
    high: 1,
    normal: 5,
    low: 10,
  };

  const job = await emailQueue.add('send-email', emailOptions, {
    priority: priorityMap[priority],
  });

  logger.info('Email added to queue', {
    jobId: job.id,
    to: emailOptions.to,
    subject: emailOptions.subject,
    priority,
  });

  return job.id!;
}

/**
 * Add bulk emails to queue
 */
export async function addBulkEmailsToQueue(
  emails: SendEmailOptions[],
  priority: 'high' | 'normal' | 'low' = 'normal'
): Promise<string[]> {
  const priorityMap = {
    high: 1,
    normal: 5,
    low: 10,
  };

  const jobs = emails.map((email) => ({
    name: 'send-email',
    data: email,
    opts: {
      priority: priorityMap[priority],
    },
  }));

  const addedJobs = await emailQueue.addBulk(jobs);

  logger.info('Bulk emails added to queue', {
    count: addedJobs.length,
    priority,
  });

  return addedJobs.map((job) => job.id!);
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    emailQueue.getWaitingCount(),
    emailQueue.getActiveCount(),
    emailQueue.getCompletedCount(),
    emailQueue.getFailedCount(),
    emailQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string) {
  const job = await emailQueue.getJob(jobId);

  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress;
  const failedReason = job.failedReason;

  return {
    id: job.id,
    state,
    progress,
    failedReason,
    attemptsMade: job.attemptsMade,
    data: job.data,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
  };
}

/**
 * Retry failed job
 */
export async function retryJob(jobId: string) {
  const job = await emailQueue.getJob(jobId);

  if (!job) {
    throw new Error('Job not found');
  }

  await job.retry();

  logger.info('Job retry requested', { jobId });

  return true;
}

/**
 * Remove job from queue
 */
export async function removeJob(jobId: string) {
  const job = await emailQueue.getJob(jobId);

  if (!job) {
    throw new Error('Job not found');
  }

  await job.remove();

  logger.info('Job removed from queue', { jobId });

  return true;
}

/**
 * Clean old jobs
 */
export async function cleanQueue(grace: number = 24 * 3600 * 1000) {
  await emailQueue.clean(grace, 100, 'completed');
  await emailQueue.clean(grace * 7, 100, 'failed');

  logger.info('Queue cleaned', { grace });
}

/**
 * Pause queue
 */
export async function pauseQueue() {
  await emailQueue.pause();
  logger.info('Queue paused');
}

/**
 * Resume queue
 */
export async function resumeQueue() {
  await emailQueue.resume();
  logger.info('Queue resumed');
}

/**
 * Drain queue (remove all waiting jobs)
 */
export async function drainQueue() {
  await emailQueue.drain();
  logger.info('Queue drained');
}

/**
 * Obliterate queue (remove all jobs and metadata)
 */
export async function obliterateQueue() {
  await emailQueue.obliterate();
  logger.info('Queue obliterated');
}

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing email queue...');
  await emailWorker.close();
  await emailQueue.close();
  await queueEvents.close();
  connection.disconnect();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing email queue...');
  await emailWorker.close();
  await emailQueue.close();
  await queueEvents.close();
  connection.disconnect();
});

// Export queue instance
export default emailQueue;
