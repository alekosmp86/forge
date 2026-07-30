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
  type LoginInput,
  type RegisterInput,
} from './validation/schemas';

export { validateSession, registerSessionProvider, SESSION_COOKIE_NAME } from './auth/session';
export type { ICurrentUser, IPublicUser, UserRole, ApiResponse, PaginatedResponse } from './types';
export { FG } from './extension/FG';
export { NavSection, type ModuleNavItem } from './navigation/types';
export { navRegistry } from './navigation/navRegistry';
export { useNavItems } from './navigation/useNavItems';
