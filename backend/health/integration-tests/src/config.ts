/**
 * Test configuration for health endpoint integration tests
 */
import * as dotenv from 'dotenv';
import path from 'path';

// Available environments
export const availableEnvironments = ['local', 'nonprod'];
export const defaultEnvironment = 'local';

/**
 * Load environment variables from the specified environment file
 * @param envName The environment name to load
 */
export function loadEnvironment(envName: string = process.env.ENV || defaultEnvironment): void {
  const envFile = `.env.integration-test.${envName}`;
  const envPath = path.resolve(__dirname, `../${envFile}`);
  
  // eslint-disable-next-line no-console
  console.log(`Loading environment from: ${envPath}`);
  
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    // eslint-disable-next-line no-console
    console.error(`Error loading environment file: ${result.error.message}`);
    throw new Error(`Failed to load environment file: ${envFile}`);
  }
  
  // eslint-disable-next-line no-console
  console.log(`Loaded environment configuration: ${envName}`);
}

// Load environment variables based on ENV or default to 'local'
loadEnvironment();

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

/**
 * Get the current environment name
 */
export function getCurrentEnvironment(): string {
  return process.env.ENV || defaultEnvironment;
} 