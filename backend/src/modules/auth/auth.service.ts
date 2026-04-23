import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../shared/config/prisma';
import { env } from '../../shared/config/env';
import { AppError } from '../../shared/middleware/error.middleware';
import { cleanCpf, isValidCpf } from '../../shared/utils/cpf';

export interface RegisterInput {
  cpf: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  deviceFingerprint?: string;
  ip?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  deviceFingerprint?: string;
  ip?: string;
}

export class AuthService {
  async register(input: RegisterInput) {
    const cpf = cleanCpf(input.cpf);
    if (!isValidCpf(cpf)) {
      throw new AppError('CPF inválido', 400);
    }

    const existingCpf = await prisma.user.findUnique({ where: { cpf } });
    if (existingCpf) {
      throw new AppError('CPF já cadastrado', 409);
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (existingEmail) {
      throw new AppError('Email já cadastrado', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        cpf,
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone,
        passwordHash,
        deviceFingerprint: input.deviceFingerprint,
        lastLoginIp: input.ip,
      },
    });

    // Anti-fraude: flag se device já usado por outro usuário
    if (input.deviceFingerprint) {
      const sameDevice = await prisma.user.count({
        where: {
          deviceFingerprint: input.deviceFingerprint,
          id: { not: user.id },
        },
      });
      if (sameDevice > 0) {
        await prisma.fraudFlag.create({
          data: {
            userId: user.id,
            type: 'duplicate_device',
            severity: 'medium',
            details: { fingerprint: input.deviceFingerprint, count: sameDevice + 1 },
          },
        });
      }
    }

    const token = this.signToken(user.id);
    return { user: this.sanitize(user), token };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (!user) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError('Credenciais inválidas', 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginIp: input.ip,
        deviceFingerprint: input.deviceFingerprint || user.deviceFingerprint,
      },
    });

    const token = this.signToken(user.id);
    return { user: this.sanitize(user), token };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            bankConnections: true,
            creditRequests: true,
          },
        },
      },
    });
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }
    return this.sanitize(user);
  }

  private signToken(userId: string): string {
    // @ts-expect-error jsonwebtoken types are overly strict for expiresIn
    return jwt.sign({ sub: userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }

  private sanitize<T extends { passwordHash?: string }>(user: T): Omit<T, 'passwordHash'> {
    const { passwordHash: _ph, ...rest } = user;
    return rest;
  }
}

export const authService = new AuthService();
