import { Router } from 'express';
import { openFinanceController } from './openfinance.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/institutions', openFinanceController.listInstitutions);
router.get('/connections', openFinanceController.listConnections);
router.post('/connect', openFinanceController.connect);
router.delete('/connections/:id', openFinanceController.disconnect);
router.get('/transactions', openFinanceController.transactions);

router.get('/consents', openFinanceController.listConsents);
router.post('/consents', openFinanceController.grantConsent);
router.delete('/consents/:category', openFinanceController.revokeConsent);

export default router;
