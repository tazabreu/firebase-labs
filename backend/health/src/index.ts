/**
 * Health Service
 * Firebase Function for providing application health status.
 */
import express, { Request, Response } from 'express';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';
import logger from './utils/logger';
import { performHealthCheck, HealthStatus } from './services/health.service';

// Initialize Firebase Admin
initializeApp({
  credential: applicationDefault()
});

logger.info('Health service initializing');

// Create Express app
const app = express();

/**
 * GET / - Health Endpoint
 * Returns health status of the service and its dependencies
 */
app.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Health check requested', {
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    
    // Perform comprehensive health check
    const healthResult = await performHealthCheck();
    
    // Set status code based on health status
    const statusCode = healthResult.status === HealthStatus.UP ? 200 : 503;
    
    res.status(statusCode).json(healthResult);
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
export const health = onRequest(app);

logger.info('Health service initialized and ready'); 