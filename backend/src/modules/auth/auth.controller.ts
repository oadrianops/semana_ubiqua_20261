import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from './auth.service';
import { AuthRequest } from '../../shared/middleware/auth.middleware';
import { generateFingerprint, getClientIp } from '../../shared/utils/fingerprint';

const registerSchema = z.object({
  cpf: z.string().min(11, 'CPF inválido'),
  name: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  clientFingerprint: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
  clientFingerprint: z.string().optional(),
});

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const fingerprint = generateFingerprint(req, data.clientFingerprint);
      const ip = getClientIp(req);

      const result = await authService.register({
        ...data,
        deviceFingerprint: fingerprint,
        ip,
      });

      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const fingerprint = generateFingerprint(req, data.clientFingerprint);
      const ip = getClientIp(req);

      const result = await authService.login({
        ...data,
        deviceFingerprint: fingerprint,
        ip,
      });

      return res.json(result);
    } catch (err) {
      return next(err);
    }
  },

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.userId!);
      return res.json(user);
    } catch (err) {
      return next(err);
    }
  },
};
