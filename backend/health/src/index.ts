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

interface AuthInfo { uid: string; email: string }
interface AuthedRequest extends Request { auth?: AuthInfo }

// Initialize Firebase Admin
initializeApp({
  credential: applicationDefault()
});

// Initialize Remote Config
getRemoteConfig();

logger.info('Health service initializing');

// Create Express app
const app = express();

// HTTP request logging middleware with trace correlation for Cloud Logging
app.use((req: AuthedRequest, res: Response, next: NextFunction) => {
  const start = Date.now();
  // Cloud Run/Functions v2 provide trace header: x-cloud-trace-context
  const traceHeader = req.get('x-cloud-trace-context') || '';
  const traceId = traceHeader.split('/')?.[0] || undefined;
  // Build Cloud Logging trace field if project id is available in env
  const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || process.env.FUNCTIONS_CLOUD_PROJECT;
  const cloudLoggingTrace = traceId && projectId ? `projects/${projectId}/traces/${traceId}` : undefined;

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const logPayload: Record<string, unknown> = {
      msg: 'HTTP request',
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs,
      userAgent: req.get('user-agent'),
      ip: req.ip,
    };
    if (cloudLoggingTrace) {
      (logPayload as any).trace = cloudLoggingTrace;
    }
    // Structured httpRequest object improves Cloud Logging parsing
    (logPayload as any).httpRequest = {
      requestMethod: req.method,
      requestUrl: req.originalUrl || req.url,
      status: res.statusCode,
      userAgent: req.get('user-agent'),
      remoteIp: req.ip,
      latency: `${Math.max(0, durationMs)}ms`,
    };

    // Choose log level by status code
    if (res.statusCode >= 500) {
      logger.error(logPayload);
    } else if (res.statusCode >= 400) {
      logger.warn(logPayload);
    } else {
      logger.info(logPayload);
    }
  });

  next();
});

// Auth middleware (enabled when RC require_auth is true)
async function authGuard(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
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
    req.auth = { uid: decoded.uid, email: requesterEmail };

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
app.get('/', async (req: AuthedRequest, res: Response): Promise<void> => {
  try {
    logger.info({ event: 'health_check_start', auth: req.auth || undefined }, 'GET /health requested');
    
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
    
    logger.info({ event: 'health_check_complete', statusCode }, 'GET /health completed');
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