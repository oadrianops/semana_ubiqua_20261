import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { creditController } from './credit.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const requestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  message: { error: 'Máximo de 3 solicitações por 24h atingido' },
});

const router = Router();
router.use(authMiddleware);

router.post('/simulate', creditController.simulate);
router.post('/request', requestLimiter, creditController.request);
router.get('/requests', creditController.list);
router.get('/requests/:id', creditController.get);
router.post('/requests/:id/pay', creditController.pay);

export default router;
