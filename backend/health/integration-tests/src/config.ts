/**
 * Test configuration for health endpoint integration tests
 */
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export interface TestConfig {
  baseUrl: string;
  timeout: number;
}

/**
 * Build the API URL from environment variables
 */
const buildApiUrl = (): string => {
  const baseApi = process.env.INTEGRATION_TEST_TARGET_API || 'http://127.0.0.1:5001/fir-labs-nonprod/us-central1';
  const endpoint = process.env.INTEGRATION_TEST_TARGET_HEALTH_ENDPOINT || '/health';
  
  // Ensure endpoint starts with / and doesn't end with /
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${baseApi}${formattedEndpoint}`;
};

/**
 * Get configuration based on environment
 */
export function getConfig(): TestConfig {
  return {
    baseUrl: buildApiUrl(),
    timeout: parseInt(process.env.TEST_TIMEOUT || '5000', 10)
  };
} 