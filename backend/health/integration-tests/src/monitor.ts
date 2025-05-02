/**
 * Monitor script that runs health tests every minute
 * Supports multiple environments via CLI selection
 */
// Using require for compatibility with direct node execution
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { execSync } = require('child_process');

import readline from 'readline';
import { 
  availableEnvironments, 
  
  loadEnvironment, 
  getConfig,

} from './config';

/**
 * Select environment via CLI prompt
 */
function selectEnvironment(): Promise<string> {
  // If environment is passed via ENV variable, use that
  const envFromArgs = process.env.ENV;
  if (envFromArgs && availableEnvironments.includes(envFromArgs)) {
    // eslint-disable-next-line no-console
    console.log(`Using environment from ENV variable: ${envFromArgs}`);
    loadEnvironment(envFromArgs);
    return Promise.resolve(envFromArgs);
  }

  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // eslint-disable-next-line no-console
    console.log('\n🌐 SELECT ENVIRONMENT:');
    // eslint-disable-next-line no-console
      console.log('---------------------');
    availableEnvironments.forEach((env, index) => {
      // eslint-disable-next-line no-console
      console.log(`${index + 1}. ${env}`);
    });
    
    rl.question('\nEnter environment number [default: 1]: ', (answer) => {
      const envIndex = parseInt(answer) - 1;
      // Use selected environment or default to first one if invalid input
      const selectedEnv = availableEnvironments[envIndex] || availableEnvironments[0];
      rl.close();
      // eslint-disable-next-line no-console
      console.log(`Selected environment: ${selectedEnv}`);
      // Ensure we load the environment variables after selection
      loadEnvironment(selectedEnv);
      resolve(selectedEnv);
    });
  });
}

// Get monitoring interval from env or default to 60 seconds
const getMonitorInterval = (): number => {
  return parseInt(process.env.MONITOR_INTERVAL || '60000', 10);
};

// Clear terminal
const clearTerminal = (): void => {
  process.stdout.write('\x1Bc');
};

// Format timestamp
const timestamp = (): string => {
  return new Date().toISOString().replace('T', ' ').substr(0, 19);
};

// Run tests once
const runTests = (env: string): void => {
  const config = getConfig();
  const monitorInterval = getMonitorInterval();
  
  clearTerminal();
  // eslint-disable-next-line no-console
  console.log(`\n[${timestamp()}] Running health endpoint tests (${env.toUpperCase()})...`);
  // eslint-disable-next-line no-console
  console.log(`Target: ${config.baseUrl}`);
  // eslint-disable-next-line no-console
  console.log(`Timeout: ${config.timeout}ms`);
  
  try {
    // Run jest directly with the test file
    execSync(`cross-env ENV=${env} npx jest src/health.test.ts --colors`, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    // eslint-disable-next-line no-console
    console.log(`\n[${timestamp()}] ✅ Tests completed successfully`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`\n[${timestamp()}] ❌ Tests failed`);
  }
  
  // eslint-disable-next-line no-console
  console.log(`\nNext run in ${monitorInterval/1000} seconds. Press Ctrl+C to exit.\n`);
};

/**
 * Main function to initialize and run tests
 */
async function main(): Promise<void> {
  try {
    const env = await selectEnvironment();
    const monitorInterval = getMonitorInterval();
    
    // Double-check that environment is properly loaded
    if (!process.env.INTEGRATION_TEST_TARGET_API) {
      throw new Error(`Environment variables not properly loaded for ${env}. Check your .env.integration-test.${env} file.`);
    }
    
    // Print banner
    // eslint-disable-next-line no-console
    console.log(`\n🔍 HEALTH ENDPOINT MONITORING (${env.toUpperCase()})`);
    // eslint-disable-next-line no-console
    console.log('============================');
    // eslint-disable-next-line no-console
    console.log(`Target API: ${process.env.INTEGRATION_TEST_TARGET_API}${process.env.INTEGRATION_TEST_TARGET_HEALTH_ENDPOINT}`);
    // eslint-disable-next-line no-console
    console.log(`Tests will run every ${monitorInterval/1000} seconds. Press Ctrl+C to exit.\n`);

    // Run immediately
    runTests(env);

    // Then run at specified interval
    setInterval(() => runTests(env), monitorInterval);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in monitor:', error);
    process.exit(1);
  }
}

// Start the monitor
main().catch(error => {
    // eslint-disable-next-line no-console
  console.error('Error starting monitor:', error);
  process.exit(1);
}); 