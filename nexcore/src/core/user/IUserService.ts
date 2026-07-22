import type { UserDTO, PublicUserDTO, CreateUserInput, UpdateUserInput } from './types';

// ─── IUserService (Interface Segregation) ────────────────────────────────────
//
// SOLID note: This interface is intentionally broad for the core user service.
// When consuming in modules that only need read or only write access,
// consider narrowing via IUserReader / IUserWriter sub-interfaces.

export interface IUserService {
  /** Find a user by their unique ID */
  findById(userId: string): Promise<UserDTO | null>;

  /** Find a user by their email address */
  findByEmail(email: string): Promise<UserDTO | null>;

  /** Check whether a user with the given ID exists */
  exists(userId: string): Promise<boolean>;

  /** Create a new user — hashes password internally */
  create(input: CreateUserInput): Promise<PublicUserDTO>;

  /** Update an existing user's mutable fields */
  update(userId: string, input: UpdateUserInput): Promise<PublicUserDTO>;

  /** Soft-delete a user (sets isActive = false) */
  deactivate(userId: string): Promise<void>;
}
