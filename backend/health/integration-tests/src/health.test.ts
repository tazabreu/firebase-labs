/**
 * Integration tests for health endpoint
 */
import fetch from 'node-fetch';
import { getConfig } from './config';
import { describe, beforeAll, test, expect } from '@jest/globals';

const config = getConfig();

// Log the URL being tested for clarity
console.log(`Testing health endpoint at: ${config.baseUrl}`);

describe('Health Endpoint Integration Tests', () => {
  
  beforeAll(() => {
    console.log(`Running tests against: ${config.baseUrl}`);
    console.log('Timeout set to:', config.timeout, 'ms');
  });
  
  test('should return 200 status code when service is healthy', async () => {
    // Act
    const response = await fetch(config.baseUrl);
    
    // Assert
    expect(response.status).toBe(200);
  });

  test('should return UP status and downstream verification in response body', async () => {
    // Act
    const response = await fetch(config.baseUrl);
    
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

  test('should return a cat fact in the response', async () => {
    // Act
    const response = await fetch(config.baseUrl);
    
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
    const response = await fetch(config.baseUrl);
    
    // Handle failed response
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Assert
    expect(data.downstreamApis.catFacts.responseTime).toBeDefined();
    expect(data.downstreamApis.catFacts.responseTime).toBeLessThan(3000);
  });
}); 