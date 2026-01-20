import { NextResponse } from 'next/server'
import { AppError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError } from '../errors'
import { ZodError } from 'zod'
import logger from '../logger'

export abstract class BaseController {
  protected handleError(error: unknown): NextResponse {
    logger.error('Controller error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: error.issues 
        },
        { status: 400 }
      )
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }

  protected success<T>(data: T, status: number = 200): NextResponse {
    return NextResponse.json(data, { status })
  }
}
