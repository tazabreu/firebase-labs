"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.health = void 0;
/**
 * Health Service
 * Firebase Function for providing application health status.
 */
const express_1 = __importDefault(require("express"));
const app_1 = require("firebase-admin/app");
const https_1 = require("firebase-functions/v2/https");
const logger_1 = __importDefault(require("./utils/logger"));
const health_1 = require("./services/health");
// Initialize Firebase Admin
(0, app_1.initializeApp)({
    credential: (0, app_1.applicationDefault)()
});
logger_1.default.info('Health service initializing');
// Create Express app
const app = (0, express_1.default)();
/**
 * GET / - Health Endpoint
 * Returns health status of the service and its dependencies
 */
app.get('/', async (req, res) => {
    try {
        logger_1.default.info('Health check requested', {
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
        // Perform comprehensive health check
        const healthResult = await (0, health_1.performHealthCheck)();
        // Set status code based on health status
        const statusCode = healthResult.status === health_1.HealthStatus.UP ? 200 : 503;
        res.status(statusCode).json(healthResult);
    }
    catch (err) {
        logger_1.default.error({ err }, 'Health check failed');
        res.status(500).json({
            status: health_1.HealthStatus.DOWN,
            error: 'Internal error during health check',
            timestamp: new Date().toISOString()
        });
    }
});
// Export the Express app wrapped with Firebase Functions v2 handler
exports.health = (0, https_1.onRequest)(app);
logger_1.default.info('Health service initialized and ready');
//# sourceMappingURL=index.js.map