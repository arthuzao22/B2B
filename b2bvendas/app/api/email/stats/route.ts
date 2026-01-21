import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/modules/email/email.service';
import { getQueueStats } from '@/lib/email/email-queue';
import logger from '@/src/lib/logger';

// ==========================================
// GET /api/email/stats - Get email statistics
// ==========================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const [emailStats, queueStats] = await Promise.all([
      emailService.getEmailStats(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      ),
      getQueueStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        emails: emailStats,
        queue: queueStats,
      },
    });
  } catch (error) {
    logger.error('Error in GET /api/email/stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get email statistics',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
