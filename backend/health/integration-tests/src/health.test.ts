/**
 * Integration tests for health endpoint
 */
import fetch from 'node-fetch';
import { getConfig, getCurrentEnvironment } from './config';
import { describe, beforeAll, test, expect } from '@jest/globals';

const config = getConfig();
const currentEnv = getCurrentEnvironment();

// Optional auth token support for protected environments
const authToken = process.env.AUTH_ID_TOKEN || '';

// Log the URL being tested for clarity
// eslint-disable-next-line no-console
console.log(`Testing health endpoint (${currentEnv.toUpperCase()}) at: ${config.baseUrl}`);

function authHeaders(): Record<string, string> {
  if (!authToken) return {};
  return { Authorization: `Bearer ${authToken}` };
}

describe(`Health Endpoint Integration Tests (${currentEnv.toUpperCase()})`, () => {
  
  beforeAll(() => {
    // eslint-disable-next-line no-console
    console.log(`Running tests against: ${config.baseUrl}`);
    // eslint-disable-next-line no-console
    console.log('Timeout set to:', config.timeout, 'ms');
    // eslint-disable-next-line no-console
    console.log('Environment:', currentEnv);
    if (authToken) {
      // eslint-disable-next-line no-console
      console.log('Using Authorization header');
    }
  });
  
  test('should return 200 status code when service is healthy', async () => {
    // Act
    const response = await fetch(config.baseUrl, { headers: authHeaders() });
    
    // Assert
    expect(response.status).toBe(200);
  });

  test('should return UP status and downstream verification in response body', async () => {
    // Act
    const response = await fetch(config.baseUrl, { headers: authHeaders() });
    
    // Handle failed response
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Assert
    expect(data.status).toBe('UP');
    expect(data.downstreamApis).toBeDefined();
    expect(data.downstreamApis.catFacts).toBeDefined();
    expect(data.downstreamApis.catFacts.status).toBe('UP');
  });

  test('should include feature-flags with health_sample_message', async () => {
    // Act
    const response = await fetch(config.baseUrl, { headers: authHeaders() });
    
    // Handle failed response
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Assert
    expect(data['feature-flags']).toBeDefined();
    expect(data['feature-flags'].health_sample_message).toBeDefined();
    
    // eslint-disable-next-line no-console
    console.log('Feature flag message:', data['feature-flags'].health_sample_message);
  });

  test('should return a cat fact in the response', async () => {
    // Act
    const response = await fetch(config.baseUrl, { headers: authHeaders() });
    
    // Handle failed response 
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Assert
    expect(data.downstreamApis.catFacts.sampleFact).toBeDefined();
    expect(typeof data.downstreamApis.catFacts.sampleFact).toBe('string');
    expect(data.downstreamApis.catFacts.sampleFact.length).toBeGreaterThan(0);
  });

  test('should fetch from CatFacts API in less than 3 seconds', async () => {
    // Act
    const response = await fetch(config.baseUrl, { headers: authHeaders() });
    
    // Handle failed response
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Create environment-specific timeout expectations
    // Non-prod could have different response time expectations than local
    const maxResponseTime = currentEnv === 'nonprod' ? 5000 : 3000;
    
    // Assert
    expect(data.downstreamApis.catFacts.responseTime).toBeDefined();
    expect(data.downstreamApis.catFacts.responseTime).toBeLessThan(maxResponseTime);
  });
}); 