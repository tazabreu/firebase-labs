# Health Endpoint Integration Tests

Simple integration tests to verify the health endpoint functionality across multiple environments.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

Environment-specific configuration files are provided:
- `.env.integration-test.local` - For testing against local emulator
- `.env.integration-test.nonprod` - For testing against non-production environment

## Running Tests

### Run tests against default environment (local):

```bash
npm test
```

### Run tests against specific environments:

```bash
# Test against local/emulator
npm run test:local

# Test against nonprod environment
npm run test:nonprod
```

### Run tests in watch mode:

```bash
npm run test:watch
```

### Run continuous monitoring:

#### Interactive environment selection:

```bash
npm run monitor
```

The monitor will prompt you to select an environment.

#### Direct environment selection:

```bash
# Monitor local/emulator environment
npm run monitor:local

# Monitor nonprod environment
npm run monitor:nonprod
```

The monitor script is written in TypeScript and requires ts-node to run. It will clear the console before each test run and display the results with timestamps.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| INTEGRATION_TEST_TARGET_API | Base API URL | Environment-specific |
| INTEGRATION_TEST_TARGET_HEALTH_ENDPOINT | Health endpoint path | Environment-specific |
| TEST_TIMEOUT | Test timeout in milliseconds | Environment-specific |
| MONITOR_INTERVAL | Monitor interval in milliseconds | 60000 |

## Tests Included

1. Verifies the health endpoint returns a 200 status code
2. Verifies the response body contains "UP" status and downstream verification
3. Verifies the feature-flags object with health_sample_message is present
4. Verifies the response includes a cat fact
5. Verifies the Cat Facts API response time is under 3 seconds 