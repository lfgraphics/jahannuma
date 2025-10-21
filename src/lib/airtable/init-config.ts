/**
 * Airtable Configuration Initialization
 * 
 * Provides initialization utilities for setting up Airtable configuration
 * at application startup. This module handles the bootstrap process for
 * configuration loading and validation.
 * 
 * Requirements: 3.1, 3.2, 3.5
 */

import { initializeConfiguration, type ConfigLoadOptions } from './config-loader';
import { getConfigManager } from './config-manager';
import { validateAirtableConfiguration, type ValidationOptions } from './config-validator';

// Initialization status
export interface InitializationStatus {
  success: boolean;
  configLoaded: boolean;
  validationPassed: boolean;
  errors: string[];
  warnings: string[];
  duration: number;
  timestamp: Date;
}

// Initialization options
export interface InitOptions extends ConfigLoadOptions {
  validationOptions?: ValidationOptions;
  skipValidation?: boolean;
  retryOnFailure?: boolean;
  maxRetries?: number;
  retryDelayMs?: number;
}

/**
 * Initialize Airtable configuration with comprehensive setup
 */
export async function initializeAirtableConfig(options: InitOptions = {}): Promise<InitializationStatus> {
  const startTime = Date.now();
  const status: InitializationStatus = {
    success: false,
    configLoaded: false,
    validationPassed: false,
    errors: [],
    warnings: [],
    duration: 0,
    timestamp: new Date()
  };

  const {
    skipValidation = false,
    retryOnFailure = false,
    maxRetries = 3,
    retryDelayMs = 1000,
    validationOptions = {},
    ...configOptions
  } = options;

  let attempt = 0;
  const maxAttempts = retryOnFailure ? maxRetries + 1 : 1;

  while (attempt < maxAttempts) {
    try {
      attempt++;

      // Load configuration
      console.info(`Initializing Airtable configuration (attempt ${attempt}/${maxAttempts})...`);

      await initializeConfiguration({
        validateOnLoad: false, // We'll do comprehensive validation separately
        throwOnValidationError: false,
        logConfigSummary: attempt === 1, // Only log on first attempt
        ...configOptions
      });

      status.configLoaded = true;
      console.info('Airtable configuration loaded successfully');

      // Run validation if not skipped
      if (!skipValidation) {
        console.info('Running configuration validation...');

        const validationReport = await validateAirtableConfiguration({
          includeConnectivityTests: false, // Skip by default to avoid API calls during startup
          includeFieldValidation: true,
          includePerformanceChecks: true,
          includeSecurityChecks: true,
          ...validationOptions
        });

        status.validationPassed = validationReport.isValid;

        // Collect errors and warnings
        for (const result of validationReport.results) {
          if (result.severity === 'error') {
            status.errors.push(result.message);
          } else if (result.severity === 'warning') {
            status.warnings.push(result.message);
          }
        }

        if (validationReport.isValid) {
          console.info('Configuration validation passed');
        } else {
          console.warn(`Configuration validation failed with ${validationReport.summary.errors} errors`);

          if (retryOnFailure && attempt < maxAttempts) {
            console.info(`Retrying in ${retryDelayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelayMs));
            continue;
          }
        }
      } else {
        status.validationPassed = true; // Skip validation means we assume it's valid
        console.info('Configuration validation skipped');
      }

      // Success
      status.success = status.configLoaded && status.validationPassed;
      break;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      status.errors.push(errorMessage);

      console.error(`Configuration initialization failed (attempt ${attempt}/${maxAttempts}):`, errorMessage);

      if (retryOnFailure && attempt < maxAttempts) {
        console.info(`Retrying in ${retryDelayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
      } else {
        break;
      }
    }
  }

  status.duration = Date.now() - startTime;

  // Log final status
  if (status.success) {
    console.info(`Airtable configuration initialized successfully in ${status.duration}ms`);
    if (status.warnings.length > 0) {
      console.warn(`Configuration has ${status.warnings.length} warnings:`, status.warnings);
    }
  } else {
    console.error(`Airtable configuration initialization failed after ${attempt} attempts`);
    console.error('Errors:', status.errors);
  }

  return status;
}

/**
 * Quick initialization for development (minimal validation)
 */
export async function quickInit(): Promise<InitializationStatus> {
  return initializeAirtableConfig({
    validateOnLoad: false,
    throwOnValidationError: false,
    logConfigSummary: true,
    validationOptions: {
      includeConnectivityTests: false,
      includeFieldValidation: true,
      includePerformanceChecks: false,
      includeSecurityChecks: false
    }
  });
}

/**
 * Production initialization (comprehensive validation)
 */
export async function productionInit(): Promise<InitializationStatus> {
  return initializeAirtableConfig({
    validateOnLoad: true,
    throwOnValidationError: false,
    logConfigSummary: true,
    retryOnFailure: true,
    maxRetries: 2,
    validationOptions: {
      includeConnectivityTests: false, // Still skip to avoid startup delays
      includeFieldValidation: true,
      includePerformanceChecks: true,
      includeSecurityChecks: true
    }
  });
}

/**
 * Test initialization (minimal setup for testing)
 */
export async function testInit(): Promise<InitializationStatus> {
  return initializeAirtableConfig({
    validateOnLoad: false,
    throwOnValidationError: false,
    logConfigSummary: false,
    skipValidation: true,
    environmentOverrides: {
      globalSettings: {
        enableFieldValidation: false,
        enableFallbacks: false,
        logLevel: 'error',
        defaultPageSize: 10,
        maxPageSize: 25
      }
    }
  });
}

/**
 * Check if configuration is ready for use
 */
export async function isConfigurationReady(): Promise<boolean> {
  try {
    const configManager = getConfigManager();
    const config = await configManager.getConfiguration();

    // Basic readiness checks
    return !!(
      config &&
      config.apiKey &&
      Object.keys(config.bases).length > 0 &&
      Object.keys(config.fieldMappings).length > 0
    );
  } catch {
    return false;
  }
}

/**
 * Get initialization status for health checks
 */
export async function getInitializationHealth(): Promise<{
  status: 'ready' | 'not_ready' | 'error';
  details: {
    configLoaded: boolean;
    baseCount: number;
    fieldMappingCount: number;
    apiKeyPresent: boolean;
    lastLoaded?: Date;
  };
  error?: string;
}> {
  try {
    const configManager = getConfigManager();
    const config = await configManager.getConfiguration();
    const summary = await configManager.getConfigurationSummary();

    const isReady = await isConfigurationReady();

    return {
      status: isReady ? 'ready' : 'not_ready',
      details: {
        configLoaded: !!config,
        baseCount: summary.baseCount,
        fieldMappingCount: summary.contentTypes.length,
        apiKeyPresent: summary.apiKeyPresent,
        lastLoaded: summary.lastLoaded
      }
    };
  } catch (error) {
    return {
      status: 'error',
      details: {
        configLoaded: false,
        baseCount: 0,
        fieldMappingCount: 0,
        apiKeyPresent: false
      },
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Reinitialize configuration (useful for configuration changes)
 */
export async function reinitializeConfiguration(options: InitOptions = {}): Promise<InitializationStatus> {
  console.info('Reinitializing Airtable configuration...');

  // Clear existing configuration
  const configManager = getConfigManager();
  await configManager.reloadConfiguration();

  // Initialize with new configuration
  return initializeAirtableConfig(options);
}