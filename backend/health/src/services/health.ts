/**
 * Health Service
 * Provides comprehensive health checks for the application.
 */
import logger from '../utils/logger';
import * as catFactsService from './catFacts';

/**
 * Health status constants
 */
export enum HealthStatus {
  UP = 'UP',
  DOWN = 'DOWN'
}

/**
 * Health check result interface
 */
export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: string;
  downstreamApis: {
    catFacts: {
      status: HealthStatus;
      responseTime: number;
      url: string;
      sampleFact?: string;
      error?: string;
    }
  };
  environment: string;
}

/**
 * Performs a comprehensive health check of all downstream dependencies
 * 
 * @returns {Promise<HealthCheckResult>} Comprehensive health check result
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  logger.info('Performing health check');
  const startTime = Date.now();
  
  // Perform Cat Facts API health check
  const catFactsHealth = await catFactsService.checkHealth();
  
  // Determine overall status based on downstream services
  // For this implementation, we're making the service status depend entirely on Cat Facts API
  const overallStatus = catFactsHealth.status === HealthStatus.UP ? HealthStatus.UP : HealthStatus.DOWN;
  
  // Prepare response with nested downstreamApis category
  const healthResult: HealthCheckResult = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    downstreamApis: {
      catFacts: {
        status: catFactsHealth.status as HealthStatus,
        responseTime: catFactsHealth.responseTime,
        url: catFactsHealth.data?.url || `${catFactsService.CAT_FACTS_API.baseUrl}${catFactsService.CAT_FACTS_API.endpoints.fact}`
      }
    },
    environment: process.env.NODE_ENV || 'local'
  };
  
  // Add sample fact if available
  if (catFactsHealth.data?.sampleFact) {
    healthResult.downstreamApis.catFacts.sampleFact = catFactsHealth.data.sampleFact;
  }
  
  // Add error information if any service is down
  if (catFactsHealth.status === HealthStatus.DOWN && catFactsHealth.error) {
    healthResult.downstreamApis.catFacts.error = catFactsHealth.error;
  }
  
  const elapsed = Date.now() - startTime;
  logger.info(`Health check completed in ${elapsed}ms with status: ${overallStatus}`);
  
  return healthResult;
} 