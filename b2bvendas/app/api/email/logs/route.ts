import { NextRequest, NextResponse } from 'next/server';
import { emailRepository } from '@/modules/email/email.repository';
import { EmailStatus } from '@prisma/client';
import logger from '@/src/lib/logger';

// ==========================================
// GET /api/email/logs - Get email logs
// ==========================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const recipient = searchParams.get('recipient');
    const template = searchParams.get('template');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let logs;

    if (recipient) {
      logs = await emailRepository.findByRecipient(recipient, limit);
    } else if (template) {
      logs = await emailRepository.findByTemplate(template, limit);
    } else if (status) {
      logs = await emailRepository.findByStatus(status as EmailStatus, limit);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide recipient, template, or status parameter',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    logger.error('Error in GET /api/email/logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get email logs',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
