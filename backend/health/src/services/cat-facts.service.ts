/**
 * Cat Facts API Service
 * Provides health check and data retrieval for the Cat Facts API.
 */
import fetch from 'node-fetch';
import { Response } from 'node-fetch';
import logger from '../utils/logger';
import { HealthStatus } from './health.service';

/**
 * API Configuration
 */
export interface CatFactsApiConfig {
  baseUrl: string;
  endpoints: {
    fact: string;
  };
  timeout: number;
}

/**
 * Health check result interface
 */
export interface CatFactsHealthResult {
  status: HealthStatus;
  responseTime: number;
  error?: string;
  data?: {
    url: string;
    sampleFact: string;
  };
}

/**
 * Cat Facts API configuration
 */
export const CAT_FACTS_API: CatFactsApiConfig = {
  baseUrl: 'https://catfact.ninja',
  endpoints: {
    fact: '/fact'
  },
  timeout: 5000
};

/**
 * Checks if the Cat Facts API is operational.
 * 
 * @returns {Promise<CatFactsHealthResult>} Health check result with status and data
 */
export async function checkHealth(): Promise<CatFactsHealthResult> {
  const startTime = Date.now();
  
  try {
    logger.debug('Checking Cat Facts API health');
    
    // Make request to the facts endpoint
    const response: Response = await fetch(`${CAT_FACTS_API.baseUrl}${CAT_FACTS_API.endpoints.fact}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      timeout: CAT_FACTS_API.timeout
    });
    
    const responseTime = Date.now() - startTime;
    
    // Check if response is ok
    if (!response.ok) {
      logger.warn(`Cat Facts API responded with status ${response.status} in ${responseTime}ms`);
      return {
        status: HealthStatus.DOWN,
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
    
    // Parse response
    const data = await response.json();
    
    // Validate response format - Cat Facts API returns fact and length properties
    if (!data || !data.fact) {
      logger.warn('Cat Facts API returned invalid data format');
      return {
        status: HealthStatus.DOWN,
        responseTime,
        error: 'Invalid response format'
      };
    }
    
    // Success case
    logger.debug(`Cat Facts API health check completed in ${responseTime}ms: SUCCESS`);
    return {
      status: HealthStatus.UP,
      responseTime,
      data: {
        url: `${CAT_FACTS_API.baseUrl}${CAT_FACTS_API.endpoints.fact}`,
        sampleFact: data.fact
      }
    };
  } catch (error: Error | unknown) {
    const responseTime = Date.now() - startTime;
    logger.error({ error }, 'Cat Facts API health check failed');
    
    return {
      status: HealthStatus.DOWN,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 