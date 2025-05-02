/**
 * Monitor script that runs health tests every minute
 */
// Using require for compatibility with direct node execution
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { execSync } = require('child_process');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

// Get monitoring interval from env or default to 60 seconds
const monitorInterval = parseInt(process.env.MONITOR_INTERVAL || '60000', 10);

// Clear terminal
const clearTerminal = (): void => {
  process.stdout.write('\x1Bc');
};

// Format timestamp
const timestamp = (): string => {
  return new Date().toISOString().replace('T', ' ').substr(0, 19);
};

// Run tests once
const runTests = (): void => {
  clearTerminal();
  // eslint-disable-next-line no-console
  console.log(`\n[${timestamp()}] Running health endpoint tests...`);
  // eslint-disable-next-line no-console
  console.log(`Target: ${process.env.INTEGRATION_TEST_TARGET_API}${process.env.INTEGRATION_TEST_TARGET_HEALTH_ENDPOINT}`);
  
  try {
    // Run jest directly with the test file
    execSync('npx jest src/health.test.ts --colors', { 
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

// Print banner
// eslint-disable-next-line no-console
console.log('\n🔍 HEALTH ENDPOINT MONITORING');
// eslint-disable-next-line no-console
console.log('============================');
// eslint-disable-next-line no-console
console.log(`Tests will run every ${monitorInterval/1000} seconds. Press Ctrl+C to exit.\n`);

// Run immediately
runTests();

// Then run at specified interval
setInterval(runTests, monitorInterval); 