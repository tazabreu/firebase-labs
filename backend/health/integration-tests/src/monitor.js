/**
 * Monitor script that runs health tests every minute
 */
require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

// Get monitoring interval from env or default to 60 seconds
const monitorInterval = parseInt(process.env.MONITOR_INTERVAL || '60000', 10);

// Clear terminal
const clearTerminal = () => {
  process.stdout.write('\x1Bc');
};

// Format timestamp
const timestamp = () => {
  return new Date().toISOString().replace('T', ' ').substr(0, 19);
};

// Run tests once
const runTests = () => {
  clearTerminal();
  console.log(`\n[${timestamp()}] Running health endpoint tests...`);
  console.log(`Target: ${process.env.INTEGRATION_TEST_TARGET_API}${process.env.INTEGRATION_TEST_TARGET_HEALTH_ENDPOINT}`);
  
  try {
    // Run jest directly with the test file
    execSync('npx jest src/health.test.ts --colors', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log(`\n[${timestamp()}] ✅ Tests completed successfully`);
  } catch (error) {
    console.log(`\n[${timestamp()}] ❌ Tests failed`);
  }
  
  console.log(`\nNext run in ${monitorInterval/1000} seconds. Press Ctrl+C to exit.\n`);
};

// Print banner
console.log('\n🔍 HEALTH ENDPOINT MONITORING');
console.log('============================');
console.log(`Tests will run every ${monitorInterval/1000} seconds. Press Ctrl+C to exit.\n`);

// Run immediately
runTests();

// Then run at specified interval
setInterval(runTests, monitorInterval); 