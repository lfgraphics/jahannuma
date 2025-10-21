/**
 * Airtable Configuration Management - Main Export
 * 
 * Centralized exports for all Airtable configuration management functionality.
 * This module provides a unified interface for configuration management, validation,
 * and initialization.
 */

// Configuration Manager
export {
  AirtableConfigManager, getConfigManager, getConfigurationHealth, getFieldMapping, initializeAirtableConfiguration, validateAirtableConfiguration, type AirtableConfiguration, type BaseConfiguration, type ConfigurationOverrides, type FieldMappingConfiguration, type ValidationResult
} from './config-manager';

// Configuration Loader
export {
  createEnvironmentOverrides, createEnvironmentSpecificOverrides, getConfigurationStatus, getEnvironmentDefaults, initializeConfiguration, isConfigurationInitialized, loadEnvironmentConfig, reloadConfiguration, validateCurrentConfiguration, type ConfigLoadOptions, type EnvironmentConfig
} from './config-loader';

// Configuration Validator
export {
  ConfigurationValidator, quickValidationCheck,
  validateBaseConfiguration, validateAirtableConfiguration as validateConfiguration, type DetailedValidationResult, type ValidationOptions, type ValidationReport, type ValidationSeverity
} from './config-validator';

// Re-export from existing modules for convenience
export {
  BASE_IDS, COMMENT_BASE_MAPPING, SORTS,
  TABLES, TABLE_BASE_MAPPING, getAllBaseIds, getBaseIdForContentType, getCommentBaseId,
  validateAllBaseIds, validateBaseId, type AirtableBaseId, type ContentType as BaseContentType, type BaseIdKey, type TableName
} from './airtable-constants';

export {
  findFieldInAllContentTypes, getFieldCategories, getValidFields, preValidateApiFields, suggestCorrectField, suggestFieldCorrection, validateAndCleanFields, validateFields, type ContentType, type FieldSuggestion, type ValidationResult as FieldValidationResult
} from './field-validator';

// Configuration Initialization
export {
  getInitializationHealth, initializeAirtableConfig, isConfigurationReady, productionInit, quickInit, reinitializeConfiguration, testInit, type InitOptions, type InitializationStatus
} from './init-config';

// Client functions (re-export for convenience)
export {
  createRecord, deleteRecord, fetchRecord, fetchRecords, getAirtableApiKey,
  getAirtableConfig, getAshaarRecord, getBaseIdForTable, getCommentsRecord, getEbooksRecord, getGhazlenRecord, getNazmenRecord, getRubaiRecord, listAshaarRecords, listCommentsRecords, listEbooksRecords, listGhazlenRecords, listNazmenRecords, listRubaiRecords, updateRecord
} from './airtable-client';

// Formatter functions (re-export from utils)
export {
  buildDataIdFilter, buildIdFilter, buildShaerFilter, buildUnwanFilter, formatAshaarRecord, formatBookRecord, formatGhazlenRecord, formatNazmenRecord, formatRubaiRecord
} from '../../../lib/airtable-utils';

// Client utilities (re-export from client utils)
export {
  getClientBaseId, getClientBaseIdForTable
} from '../../../lib/airtable-client-utils';

