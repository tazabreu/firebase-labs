/**
 * Health Service
 * Firebase Function for providing application health status.
 */
import express, { Request, Response, NextFunction } from 'express';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getRemoteConfig } from 'firebase-admin/remote-config';
import { onRequest } from 'firebase-functions/v2/https';
import logger from './utils/logger';
import { performHealthCheck, HealthStatus } from './services/health.service';
import { getFeatureFlags } from './services/remote-config.service';

interface AuthedRequest extends Request {}

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

  interface HttpRequestLogPayload {
    msg: string;
    method: string;
    path: string;
    status: number;
    durationMs: number;
    userAgent: string | undefined;
    ip: string | undefined;
    trace?: string;
    httpRequest: {
      requestMethod: string;
      requestUrl: string;
      status: number;
      userAgent: string | undefined;
      remoteIp: string | undefined;
      latency: string;
    };
  }

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const logPayload: HttpRequestLogPayload = {
      msg: 'HTTP request',
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      trace: cloudLoggingTrace,
      httpRequest: {
        requestMethod: req.method,
        requestUrl: req.originalUrl || req.url,
        status: res.statusCode,
        userAgent: req.get('user-agent'),
        remoteIp: req.ip,
        latency: `${Math.max(0, durationMs)}ms`
      }
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

// No custom auth guard needed for health; Cloud Run/Functions v2 "invoker: private" handles protection at the edge

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