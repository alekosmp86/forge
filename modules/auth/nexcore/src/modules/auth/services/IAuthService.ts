import type { AuthCredentials, AuthResult, ISessionPayload } from '../types/types';

export interface IAuthService {
  login(credentials: AuthCredentials): Promise<AuthResult>;
  register(credentials: AuthCredentials): Promise<AuthResult>;
  logout(): Promise<void>;
  validateSession(): Promise<ISessionPayload | null>;
}
