import { Router } from 'express';
import { scoreController } from './score.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.post('/calculate', scoreController.calculate);
router.get('/current', scoreController.current);
router.get('/history', scoreController.history);

export default router;
