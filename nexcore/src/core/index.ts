// ─── Kernel Core Barrel Export ────────────────────────────────────────────────

export { prisma } from './db/client';
export { AppError } from './errors/AppError';
export {
  toErrorResponse,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
} from './errors/http';
export {
  emailSchema,
  passwordSchema,
  idSchema,
  paginationSchema,
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from './validation/schemas';

export { userService } from './user/UserService';
export type { IUserService } from './user/IUserService';
export type { UserDTO, PublicUserDTO, CreateUserInput, UpdateUserInput } from './user/types';

export { createSession, deleteSession, validateSession, SESSION_COOKIE_NAME } from './auth/session';
export { signSessionToken, verifySessionToken, hashTokenId } from './auth/tokens';
export type { ISessionPayload, AuthCredentials, AuthResult } from './auth/types';
export type { ICurrentUser, IPublicUser, UserRole, ApiResponse, PaginatedResponse } from './types';
