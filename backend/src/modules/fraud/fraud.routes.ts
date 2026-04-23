import { Router } from 'express';
import { Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../../shared/middleware/auth.middleware';
import { fraudService } from './fraud.service';

const router = Router();
router.use(authMiddleware);

router.get('/flags', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const flags = await fraudService.getFlags(req.userId!);
    res.json(flags);
  } catch (err) {
    next(err);
  }
});

router.post('/scan', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await fraudService.runFullScan(req.userId!);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
