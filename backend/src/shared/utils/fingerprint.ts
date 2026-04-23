import crypto from 'crypto';
import { Request } from 'express';

export function generateFingerprint(req: Request, extraData?: string): string {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const raw = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${extraData || ''}`;
  return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 32);
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}
