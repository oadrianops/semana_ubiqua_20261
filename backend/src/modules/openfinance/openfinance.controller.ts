import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../shared/middleware/auth.middleware';
import { openFinanceService } from './openfinance.service';
import { consentService } from './consent.service';

const connectSchema = z.object({
  institutionId: z.string().min(1),
});

const consentSchema = z.object({
  categories: z.array(z.string()).min(1),
});

export const openFinanceController = {
  async listInstitutions(_req: AuthRequest, res: Response) {
    return res.json(openFinanceService.listInstitutions());
  },

  async listConnections(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const connections = await openFinanceService.getConnections(req.userId!);
      return res.json(connections);
    } catch (err) {
      return next(err);
    }
  },

  async connect(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { institutionId } = connectSchema.parse(req.body);
      const result = await openFinanceService.connect(req.userId!, institutionId);
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  },

  async disconnect(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await openFinanceService.disconnect(req.userId!, req.params.id);
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  },

  async transactions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await openFinanceService.getTransactions(req.userId!);
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  },

  async listConsents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const consents = await consentService.list(req.userId!);
      return res.json(consents);
    } catch (err) {
      return next(err);
    }
  },

  async grantConsent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { categories } = consentSchema.parse(req.body);
      const result = await consentService.grant(req.userId!, categories);
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  },

  async revokeConsent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await consentService.revoke(req.userId!, req.params.category);
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  },
};
