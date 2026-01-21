/**
 * Audit Logs API Route
 * 
 * Query audit logs with filters and pagination
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryAuditLogs, getAuditStatistics } from '@/modules/audit/audit.repository';
import { AuditLogFilter, AuditAction, AuditResource, AuditSeverity } from '@/modules/audit/audit.types';
import { logUnauthorizedAccess } from '@/modules/audit/audit.service';

/**
 * GET /api/audit
 * Query audit logs with filters
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // const session = await getServerSession();
    // if (!session || session.user.role !== 'ADMIN') {
    //   await logUnauthorizedAccess(request, session?.user?.id, 'Not admin');
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    const { searchParams } = request.nextUrl;
    
    // Parse query parameters
    const filter: AuditLogFilter = {
      userId: searchParams.get('userId') || undefined,
      resourceId: searchParams.get('resourceId') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    };

    // Parse action filter (can be multiple)
    const actionParam = searchParams.get('action');
    if (actionParam) {
      const actions = actionParam.split(',');
      filter.action = actions.length === 1 
        ? actions[0] as AuditAction 
        : actions as AuditAction[];
    }

    // Parse resource filter (can be multiple)
    const resourceParam = searchParams.get('resource');
    if (resourceParam) {
      const resources = resourceParam.split(',');
      filter.resource = resources.length === 1
        ? resources[0] as AuditResource
        : resources as AuditResource[];
    }

    // Parse severity filter
    const severityParam = searchParams.get('severity');
    if (severityParam) {
      filter.severity = severityParam as AuditSeverity;
    }

    // Parse date filters
    const startDateParam = searchParams.get('startDate');
    if (startDateParam) {
      filter.startDate = new Date(startDateParam);
    }

    const endDateParam = searchParams.get('endDate');
    if (endDateParam) {
      filter.endDate = new Date(endDateParam);
    }

    // Parse IP filter
    const ipParam = searchParams.get('ip');
    if (ipParam) {
      filter.ip = ipParam;
    }

    // Query audit logs
    const result = await queryAuditLogs(filter);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/audit/statistics
 * Get audit statistics
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // const session = await getServerSession();
    // if (!session || session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const stats = await getAuditStatistics(
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching audit statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit statistics' },
      { status: 500 }
    );
  }
}
