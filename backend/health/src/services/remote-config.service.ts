/**
 * Remote Config Service
 * Provides access to Firebase Remote Config values
 */
import { getRemoteConfig } from 'firebase-admin/remote-config';
import logger from '../utils/logger';

/**
 * Feature Flags interface
 */
export interface FeatureFlags {
  health_sample_message: string;
  health_env_label: string;
  [key: string]: string | boolean | number | string[];
}

/**
 * Default values for feature flags
 */
const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  health_sample_message: 'Health service is operational',
  health_env_label: 'local'
};

/**
 * Fetches feature flags from Firebase Remote Config
 * 
 * @returns {Promise<FeatureFlags>} Feature flags
 */
export async function getFeatureFlags(): Promise<FeatureFlags> {
  try {
    logger.debug('Fetching feature flags from Remote Config');
    const startTime = Date.now();
    
    // Get the Remote Config template
    const remoteConfig = getRemoteConfig();
    const template = await remoteConfig.getTemplate();
    
    // Extract feature flags
    const featureFlags: FeatureFlags = { ...DEFAULT_FEATURE_FLAGS };
    
    // health_sample_message
    if (template.parameters && template.parameters['health_sample_message']) {
      const param = template.parameters['health_sample_message'];
      if (param.defaultValue && typeof param.defaultValue === 'object' && 'value' in param.defaultValue) {
        featureFlags.health_sample_message = String(param.defaultValue.value);
      }
    }

    // health_env_label
    if (template.parameters && template.parameters['health_env_label']) {
      const param = template.parameters['health_env_label'];
      if (param.defaultValue && typeof param.defaultValue === 'object' && 'value' in param.defaultValue) {
        featureFlags.health_env_label = String(param.defaultValue.value);
      }
    }

    // No auth-related flags used for health endpoint
    
    const elapsed = Date.now() - startTime;
    logger.debug(`Feature flags fetched in ${elapsed}ms`);
    
    return featureFlags;
  } catch (error) {
    logger.error({ error }, 'Failed to fetch feature flags');
    // Return default values on error
    return DEFAULT_FEATURE_FLAGS;
  }
} 