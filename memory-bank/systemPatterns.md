
## ESLint Best Practices

For a TypeScript project using ESM modules (as indicated by "type": "module" in package.json):

1. Use  format or the new flat config  format
2. Configure the project to use @typescript-eslint with the correct parser options
3. Extend recommended configurations:
   - eslint:recommended
   - plugin:@typescript-eslint/recommended
4. Set appropriate environments (node, es2022)
5. Configure parserOptions to match tsconfig.json settings

The ESLint configuration should be compatible with the existing TypeScript setup in tsconfig.json.

## Health Service Patterns

### Structured Logging Pattern
- Centralized logger configuration
- Context-enriched log entries
- Consistent log levels and formats
- Environment-aware logging behavior

### Service Information Pattern
- Standard metadata exposure
- Version and build transparency
- Runtime information access

### Health Check Pattern
- Component-based health checks
- Health aggregation with status rules
- Async health check execution
- Dependency health propagation
