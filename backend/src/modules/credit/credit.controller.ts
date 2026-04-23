import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../shared/middleware/auth.middleware';
import { creditService } from './credit.service';

const simulateSchema = z.object({
  amount: z.number().min(200).max(50000),
  installments: z.number().int().min(3).max(24),
});

const requestSchema = simulateSchema.extend({
  pixKey: z.string().optional(),
});

const paySchema = z.object({
  installmentNo: z.number().int().min(1),
});

export const creditController = {
  async simulate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = simulateSchema.parse(req.body);
      const result = await creditService.simulate(req.userId!, data);
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  },

  async request(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = requestSchema.parse(req.body);
      const result = await creditService.request(req.userId!, data);
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  },

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const list = await creditService.list(req.userId!);
      return res.json(list);
    } catch (err) {
      return next(err);
    }
  },

  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await creditService.get(req.userId!, req.params.id);
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  },

  async pay(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { installmentNo } = paySchema.parse(req.body);
      const result = await creditService.payInstallment(
        req.userId!,
        req.params.id,
        installmentNo
      );
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  },
};
