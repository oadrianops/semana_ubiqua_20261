import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/middleware/auth.middleware';
import { scoreService } from './score.service';

export const scoreController = {
  async calculate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await scoreService.calculate(req.userId!);
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  },

  async current(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const current = await scoreService.getCurrent(req.userId!);
      if (!current) {
        const fresh = await scoreService.calculate(req.userId!, false);
        return res.json({ fromHistory: false, ...fresh });
      }
      return res.json({ fromHistory: true, ...current });
    } catch (err) {
      return next(err);
    }
  },

  async history(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const history = await scoreService.getHistory(req.userId!);
      return res.json(history);
    } catch (err) {
      return next(err);
    }
  },
};
