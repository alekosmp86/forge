// ─── AppError ─────────────────────────────────────────────────────────────────

/**
 * Base error class for all domain errors in nexcore.
 * Extends the built-in Error with an HTTP status code and optional error details.
 *
 * Usage:
 *   throw new AppError('User not found', 404);
 *   throw new AppError('Validation failed', 400, { field: 'email' });
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;

    // Restore prototype chain (required when extending built-in classes in TS)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
