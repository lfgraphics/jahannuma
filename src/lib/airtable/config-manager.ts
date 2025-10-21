/**
 * Centralized Configuration Manager for Airtable
 * 
 * Provides unified configuration management for all Airtable-related settings including:
 * - Base ID management with environment-based loading
 * - Field mapping configurations
 * - Runtime configuration validation
 * - Environment-specific overrides
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import {
  BASE_IDS,
  validateBaseId,
  type AirtableBaseId
} from './airtable-constants';

import {
  BASE_FIELDS,
  ENGLISH_FIELDS,
  FIELD_ALIASES,
  HINDI_FIELDS,
  MULTILINGUAL_FIELDS
} from '../../../lib/multilingual-field-constants';

// Define ContentType locally
export type ContentType = keyof typeof MULTILINGUAL_FIELDS;

// Configuration interfaces
export interface BaseConfiguration {
  baseId: AirtableBaseId;
  tableName: string;
  environment: 'development' | 'production' | 'test';
  lastValidated: Date;
  isActive: boolean;
  metadata?: {
    description?: string;
    owner?: string;
    lastUpdated?: Date;
  };
}

export interface FieldMappingConfiguration {
  contentType: ContentType;
  baseFields: string[];
  englishFields: string[];
  hindiFields: string[];
  allFields: string[];
  aliases: Record<string, string | null>;
  requiredFields: string[];
  optionalFields: string[];
  lastValidated: Date;
}

export interface AirtableConfiguration {
  apiKey: string;
  environment: 'development' | 'production' | 'test';
  bases: Record<string, BaseConfiguration>;
  fieldMappings: Record<ContentType, FieldMappingConfiguration>;
  globalSettings: {
    defaultPageSize: number;
    maxPageSize: number;
    enableFieldValidation: boolean;
    enableFallbacks: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
  };
  lastLoaded: Date;
  version: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ConfigurationOverrides {
  baseIds?: Partial<Record<keyof typeof BASE_IDS, string>>;
  fieldMappings?: Partial<Record<ContentType, Partial<FieldMappingConfiguration>>>;
  globalSettings?: Partial<AirtableConfiguration['globalSettings']>;
}

// Environment detection
function getEnvironment(): 'development' | 'production' | 'test' {
  if (typeof process !== 'undefined') {
    return (process.env.NODE_ENV as any) || 'development';
  }
  return 'development';
}

// Configuration manager class
export class AirtableConfigManager {
  private static instance: AirtableConfigManager;
  private configuration: AirtableConfiguration | null = null;
  private overrides: ConfigurationOverrides = {};
  private validationCache = new Map<string, { result: ValidationResult; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() { }

  /**
   * Get singleton instance of configuration manager
   */
  public static getInstance(): AirtableConfigManager {
    if (!AirtableConfigManager.instance) {
      AirtableConfigManager.instance = new AirtableConfigManager();
    }
    return AirtableConfigManager.instance;
  }

  /**
   * Load configuration from environment and constants
   */
  public async loadConfiguration(overrides: ConfigurationOverrides = {}): Promise<AirtableConfiguration> {
    this.overrides = overrides;

    const environment = getEnvironment();
    const apiKey = this.getApiKey();

    // Build base configurations
    const bases: Record<string, BaseConfiguration> = {};

    // Load content bases
    for (const [key, baseId] of Object.entries(BASE_IDS)) {
      const tableName = this.getTableNameForBaseKey(key);
      bases[key] = {
        baseId: (overrides.baseIds?.[key as keyof typeof BASE_IDS] as AirtableBaseId) || baseId,
        tableName,
        environment,
        lastValidated: new Date(),
        isActive: true,
        metadata: {
          description: `${key} content base`,
          lastUpdated: new Date()
        }
      };
    }

    // Build field mapping configurations
    const fieldMappings: Record<ContentType, FieldMappingConfiguration> = {} as any;

    for (const contentType of Object.keys(MULTILINGUAL_FIELDS) as ContentType[]) {
      const baseFields = (BASE_FIELDS as any)[contentType] || [];
      const englishFields = (ENGLISH_FIELDS as any)[contentType] || [];
      const hindiFields = (HINDI_FIELDS as any)[contentType] || [];
      const allFields = (MULTILINGUAL_FIELDS as any)[contentType];

      fieldMappings[contentType] = {
        contentType,
        baseFields: [...baseFields],
        englishFields: [...englishFields],
        hindiFields: [...hindiFields],
        allFields: [...allFields],
        aliases: { ...FIELD_ALIASES },
        requiredFields: this.getRequiredFields(contentType),
        optionalFields: this.getOptionalFields(contentType, allFields),
        lastValidated: new Date(),
        ...overrides.fieldMappings?.[contentType]
      };
    }

    // Build global settings
    const globalSettings = {
      defaultPageSize: 50,
      maxPageSize: 100,
      enableFieldValidation: true,
      enableFallbacks: true,
      logLevel: (environment === 'production' ? 'warn' : 'info') as 'error' | 'warn' | 'info' | 'debug',
      ...overrides.globalSettings
    };

    this.configuration = {
      apiKey,
      environment,
      bases,
      fieldMappings,
      globalSettings,
      lastLoaded: new Date(),
      version: '1.0.0'
    };

    // Validate configuration after loading
    const validation = await this.validateConfiguration();
    if (!validation.isValid) {
      console.warn('Configuration validation failed:', validation.errors);
    }

    return this.configuration;
  }

  /**
   * Get current configuration (load if not already loaded)
   */
  public async getConfiguration(): Promise<AirtableConfiguration> {
    if (!this.configuration) {
      await this.loadConfiguration(this.overrides);
    }
    return this.configuration!;
  }

  /**
   * Get base configuration for a specific content type or table
   */
  public async getBaseConfiguration(identifier: string): Promise<BaseConfiguration> {
    const config = await this.getConfiguration();

    // Try to find by base key first
    if (config.bases[identifier]) {
      return config.bases[identifier];
    }

    // Try to find by table name
    for (const baseConfig of Object.values(config.bases)) {
      if (baseConfig.tableName === identifier) {
        return baseConfig;
      }
    }

    // Try to find by content type
    const contentType = identifier.toLowerCase() as ContentType;
    if (config.fieldMappings[contentType]) {
      const baseKey = this.getBaseKeyForContentType(contentType);
      if (baseKey && config.bases[baseKey]) {
        return config.bases[baseKey];
      }
    }

    throw new Error(`No base configuration found for identifier: ${identifier}`);
  }

  /**
   * Get field mapping configuration for a content type
   */
  public async getFieldMappingConfiguration(contentType: ContentType): Promise<FieldMappingConfiguration> {
    const config = await this.getConfiguration();

    if (!config.fieldMappings[contentType]) {
      throw new Error(`No field mapping configuration found for content type: ${contentType}`);
    }

    return config.fieldMappings[contentType];
  }

  /**
   * Get base ID for a table with validation
   */
  public async getBaseIdForTable(tableName: string, contentType?: string): Promise<AirtableBaseId> {
    const config = await this.getConfiguration();

    // Handle comments specially
    if (tableName === 'Comments' && contentType) {
      const commentBaseKey = `${contentType.toUpperCase()}_COMMENTS`;
      if (config.bases[commentBaseKey]) {
        return config.bases[commentBaseKey].baseId;
      }
      throw new Error(`No comment base configuration found for content type: ${contentType}`);
    }

    // Find base by table name
    for (const baseConfig of Object.values(config.bases)) {
      if (baseConfig.tableName === tableName) {
        return baseConfig.baseId;
      }
    }

    throw new Error(`No base ID found for table: ${tableName}`);
  }

  /**
   * Get API key with validation
   */
  public getApiKey(): string {
    const apiKey = process.env.AIRTABLE_API_KEY;
    if (!apiKey) {
      throw new Error('AIRTABLE_API_KEY environment variable is required');
    }
    return apiKey;
  }

  /**
   * Validate entire configuration
   */
  public async validateConfiguration(): Promise<ValidationResult> {
    const cacheKey = 'full_config_validation';
    const cached = this.validationCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    try {
      const config = await this.getConfiguration();

      // Validate API key
      if (!config.apiKey) {
        errors.push('API key is missing');
      }

      // Validate base IDs
      for (const [key, baseConfig] of Object.entries(config.bases)) {
        if (!validateBaseId(baseConfig.baseId)) {
          errors.push(`Invalid base ID format for ${key}: ${baseConfig.baseId}`);
        }

        if (!baseConfig.tableName) {
          errors.push(`Missing table name for base ${key}`);
        }
      }

      // Validate field mappings
      for (const [contentType, fieldMapping] of Object.entries(config.fieldMappings)) {
        if (!fieldMapping.allFields || fieldMapping.allFields.length === 0) {
          errors.push(`No fields defined for content type: ${contentType}`);
        }

        // Check for required fields
        if (fieldMapping.requiredFields.length === 0) {
          warnings.push(`No required fields defined for content type: ${contentType}`);
        }

        // Validate field aliases
        for (const [alias, target] of Object.entries(fieldMapping.aliases)) {
          if (target && !fieldMapping.allFields.includes(target)) {
            warnings.push(`Field alias '${alias}' points to non-existent field '${target}' in ${contentType}`);
          }
        }
      }

      // Validate global settings
      if (config.globalSettings.defaultPageSize > config.globalSettings.maxPageSize) {
        errors.push('Default page size cannot be greater than max page size');
      }

      if (config.globalSettings.maxPageSize > 100) {
        warnings.push('Max page size greater than 100 may cause API rate limiting');
      }

      // Add suggestions
      if (warnings.length > 0) {
        suggestions.push('Review configuration warnings to optimize performance');
      }

      if (config.environment === 'production' && config.globalSettings.logLevel === 'debug') {
        suggestions.push('Consider using "warn" or "error" log level in production');
      }

    } catch (error) {
      errors.push(`Configuration validation error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };

    // Cache the result
    this.validationCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    return result;
  }

  /**
   * Validate specific base configuration
   */
  public async validateBaseConfiguration(baseKey: string): Promise<ValidationResult> {
    const cacheKey = `base_validation_${baseKey}`;
    const cached = this.validationCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    try {
      const config = await this.getConfiguration();
      const baseConfig = config.bases[baseKey];

      if (!baseConfig) {
        errors.push(`Base configuration not found: ${baseKey}`);
      } else {
        // Validate base ID format
        if (!validateBaseId(baseConfig.baseId)) {
          errors.push(`Invalid base ID format: ${baseConfig.baseId}`);
        }

        // Check if base is active
        if (!baseConfig.isActive) {
          warnings.push(`Base ${baseKey} is marked as inactive`);
        }

        // Check last validation time
        const daysSinceValidation = (Date.now() - baseConfig.lastValidated.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceValidation > 7) {
          suggestions.push(`Base ${baseKey} hasn't been validated in ${Math.floor(daysSinceValidation)} days`);
        }
      }
    } catch (error) {
      errors.push(`Base validation error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };

    this.validationCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    return result;
  }

  /**
   * Update configuration with new values
   */
  public async updateConfiguration(updates: Partial<AirtableConfiguration>): Promise<void> {
    const config = await this.getConfiguration();

    // Merge updates
    Object.assign(config, updates);
    config.lastLoaded = new Date();

    // Clear validation cache
    this.validationCache.clear();

    // Validate updated configuration
    const validation = await this.validateConfiguration();
    if (!validation.isValid) {
      throw new Error(`Configuration update failed validation: ${validation.errors.join(', ')}`);
    }
  }

  /**
   * Reload configuration from environment
   */
  public async reloadConfiguration(): Promise<AirtableConfiguration> {
    this.configuration = null;
    this.validationCache.clear();
    return this.loadConfiguration(this.overrides);
  }

  /**
   * Get configuration summary for debugging
   */
  public async getConfigurationSummary(): Promise<{
    environment: string;
    baseCount: number;
    contentTypes: string[];
    lastLoaded: Date;
    isValid: boolean;
    apiKeyPresent: boolean;
  }> {
    const config = await this.getConfiguration();
    const validation = await this.validateConfiguration();

    return {
      environment: config.environment,
      baseCount: Object.keys(config.bases).length,
      contentTypes: Object.keys(config.fieldMappings),
      lastLoaded: config.lastLoaded,
      isValid: validation.isValid,
      apiKeyPresent: !!config.apiKey
    };
  }

  // Private helper methods

  private getTableNameForBaseKey(baseKey: string): string {
    // Map base keys to table names
    const tableMapping: Record<string, string> = {
      'ASHAAR': 'Ashaar',
      'GHAZLEN': 'Ghazlen',
      'NAZMEN': 'Nazmen',
      'RUBAI': 'Rubai',
      'EBOOKS': 'E-Books',
      'SHAER': 'Intro',
      'ALERTS': 'Alerts',
      'DID_YOU_KNOW': 'Did You Know',
      'ADS': 'Ads',
      'CAROUSEL': 'Carousel',
      'ASHAAR_COMMENTS': 'Comments',
      'GHAZLEN_COMMENTS': 'Comments',
      'NAZMEN_COMMENTS': 'Comments',
      'RUBAI_COMMENTS': 'Comments'
    };

    return tableMapping[baseKey] || baseKey;
  }

  private getBaseKeyForContentType(contentType: ContentType): string | null {
    const mapping: Record<ContentType, string> = {
      'ashaar': 'ASHAAR',
      'ghazlen': 'GHAZLEN',
      'nazmen': 'NAZMEN',
      'rubai': 'RUBAI',
      'ebooks': 'EBOOKS',
      'shaer': 'SHAER'
    };

    return mapping[contentType] || null;
  }

  private getRequiredFields(contentType: ContentType): string[] {
    // Define required fields for each content type
    const requiredFieldsMapping: Record<ContentType, string[]> = {
      'ashaar': ['id', 'sher', 'shaer'],
      'ghazlen': ['id', 'ghazal', 'shaer'],
      'nazmen': ['id', 'nazm', 'shaer'],
      'rubai': ['id', 'body', 'shaer'],
      'ebooks': ['id', 'bookName', 'writer'],
      'shaer': ['id', 'name']
    };

    return requiredFieldsMapping[contentType] || ['id'];
  }

  private getOptionalFields(contentType: ContentType, allFields: readonly string[]): string[] {
    const requiredFields = this.getRequiredFields(contentType);
    return allFields.filter(field => !requiredFields.includes(field));
  }
}

// Singleton instance getter
export function getConfigManager(): AirtableConfigManager {
  return AirtableConfigManager.getInstance();
}

// Convenience functions for common operations

/**
 * Get base ID for a table using the configuration manager
 */
export async function getBaseIdForTable(tableName: string, contentType?: string): Promise<AirtableBaseId> {
  const configManager = getConfigManager();
  return configManager.getBaseIdForTable(tableName, contentType);
}

/**
 * Get field mapping for a content type using the configuration manager
 */
export async function getFieldMapping(contentType: ContentType): Promise<FieldMappingConfiguration> {
  const configManager = getConfigManager();
  return configManager.getFieldMappingConfiguration(contentType);
}

/**
 * Validate configuration and return summary
 */
export async function validateAirtableConfiguration(): Promise<ValidationResult> {
  const configManager = getConfigManager();
  return configManager.validateConfiguration();
}

/**
 * Get configuration summary for health checks
 */
export async function getConfigurationHealth(): Promise<{
  status: 'healthy' | 'warning' | 'error';
  summary: any;
  validation: ValidationResult;
}> {
  const configManager = getConfigManager();
  const summary = await configManager.getConfigurationSummary();
  const validation = await configManager.validateConfiguration();

  let status: 'healthy' | 'warning' | 'error' = 'healthy';

  if (!validation.isValid) {
    status = 'error';
  } else if (validation.warnings.length > 0) {
    status = 'warning';
  }

  return {
    status,
    summary,
    validation
  };
}

/**
 * Initialize configuration with environment-based loading
 */
export async function initializeAirtableConfiguration(overrides: ConfigurationOverrides = {}): Promise<AirtableConfiguration> {
  const configManager = getConfigManager();
  return configManager.loadConfiguration(overrides);
}