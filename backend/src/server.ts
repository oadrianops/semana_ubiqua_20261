import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './shared/config/env';
import { errorHandler } from './shared/middleware/error.middleware';

import authRoutes from './modules/auth/auth.routes';
import openFinanceRoutes from './modules/openfinance/openfinance.routes';
import scoreRoutes from './modules/score/score.routes';
import creditRoutes from './modules/credit/credit.routes';
import fraudRoutes from './modules/fraud/fraud.routes';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'nandesk-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req, res) => {
  res.json({
    service: 'NanDesk API',
    version: '1.0.0',
    docs: '/api',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/openfinance', openFinanceRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/fraud', fraudRoutes);

app.use(errorHandler);

const PORT = Number(env.PORT);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NanDesk API rodando em http://localhost:${PORT}`);
  console.log(`   Ambiente: ${env.NODE_ENV}`);
});

export default app;
