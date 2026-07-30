import { AppError } from '@/core/errors/AppError';

export class AuthError extends AppError {
  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message, statusCode, details);
    this.name = 'AuthError';
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(message = 'Invalid email or password') {
    super(message, 401);
    this.name = 'InvalidCredentialsError';
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message = 'Authentication required') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class UserAlreadyExistsError extends AuthError {
  constructor(email: string) {
    super(`A user with email "${email}" already exists`, 409);
    this.name = 'UserAlreadyExistsError';
  }
}
