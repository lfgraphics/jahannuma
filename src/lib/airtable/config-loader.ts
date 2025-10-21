/**
 * Configuration Loader for Airtable
 * 
 * Provides environment-based configuration loading and initialization utilities.
 * This module handles the loading of configuration from various sources including
 * environment variables, default constants, and runtime overrides.
 * 
 * Requirements: 3.1, 3.2, 3.4
 */

import { getConfigManager, type ConfigurationOverrides } from './config-manager';

// Environment configuration interface
export interface EnvironmentConfig {
  nodeEnv: 'development' | 'production' | 'test';
  airtableApiKey?: string;
  airtableBaseId?: string;
  enableFieldValidation?: boolean;
  enableFallbacks?: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
  maxPageSize?: number;
  defaultPageSize?: number;
}

// Configuration loading options
export interface ConfigLoadOptions {
  validateOnLoad?: boolean;
  throwOnValidationError?: boolean;
  logConfigSummary?: boolean;
  environmentOverrides?: ConfigurationOverrides;
}

/**
 * Load environment configuration from process.env
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  const nodeEnv = (process.env.NODE_ENV as any) || 'development';

  return {
    nodeEnv,
    airtableApiKey: process.env.AIRTABLE_API_KEY,
    airtableBaseId: process.env.AIRTABLE_BASE_ID,
    enableFieldValidation: process.env.ENABLE_FIELD_VALIDATION !== 'false',
    enableFallbacks: process.env.ENABLE_FALLBACKS !== 'false',
    logLevel: (process.env.AIRTABLE_LOG_LEVEL as any) || (nodeEnv === 'production' ? 'warn' : 'info'),
    maxPageSize: process.env.AIRTABLE_MAX_PAGE_SIZE ? parseInt(process.env.AIRTABLE_MAX_PAGE_SIZE, 10) : 100,
    defaultPageSize: process.env.AIRTABLE_DEFAULT_PAGE_SIZE ? parseInt(process.env.AIRTABLE_DEFAULT_PAGE_SIZE, 10) : 50
  };
}

/**
 * Create configuration overrides from environment config
 */
export function createEnvironmentOverrides(envConfig: EnvironmentConfig): ConfigurationOverrides {
  const overrides: ConfigurationOverrides = {};

  // Global settings overrides
  overrides.globalSettings = {
    enableFieldValidation: envConfig.enableFieldValidation,
    enableFallbacks: envConfig.enableFallbacks,
    logLevel: envConfig.logLevel,
    maxPageSize: envConfig.maxPageSize,
    defaultPageSize: envConfig.defaultPageSize
  };

  // Base ID overrides (if legacy AIRTABLE_BASE_ID is set)
  if (envConfig.airtableBaseId) {
    overrides.baseIds = {
      ASHAAR: envConfig.airtableBaseId
    };
  }

  return overrides;
}

/**
 * Initialize Airtable configuration with environment-based loading
 */
export async function initializeConfiguration(options: ConfigLoadOptions = {}) {
  const {
    validateOnLoad = true,
    throwOnValidationError = false,
    logConfigSummary = true,
    environmentOverrides = {}
  } = options;

  try {
    // Load environment configuration
    const envConfig = loadEnvironmentConfig();

    // Create overrides from environment
    const envOverrides = createEnvironmentOverrides(envConfig);

    // Merge with provided overrides
    const finalOverrides: ConfigurationOverrides = {
      baseIds: {
        ...envOverrides.baseIds,
        ...environmentOverrides.baseIds
      },
      fieldMappings: {
        ...envOverrides.fieldMappings,
        ...environmentOverrides.fieldMappings
      },
      globalSettings: {
        ...envOverrides.globalSettings,
        ...environmentOverrides.globalSettings
      }
    };

    // Initialize configuration manager
    const configManager = getConfigManager();
    const config = await configManager.loadConfiguration(finalOverrides);

    // Validate configuration if requested
    if (validateOnLoad) {
      const validation = await configManager.validateConfiguration();

      if (!validation.isValid) {
        const errorMessage = `Configuration validation failed: ${validation.errors.join(', ')}`;

        if (throwOnValidationError) {
          throw new Error(errorMessage);
        } else {
          console.warn(errorMessage);
          if (validation.warnings.length > 0) {
            console.warn('Configuration warnings:', validation.warnings);
          }
        }
      } else if (validation.warnings.length > 0) {
        console.warn('Configuration loaded with warnings:', validation.warnings);
      }

      if (validation.suggestions.length > 0) {
        console.info('Configuration suggestions:', validation.suggestions);
      }
    }

    // Log configuration summary if requested
    if (logConfigSummary) {
      const summary = await configManager.getConfigurationSummary();
      console.info('Airtable configuration loaded:', {
        environment: summary.environment,
        baseCount: summary.baseCount,
        contentTypes: summary.contentTypes.length,
        isValid: summary.isValid,
        apiKeyPresent: summary.apiKeyPresent
      });
    }

    return config;

  } catch (error) {
    console.error('Failed to initialize Airtable configuration:', error);
    throw error;
  }
}

/**
 * Reload configuration (useful for development or configuration changes)
 */
export async function reloadConfiguration(options: ConfigLoadOptions = {}) {
  const configManager = getConfigManager();
  await configManager.reloadConfiguration();

  // Re-initialize with new environment values
  return initializeConfiguration(options);
}

/**
 * Get configuration health status
 */
export async function getConfigurationStatus() {
  try {
    const configManager = getConfigManager();
    const summary = await configManager.getConfigurationSummary();
    const validation = await configManager.validateConfiguration();

    return {
      status: validation.isValid ? 'healthy' : 'error',
      environment: summary.environment,
      lastLoaded: summary.lastLoaded,
      baseCount: summary.baseCount,
      contentTypes: summary.contentTypes,
      validation: {
        isValid: validation.isValid,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length,
        suggestionCount: validation.suggestions.length
      },
      apiKeyPresent: summary.apiKeyPresent
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Validate current configuration and return detailed results
 */
export async function validateCurrentConfiguration() {
  const configManager = getConfigManager();
  return configManager.validateConfiguration();
}

/**
 * Check if configuration is properly initialized
 */
export async function isConfigurationInitialized(): Promise<boolean> {
  try {
    const configManager = getConfigManager();
    const config = await configManager.getConfiguration();
    return !!config && !!config.apiKey;
  } catch {
    return false;
  }
}

/**
 * Get environment-specific configuration defaults
 */
export function getEnvironmentDefaults(environment: 'development' | 'production' | 'test') {
  const defaults = {
    development: {
      logLevel: 'info' as const,
      enableFieldValidation: true,
      enableFallbacks: true,
      defaultPageSize: 20,
      maxPageSize: 50
    },
    production: {
      logLevel: 'warn' as const,
      enableFieldValidation: true,
      enableFallbacks: true,
      defaultPageSize: 50,
      maxPageSize: 100
    },
    test: {
      logLevel: 'error' as const,
      enableFieldValidation: false,
      enableFallbacks: false,
      defaultPageSize: 10,
      maxPageSize: 25
    }
  };

  return defaults[environment];
}

/**
 * Create configuration overrides for specific environment
 */
export function createEnvironmentSpecificOverrides(
  environment: 'development' | 'production' | 'test'
): ConfigurationOverrides {
  const defaults = getEnvironmentDefaults(environment);

  return {
    globalSettings: defaults
  };
}