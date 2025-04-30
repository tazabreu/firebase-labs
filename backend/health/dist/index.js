// packages/backend/health/src/index.ts
import express from 'express';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getRemoteConfig } from 'firebase-admin/remote-config';
import { onRequest } from 'firebase-functions/v2/https'; // Import v2 HTTPS handler
initializeApp({
    credential: applicationDefault()
});
const rc = getRemoteConfig(); // Remote Config handle
const app = express();
/**
 * GET /
 * Returns:
 * {
 *   env: "nonprod" | "prod" | "local",
 *   message: "<remote-config string or fallback>"
 * }
 */
app.get('/', async (_req, res) => {
    try {
        console.log(`The env var from .env.local is: `);
        console.log(JSON.stringify(process.env.TESTING_DOTENV));
        const template = await rc.getTemplate(); // fetch active template
        const defaultValue = template.parameters?.health_sample_message?.defaultValue;
        const msg = defaultValue && 'value' in defaultValue ? defaultValue.value : 'all-good';
        res.json({
            env: process.env.FIREBASE_ENV ?? 'local',
            message: msg,
        });
    }
    catch (err) { // graceful degradation
        console.error('RC error', err); // eslint-disable-line no-console
        res.status(500).json({ error: 'remote-config-failed' });
    }
});
export const health = onRequest(app); // Firebase Functions v2 entry
