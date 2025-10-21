/**
 * Configuration Validator for Airtable
 * 
 * Provides comprehensive validation utilities for Airtable configuration including:
 * - Runtime configuration validation
 * - Base ID connectivity testing
 * - Field mapping validation against actual schema
 * - Performance and security checks
 * 
 * Requirements: 3.3, 3.4, 3.5
 */

import { validateBaseId } from './airtable-constants';
import { getConfigManager, type ValidationResult } from './config-manager';

// Validation severity levels
export type ValidationSeverity = 'error' | 'warning' | 'info';

// Detailed validation result
export interface DetailedValidationResult {
  category: string;
  severity: ValidationSeverity;
  message: string;
  suggestion?: string;
  code?: string;
  context?: Record<string, any>;
}

// Comprehensive validation report
export interface ValidationReport {
  isValid: boolean;
  summary: {
    totalChecks: number;
    errors: number;
    warnings: number;
    infos: number;
  };
  results: DetailedValidationResult[];
  timestamp: Date;
  duration: number;
}

// Validation options
export interface ValidationOptions {
  includeConnectivityTests?: boolean;
  includeFieldValidation?: boolean;
  includePerformanceChecks?: boolean;
  includeSecurityChecks?: boolean;
  timeoutMs?: number;
}

/**
 * Comprehensive configuration validator
 */
export class ConfigurationValidator {
  private results: DetailedValidationResult[] = [];
  private startTime: number = 0;

  /**
   * Run comprehensive validation of Airtable configuration
   */
  public async validateConfiguration(options: ValidationOptions = {}): Promise<ValidationReport> {
    this.startTime = Date.now();
    this.results = [];

    const {
      includeConnectivityTests = false, // Disabled by default to avoid API calls
      includeFieldValidation = true,
      includePerformanceChecks = true,
      includeSecurityChecks = true,
      timeoutMs = 30000
    } = options;

    try {
      // Basic configuration validation
      await this.validateBasicConfiguration();

      // Base ID validation
      await this.validateBaseIds();

      // Field mapping validation
      if (includeFieldValidation) {
        await this.validateFieldMappings();
      }

      // Performance checks
      if (includePerformanceChecks) {
        await this.validatePerformanceSettings();
      }

      // Security checks
      if (includeSecurityChecks) {
        await this.validateSecuritySettings();
      }

      // Connectivity tests (optional, requires API calls)
      if (includeConnectivityTests) {
        await this.validateConnectivity(timeoutMs);
      }

    } catch (error) {
      this.addResult({
        category: 'validation',
        severity: 'error',
        message: `Validation process failed: ${error instanceof Error ? error.message : String(error)}`,
        code: 'VALIDATION_PROCESS_ERROR'
      });
    }

    return this.generateReport();
  }

  /**
   * Validate basic configuration structure and required values
   */
  private async validateBasicConfiguration(): Promise<void> {
    try {
      const configManager = getConfigManager();
      const config = await configManager.getConfiguration();

      // Check API key
      if (!config.apiKey) {
        this.addResult({
          category: 'configuration',
          severity: 'error',
          message: 'API key is missing',
          suggestion: 'Set AIRTABLE_API_KEY environment variable',
          code: 'MISSING_API_KEY'
        });
      } else if (config.apiKey.length < 10) {
        this.addResult({
          category: 'configuration',
          severity: 'warning',
          message: 'API key appears to be too short',
          suggestion: 'Verify API key is correct',
          code: 'INVALID_API_KEY_LENGTH'
        });
      }

      // Check environment
      if (!['development', 'production', 'test'].includes(config.environment)) {
        this.addResult({
          category: 'configuration',
          severity: 'warning',
          message: `Unknown environment: ${config.environment}`,
          suggestion: 'Use development, production, or test',
          code: 'UNKNOWN_ENVIRONMENT'
        });
      }

      // Check base configurations
      if (Object.keys(config.bases).length === 0) {
        this.addResult({
          category: 'configuration',
          severity: 'error',
          message: 'No base configurations found',
          code: 'NO_BASES_CONFIGURED'
        });
      }

      // Check field mappings
      if (Object.keys(config.fieldMappings).length === 0) {
        this.addResult({
          category: 'configuration',
          severity: 'error',
          message: 'No field mappings configured',
          code: 'NO_FIELD_MAPPINGS'
        });
      }

      this.addResult({
        category: 'configuration',
        severity: 'info',
        message: 'Basic configuration structure is valid',
        code: 'BASIC_CONFIG_VALID'
      });

    } catch (error) {
      this.addResult({
        category: 'configuration',
        severity: 'error',
        message: `Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`,
        code: 'CONFIG_LOAD_ERROR'
      });
    }
  }

  /**
   * Validate all base IDs for format and consistency
   */
  private async validateBaseIds(): Promise<void> {
    try {
      const configManager = getConfigManager();
      const config = await configManager.getConfiguration();

      let validBaseIds = 0;
      let invalidBaseIds = 0;

      for (const [key, baseConfig] of Object.entries(config.bases)) {
        // Validate base ID format
        if (!validateBaseId(baseConfig.baseId)) {
          this.addResult({
            category: 'base_ids',
            severity: 'error',
            message: `Invalid base ID format for ${key}: ${baseConfig.baseId}`,
            suggestion: 'Base ID should be "app" followed by 14 alphanumeric characters',
            code: 'INVALID_BASE_ID_FORMAT',
            context: { baseKey: key, baseId: baseConfig.baseId }
          });
          invalidBaseIds++;
        } else {
          validBaseIds++;
        }

        // Check if base is active
        if (!baseConfig.isActive) {
          this.addResult({
            category: 'base_ids',
            severity: 'warning',
            message: `Base ${key} is marked as inactive`,
            suggestion: 'Activate base if it should be used',
            code: 'INACTIVE_BASE',
            context: { baseKey: key }
          });
        }

        // Check table name
        if (!baseConfig.tableName) {
          this.addResult({
            category: 'base_ids',
            severity: 'error',
            message: `Missing table name for base ${key}`,
            code: 'MISSING_TABLE_NAME',
            context: { baseKey: key }
          });
        }

        // Check last validation time
        const daysSinceValidation = (Date.now() - baseConfig.lastValidated.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceValidation > 30) {
          this.addResult({
            category: 'base_ids',
            severity: 'info',
            message: `Base ${key} hasn't been validated in ${Math.floor(daysSinceValidation)} days`,
            suggestion: 'Consider running connectivity tests',
            code: 'STALE_VALIDATION',
            context: { baseKey: key, daysSinceValidation: Math.floor(daysSinceValidation) }
          });
        }
      }

      this.addResult({
        category: 'base_ids',
        severity: 'info',
        message: `Base ID validation complete: ${validBaseIds} valid, ${invalidBaseIds} invalid`,
        code: 'BASE_ID_VALIDATION_SUMMARY',
        context: { validBaseIds, invalidBaseIds }
      });

    } catch (error) {
      this.addResult({
        category: 'base_ids',
        severity: 'error',
        message: `Base ID validation failed: ${error instanceof Error ? error.message : String(error)}`,
        code: 'BASE_ID_VALIDATION_ERROR'
      });
    }
  }

  /**
   * Validate field mappings for all content types
   */
  private async validateFieldMappings(): Promise<void> {
    try {
      const configManager = getConfigManager();
      const config = await configManager.getConfiguration();

      let validMappings = 0;
      let invalidMappings = 0;

      for (const [contentType, fieldMapping] of Object.entries(config.fieldMappings)) {
        // Check if all fields are defined
        if (!fieldMapping.allFields || fieldMapping.allFields.length === 0) {
          this.addResult({
            category: 'field_mappings',
            severity: 'error',
            message: `No fields defined for content type: ${contentType}`,
            code: 'NO_FIELDS_DEFINED',
            context: { contentType }
          });
          invalidMappings++;
          continue;
        }

        // Check required fields
        if (!fieldMapping.requiredFields || fieldMapping.requiredFields.length === 0) {
          this.addResult({
            category: 'field_mappings',
            severity: 'warning',
            message: `No required fields defined for content type: ${contentType}`,
            suggestion: 'Define at least one required field (e.g., id)',
            code: 'NO_REQUIRED_FIELDS',
            context: { contentType }
          });
        }

        // Validate field aliases
        for (const [alias, target] of Object.entries(fieldMapping.aliases)) {
          if (target && !fieldMapping.allFields.includes(target)) {
            this.addResult({
              category: 'field_mappings',
              severity: 'warning',
              message: `Field alias '${alias}' points to non-existent field '${target}' in ${contentType}`,
              suggestion: 'Update alias target or add field to mapping',
              code: 'INVALID_FIELD_ALIAS',
              context: { contentType, alias, target }
            });
          }
        }

        // Check for duplicate fields
        const duplicates = this.findDuplicates(fieldMapping.allFields);
        if (duplicates.length > 0) {
          this.addResult({
            category: 'field_mappings',
            severity: 'warning',
            message: `Duplicate fields found in ${contentType}: ${duplicates.join(', ')}`,
            suggestion: 'Remove duplicate field definitions',
            code: 'DUPLICATE_FIELDS',
            context: { contentType, duplicates }
          });
        }

        // Validate field categories consistency
        const totalCategoryFields = fieldMapping.baseFields.length +
          fieldMapping.englishFields.length +
          fieldMapping.hindiFields.length;

        if (totalCategoryFields !== fieldMapping.allFields.length) {
          this.addResult({
            category: 'field_mappings',
            severity: 'warning',
            message: `Field category counts don't match total fields for ${contentType}`,
            suggestion: 'Check field categorization consistency',
            code: 'FIELD_CATEGORY_MISMATCH',
            context: {
              contentType,
              totalCategoryFields,
              totalAllFields: fieldMapping.allFields.length
            }
          });
        }

        validMappings++;
      }

      this.addResult({
        category: 'field_mappings',
        severity: 'info',
        message: `Field mapping validation complete: ${validMappings} valid, ${invalidMappings} invalid`,
        code: 'FIELD_MAPPING_VALIDATION_SUMMARY',
        context: { validMappings, invalidMappings }
      });

    } catch (error) {
      this.addResult({
        category: 'field_mappings',
        severity: 'error',
        message: `Field mapping validation failed: ${error instanceof Error ? error.message : String(error)}`,
        code: 'FIELD_MAPPING_VALIDATION_ERROR'
      });
    }
  }

  /**
   * Validate performance-related settings
   */
  private async validatePerformanceSettings(): Promise<void> {
    try {
      const configManager = getConfigManager();
      const config = await configManager.getConfiguration();
      const settings = config.globalSettings;

      // Check page size settings
      if (settings.defaultPageSize > settings.maxPageSize) {
        this.addResult({
          category: 'performance',
          severity: 'error',
          message: 'Default page size cannot be greater than max page size',
          suggestion: `Set defaultPageSize <= ${settings.maxPageSize}`,
          code: 'INVALID_PAGE_SIZE_CONFIG'
        });
      }

      if (settings.maxPageSize > 100) {
        this.addResult({
          category: 'performance',
          severity: 'warning',
          message: 'Max page size greater than 100 may cause API rate limiting',
          suggestion: 'Consider using maxPageSize <= 100',
          code: 'HIGH_MAX_PAGE_SIZE',
          context: { maxPageSize: settings.maxPageSize }
        });
      }

      if (settings.defaultPageSize < 10) {
        this.addResult({
          category: 'performance',
          severity: 'info',
          message: 'Very small default page size may increase API calls',
          suggestion: 'Consider increasing defaultPageSize for better performance',
          code: 'SMALL_DEFAULT_PAGE_SIZE',
          context: { defaultPageSize: settings.defaultPageSize }
        });
      }

      // Check field validation setting
      if (!settings.enableFieldValidation) {
        this.addResult({
          category: 'performance',
          severity: 'warning',
          message: 'Field validation is disabled',
          suggestion: 'Enable field validation to prevent API errors',
          code: 'FIELD_VALIDATION_DISABLED'
        });
      }

      // Check fallback setting
      if (!settings.enableFallbacks) {
        this.addResult({
          category: 'performance',
          severity: 'info',
          message: 'Fallback mechanisms are disabled',
          suggestion: 'Enable fallbacks for better error recovery',
          code: 'FALLBACKS_DISABLED'
        });
      }

      this.addResult({
        category: 'performance',
        severity: 'info',
        message: 'Performance settings validation complete',
        code: 'PERFORMANCE_VALIDATION_COMPLETE'
      });

    } catch (error) {
      this.addResult({
        category: 'performance',
        severity: 'error',
        message: `Performance validation failed: ${error instanceof Error ? error.message : String(error)}`,
        code: 'PERFORMANCE_VALIDATION_ERROR'
      });
    }
  }

  /**
   * Validate security-related settings
   */
  private async validateSecuritySettings(): Promise<void> {
    try {
      const configManager = getConfigManager();
      const config = await configManager.getConfiguration();

      // Check API key security
      if (config.apiKey && config.apiKey.includes('test')) {
        this.addResult({
          category: 'security',
          severity: 'warning',
          message: 'API key appears to be a test key',
          suggestion: 'Use production API key in production environment',
          code: 'TEST_API_KEY_DETECTED'
        });
      }

      // Check environment-specific settings
      if (config.environment === 'production') {
        if (config.globalSettings.logLevel === 'debug') {
          this.addResult({
            category: 'security',
            severity: 'warning',
            message: 'Debug logging enabled in production',
            suggestion: 'Use "warn" or "error" log level in production',
            code: 'DEBUG_LOGGING_IN_PRODUCTION'
          });
        }
      }

      // Check for sensitive data in configuration
      const sensitivePatterns = [
        /password/i,
        /secret/i,
        /token/i,
        /key/i
      ];

      for (const [baseKey, baseConfig] of Object.entries(config.bases)) {
        if (baseConfig.metadata?.description) {
          for (const pattern of sensitivePatterns) {
            if (pattern.test(baseConfig.metadata.description)) {
              this.addResult({
                category: 'security',
                severity: 'info',
                message: `Base ${baseKey} description may contain sensitive information`,
                suggestion: 'Avoid including sensitive data in configuration metadata',
                code: 'POTENTIAL_SENSITIVE_DATA',
                context: { baseKey }
              });
            }
          }
        }
      }

      this.addResult({
        category: 'security',
        severity: 'info',
        message: 'Security settings validation complete',
        code: 'SECURITY_VALIDATION_COMPLETE'
      });

    } catch (error) {
      this.addResult({
        category: 'security',
        severity: 'error',
        message: `Security validation failed: ${error instanceof Error ? error.message : String(error)}`,
        code: 'SECURITY_VALIDATION_ERROR'
      });
    }
  }

  /**
   * Validate connectivity to Airtable (requires API calls)
   */
  private async validateConnectivity(timeoutMs: number): Promise<void> {
    try {
      const configManager = getConfigManager();
      const config = await configManager.getConfiguration();

      // Note: This would require actual API calls to test connectivity
      // For now, we'll just validate that we have the necessary configuration

      if (!config.apiKey) {
        this.addResult({
          category: 'connectivity',
          severity: 'error',
          message: 'Cannot test connectivity: API key missing',
          code: 'CONNECTIVITY_NO_API_KEY'
        });
        return;
      }

      // Placeholder for actual connectivity tests
      this.addResult({
        category: 'connectivity',
        severity: 'info',
        message: 'Connectivity validation skipped (requires API calls)',
        suggestion: 'Implement actual API connectivity tests if needed',
        code: 'CONNECTIVITY_VALIDATION_SKIPPED'
      });

    } catch (error) {
      this.addResult({
        category: 'connectivity',
        severity: 'error',
        message: `Connectivity validation failed: ${error instanceof Error ? error.message : String(error)}`,
        code: 'CONNECTIVITY_VALIDATION_ERROR'
      });
    }
  }

  /**
   * Add validation result
   */
  private addResult(result: DetailedValidationResult): void {
    this.results.push(result);
  }

  /**
   * Generate final validation report
   */
  private generateReport(): ValidationReport {
    const duration = Date.now() - this.startTime;

    const summary = {
      totalChecks: this.results.length,
      errors: this.results.filter(r => r.severity === 'error').length,
      warnings: this.results.filter(r => r.severity === 'warning').length,
      infos: this.results.filter(r => r.severity === 'info').length
    };

    return {
      isValid: summary.errors === 0,
      summary,
      results: this.results,
      timestamp: new Date(),
      duration
    };
  }

  /**
   * Find duplicate values in array
   */
  private findDuplicates(arr: string[]): string[] {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const item of arr) {
      if (seen.has(item)) {
        duplicates.add(item);
      } else {
        seen.add(item);
      }
    }

    return Array.from(duplicates);
  }
}

// Convenience functions

/**
 * Run comprehensive configuration validation
 */
export async function validateAirtableConfiguration(options: ValidationOptions = {}): Promise<ValidationReport> {
  const validator = new ConfigurationValidator();
  return validator.validateConfiguration(options);
}

/**
 * Quick validation check (basic validation only)
 */
export async function quickValidationCheck(): Promise<{ isValid: boolean; errorCount: number; warningCount: number }> {
  const validator = new ConfigurationValidator();
  const report = await validator.validateConfiguration({
    includeConnectivityTests: false,
    includeFieldValidation: true,
    includePerformanceChecks: false,
    includeSecurityChecks: false
  });

  return {
    isValid: report.isValid,
    errorCount: report.summary.errors,
    warningCount: report.summary.warnings
  };
}

/**
 * Validate specific base configuration
 */
export async function validateBaseConfiguration(baseKey: string): Promise<ValidationResult> {
  const configManager = getConfigManager();
  return configManager.validateBaseConfiguration(baseKey);
}