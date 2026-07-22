import 'server-only';
import bcrypt from 'bcryptjs';
import { prisma } from '@/core/db/client';
import { AppError } from '@/core/errors/AppError';
import { UserRole } from '@forge/shared-types';
import type { IUserService } from './IUserService';
import type { UserDTO, PublicUserDTO, CreateUserInput, UpdateUserInput } from './types';

// ─── Mappers ──────────────────────────────────────────────────────────────────

function toUserDTO(user: {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): UserDTO {
  return {
    id: user.id,
    email: user.email,
    role: user.role as UserDTO['role'],
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function toPublicUserDTO(user: { id: string; email: string; role: string }): PublicUserDTO {
  return {
    id: user.id,
    email: user.email,
    role: user.role as PublicUserDTO['role'],
  };
}

// ─── UserService Implementation ───────────────────────────────────────────────

export const userService: IUserService = {
  async findById(userId: string): Promise<UserDTO | null> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user ? toUserDTO(user) : null;
  },

  async findByEmail(email: string): Promise<UserDTO | null> {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    return user ? toUserDTO(user) : null;
  },

  async exists(userId: string): Promise<boolean> {
    const count = await prisma.user.count({ where: { id: userId, isActive: true } });
    return count > 0;
  },

  async create(input: CreateUserInput): Promise<PublicUserDTO> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('A user with this email already exists', 409);
    }

    const BCRYPT_SALT_ROUNDS = 12;
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

    const newUser = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        role: input.role ?? UserRole.USER,
      },
    });

    return toPublicUserDTO(newUser);
  },

  async update(userId: string, input: UpdateUserInput): Promise<PublicUserDTO> {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.email && { email: input.email.toLowerCase() }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.role && { role: input.role }),
      },
    });

    return toPublicUserDTO(updatedUser);
  },

  async deactivate(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  },
};
