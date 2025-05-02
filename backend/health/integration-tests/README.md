# Health Endpoint Integration Tests

Simple integration tests to verify the health endpoint functionality.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

Create a `.env` file in the root of the integration-tests directory with the following variables:

```
# Target API and endpoint configuration
INTEGRATION_TEST_TARGET_API=http://127.0.0.1:5001/fir-labs-nonprod/us-central1
INTEGRATION_TEST_TARGET_HEALTH_ENDPOINT=/health

# Test configuration
TEST_TIMEOUT=5000
MONITOR_INTERVAL=60000
```

## Running Tests

### Run tests once:

```bash
npm test
```

### Run tests in watch mode:

```bash
npm run test:watch
```

### Run continuous monitoring (tests every minute):

```bash
npm run monitor
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| INTEGRATION_TEST_TARGET_API | Base API URL | http://127.0.0.1:5001/fir-labs-nonprod/us-central1 |
| INTEGRATION_TEST_TARGET_HEALTH_ENDPOINT | Health endpoint path | /health |
| TEST_TIMEOUT | Test timeout in milliseconds | 5000 |
| MONITOR_INTERVAL | Monitor interval in milliseconds | 60000 |

## Test Environment

By default, tests run against the local Firebase emulator. To change the environment:

```bash
TEST_ENV=your-env npm test
```

## Tests Included

1. Verifies the health endpoint returns a 200 status code
2. Verifies the response body contains "UP" status and downstream verification
3. Verifies the response includes a cat fact
4. Verifies the Cat Facts API response time is under 3 seconds 