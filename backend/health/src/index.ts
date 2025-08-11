/**
 * Health Service
 * Firebase Function for providing application health status.
 */
import express, { Request, Response, NextFunction } from 'express';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getRemoteConfig } from 'firebase-admin/remote-config';
import { onRequest } from 'firebase-functions/v2/https';
import logger from './utils/logger';
import { performHealthCheck, HealthStatus } from './services/health.service';
import { getFeatureFlags } from './services/remote-config.service';

// Initialize Firebase Admin
initializeApp({
  credential: applicationDefault()
});

// Initialize Remote Config
getRemoteConfig();

logger.info('Health service initializing');

// Create Express app
const app = express();

// Auth middleware (enabled when RC require_auth is true)
async function authGuard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const flags = await getFeatureFlags();

    if (!flags.require_auth) {
      return next();
    }

    const authHeader = req.get('authorization') || req.get('Authorization');
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      res.status(401).json({ error: 'Missing or invalid Authorization header' });
      return;
    }

    const token = authHeader.slice(7);
    const decoded = await getAuth().verifyIdToken(token);

    const requesterEmail = decoded.email || '';
    const adminSet = new Set((flags.admin_emails || []).map(e => e.toLowerCase()));

    if (!requesterEmail || !adminSet.has(requesterEmail.toLowerCase())) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Attach identity for logging
    (req as any).auth = { uid: decoded.uid, email: requesterEmail };

    next();
  } catch (err) {
    logger.warn({ err }, 'Auth guard failed');
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// Apply guard to health route
app.use('/', authGuard);

/**
 * GET / - Health Endpoint
 * Returns health status of the service and its dependencies
 */
app.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Health check requested', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      auth: (req as any).auth || undefined
    });
    
    // Perform comprehensive health check
    const [healthResult, flags] = await Promise.all([
      performHealthCheck(),
      getFeatureFlags()
    ]);
    
    // Set status code based on health status
    const statusCode = healthResult.status === HealthStatus.UP ? 200 : 503;

    const responseBody = {
      ...healthResult,
      environmentLabel: flags.health_env_label,
      'feature-flags': {
        ...flags
      }
    };
    
    res.status(statusCode).json(responseBody);
  } catch (err) {
    logger.error({ err }, 'Health check failed');
    res.status(500).json({ 
      status: HealthStatus.DOWN,
      error: 'Internal error during health check',
      timestamp: new Date().toISOString()
    });
  }
});

// Export the Express app wrapped with Firebase Functions v2 handler
export const health = onRequest({ invoker: 'private' }, app);

logger.info('Health service initialized and ready'); 