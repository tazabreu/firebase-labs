# Health Service

A Firebase Function service that provides health and status information.

## Features

- `/` - Health endpoint with comprehensive status checks of Firebase and external services
- `/info` - Provides service metadata and runtime information

## Development

### Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create a `.env.local` file with necessary environment variables (if not already present)

### Running the Service

To run the service locally:

```bash
pnpm run serve
```

This automatically builds the TypeScript code first (via the `preserve` script) and then starts the Firebase emulator.

For active development, you can use two terminals:

**Terminal 1: Watch for code changes**
```bash
pnpm run build:watch
```

**Terminal 2: Run the emulator**
```bash
pnpm run serve
```

### Testing the Endpoints

Once the emulator is running, you can test the endpoints:

```bash
# Health endpoint
curl http://localhost:5001/[PROJECT_ID]/us-central1/health

# Info endpoint
curl http://localhost:5001/[PROJECT_ID]/us-central1/health/info
```

Replace `[PROJECT_ID]` with your Firebase project ID.

### Other Commands

- `pnpm run build` - Build the TypeScript code
- `pnpm run lint` - Run ESLint to check code quality
- `pnpm run test` - Run Jest tests
- `pnpm run deploy` - Deploy the function to Firebase 