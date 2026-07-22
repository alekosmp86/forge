import { NextResponse } from 'next/server';
import { AppError } from './AppError';

// ─── HTTP Error Response Helpers ──────────────────────────────────────────────

/**
 * Converts any error into a typed NextResponse JSON error.
 * Handles AppError (with status code) and unknown errors (500).
 */
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.statusCode }
    );
  }

  console.error('[nexcore] Unhandled error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

/** 400 Bad Request */
export function badRequest(message: string, details?: unknown): NextResponse {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

/** 401 Unauthorized */
export function unauthorized(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

/** 403 Forbidden */
export function forbidden(message: string = 'Forbidden'): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

/** 404 Not Found */
export function notFound(resource: string = 'Resource'): NextResponse {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 });
}

/** 409 Conflict */
export function conflict(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 409 });
}
