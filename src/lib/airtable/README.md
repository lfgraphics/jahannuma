# Airtable Configuration Manager

This module provides centralized configuration management for all Airtable-related functionality in the application.

## Features

- **Centralized Configuration**: Single source of truth for all Airtable settings
- **Environment-based Loading**: Automatic configuration loading based on environment
- **Runtime Validation**: Comprehensive validation of configuration and connectivity
- **Field Mapping Management**: Unified field mapping with validation and suggestions
- **Error Recovery**: Built-in fallback mechanisms and error handling

## Quick Start

### Basic Initialization

```typescript
import { initializeAirtableConfig } from "@/lib/airtable";

// Initialize configuration at application startup
const status = await initializeAirtableConfig();

if (status.success) {
  console.log("Airtable configuration ready");
} else {
  console.error("Configuration failed:", status.errors);
}
```

### Environment-specific Initialization

```typescript
import { quickInit, productionInit, testInit } from "@/lib/airtable";

// Development (minimal validation)
await quickInit();

// Production (comprehensive validation)
await productionInit();

// Testing (minimal setup)
await testInit();
```

## Configuration Management

### Getting Configuration

```typescript
import { getConfigManager } from "@/lib/airtable";

const configManager = getConfigManager();
const config = await configManager.getConfiguration();

// Get base configuration for a content type
const baseConfig = await configManager.getBaseConfiguration("ashaar");

// Get field mapping for a content type
const fieldMapping = await configManager.getFieldMappingConfiguration("ashaar");
```

### Validation

```typescript
import { validateAirtableConfiguration } from "@/lib/airtable";

// Comprehensive validation
const report = await validateAirtableConfiguration({
  includeFieldValidation: true,
  includePerformanceChecks: true,
  includeSecurityChecks: true,
  includeConnectivityTests: false, // Skip to avoid API calls
});

console.log("Validation result:", report.isValid);
console.log("Errors:", report.summary.errors);
console.log("Warnings:", report.summary.warnings);
```

### Quick Health Check

```typescript
import { getConfigurationHealth } from "@/lib/airtable";

const health = await getConfigurationHealth();
console.log("Configuration status:", health.status);
console.log("Summary:", health.summary);
```

## Environment Configuration

### Environment Variables

The configuration manager reads from these environment variables:

```bash
# Required
AIRTABLE_API_KEY=your_api_key_here

# Optional
AIRTABLE_BASE_ID=legacy_base_id  # For backward compatibility
ENABLE_FIELD_VALIDATION=true
ENABLE_FALLBACKS=true
AIRTABLE_LOG_LEVEL=info
AIRTABLE_MAX_PAGE_SIZE=100
AIRTABLE_DEFAULT_PAGE_SIZE=50
```

### Configuration Overrides

```typescript
import { initializeAirtableConfig } from "@/lib/airtable";

await initializeAirtableConfig({
  environmentOverrides: {
    globalSettings: {
      enableFieldValidation: true,
      logLevel: "debug",
      maxPageSize: 50,
    },
    baseIds: {
      ASHAAR: "app123456789abcdef", // Override specific base ID
    },
  },
});
```

## Usage in API Routes

### Getting Base ID for Table

```typescript
import { getBaseIdForTable } from "@/lib/airtable";

// In an API route
export async function GET(request: Request) {
  try {
    const baseId = await getBaseIdForTable("Ashaar", "ashaar");
    // Use baseId for API calls...
  } catch (error) {
    return Response.json({ error: "Configuration error" }, { status: 500 });
  }
}
```

### Field Validation

```typescript
import { getFieldMapping, validateFields } from "@/lib/airtable";

// Validate fields before API call
const fieldMapping = await getFieldMapping("ashaar");
const validation = validateFields("ashaar", ["sher", "shaer", "invalidField"]);

if (!validation.isValid) {
  console.warn("Invalid fields:", validation.invalidFields);
  console.log("Suggestions:", validation.suggestions);
}

// Use only valid fields
const validFields = validation.validFields;
```

## Configuration Structure

### Base Configuration

```typescript
interface BaseConfiguration {
  baseId: AirtableBaseId;
  tableName: string;
  environment: "development" | "production" | "test";
  lastValidated: Date;
  isActive: boolean;
  metadata?: {
    description?: string;
    owner?: string;
    lastUpdated?: Date;
  };
}
```

### Field Mapping Configuration

```typescript
interface FieldMappingConfiguration {
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
```

## Error Handling

### Configuration Errors

```typescript
import { isConfigurationReady, getInitializationHealth } from "@/lib/airtable";

// Check if configuration is ready
if (!(await isConfigurationReady())) {
  const health = await getInitializationHealth();
  console.error("Configuration not ready:", health.error);
}
```

### Validation Errors

```typescript
import { quickValidationCheck } from "@/lib/airtable";

const { isValid, errorCount, warningCount } = await quickValidationCheck();

if (!isValid) {
  console.error(
    `Configuration has ${errorCount} errors and ${warningCount} warnings`
  );
}
```

## Best Practices

1. **Initialize Early**: Call initialization functions at application startup
2. **Handle Errors**: Always check initialization status and handle errors gracefully
3. **Use Validation**: Run validation in development to catch configuration issues
4. **Environment Specific**: Use appropriate initialization for each environment
5. **Monitor Health**: Implement health checks for production monitoring

## Troubleshooting

### Common Issues

1. **Missing API Key**: Ensure `AIRTABLE_API_KEY` environment variable is set
2. **Invalid Base IDs**: Check that base IDs follow the format `app` + 14 characters
3. **Field Mapping Errors**: Use field validation to identify and fix invalid field names
4. **Environment Mismatch**: Ensure configuration matches your deployment environment

### Debug Mode

```typescript
// Enable debug logging
await initializeAirtableConfig({
  environmentOverrides: {
    globalSettings: {
      logLevel: "debug",
    },
  },
});
```

### Validation Report

```typescript
// Get detailed validation report
const report = await validateAirtableConfiguration({
  includeFieldValidation: true,
  includePerformanceChecks: true,
  includeSecurityChecks: true,
});

// Log all validation results
for (const result of report.results) {
  console.log(`[${result.severity}] ${result.category}: ${result.message}`);
  if (result.suggestion) {
    console.log(`  Suggestion: ${result.suggestion}`);
  }
}
```
