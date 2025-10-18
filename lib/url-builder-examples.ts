/**
 * Example usage of the URL builder utility
 * 
 * This file demonstrates how to use the environment-aware URL building
 * infrastructure in different scenarios.
 */

import {
    buildAPIURL,
    buildAirtableAPIURL,
    buildURL,
    detectEnvironment,
    getURLBuilder
} from './url-builder';

// Example 1: Basic URL building for different environments
export function exampleBasicUsage() {
  const builder = getURLBuilder();
  
  console.log('Environment Context:', builder.getEnvironmentContext());
  
  // Server-side URL (always absolute)
  const serverUrl = builder.buildServerURL({
    apiPath: '/api/airtable/ashaar',
    params: { pageSize: 30, filterByFormula: "({shaer}='Ghalib')" }
  });
  console.log('Server URL:', serverUrl);
  
  // Client-side URL (relative by default)
  const clientUrl = builder.buildClientURL({
    apiPath: '/api/airtable/ashaar',
    params: { pageSize: 30, filterByFormula: "({shaer}='Ghalib')" }
  });
  console.log('Client URL:', clientUrl);
}

// Example 2: Using convenience functions
export function exampleConvenienceFunctions() {
  // Auto-detect environment and build appropriate URL
  const autoUrl = buildURL({
    apiPath: '/api/airtable/ghazlen',
    params: { pageSize: 20, search: 'love poetry' }
  });
  console.log('Auto-detected URL:', autoUrl);
  
  // Build API URL with automatic /api/ prefix
  const apiUrl = buildAPIURL('airtable/nazmen', {
    filterByFormula: "({paband}=TRUE())",
    sort: [{ field: 'shaer', direction: 'asc' }]
  });
  console.log('API URL:', apiUrl);
  
  // Build Airtable-specific API URL
  const airtableUrl = buildAirtableAPIURL('rubai', {
    pageSize: 50,
    fields: ['sher', 'shaer', 'likes']
  });
  console.log('Airtable API URL:', airtableUrl);
}

// Example 3: Handling complex parameters (like existing Airtable patterns)
export function exampleComplexParameters() {
  const complexParams = {
    pageSize: 30,
    filterByFormula: "AND(({shaer}='Mir Taqi Mir'), ({likes}>10))",
    fields: ['sher', 'body', 'unwan', 'shaer', 'likes', 'shares'],
    sort: [
      { field: 'likes', direction: 'desc' },
      { field: 'shaer', direction: 'asc' }
    ],
    lang: 'ur'
  };
  
  const url = buildAirtableAPIURL('ashaar', complexParams);
  console.log('Complex parameters URL:', url);
}

// Example 4: Environment-specific configurations
export function exampleEnvironmentSpecific() {
  const env = detectEnvironment();
  
  if (env.isServer) {
    // Server-side: Use absolute URLs for external API calls
    const externalApiUrl = buildURL({
      baseUrl: 'https://api.external-service.com',
      apiPath: '/v1/data',
      params: { key: 'value' },
      forceAbsolute: true
    });
    console.log('External API URL:', externalApiUrl);
  } else {
    // Client-side: Use relative URLs for same-origin requests
    const internalApiUrl = buildURL({
      apiPath: '/api/internal/data',
      params: { clientId: 'web-app' }
    });
    console.log('Internal API URL:', internalApiUrl);
  }
}

// Example 5: Error handling and validation
export function exampleErrorHandling() {
  const builder = getURLBuilder();
  
  try {
    // This will work fine
    const validUrl = builder.buildServerURL({
      baseUrl: 'https://example.com',
      apiPath: '/api/test'
    });
    console.log('Valid URL:', validUrl);
  } catch (error) {
    console.error('URL building failed:', error);
  }
  
  try {
    // This will throw an error due to missing base URL in server context
    const invalidUrl = builder.buildServerURL({
      apiPath: '/api/test'
      // Missing baseUrl - will use environment detection
    });
    console.log('This might fail:', invalidUrl);
  } catch (error) {
    console.error('Expected error for missing base URL:', error);
  }
}

// Example 6: Migration from existing patterns
export function exampleMigrationPattern() {
  // Old pattern (problematic during SSR):
  // const oldUrl = '/api/airtable/ashaar?pageSize=30';
  
  // New pattern (SSR-safe):
  const newUrl = buildAirtableAPIURL('ashaar', { pageSize: 30 });
  
  console.log('Migrated URL:', newUrl);
  
  // For existing SWR usage, you can now use:
  // useSWR(buildAirtableAPIURL('ashaar', params), fetcher)
  // instead of:
  // useSWR('/api/airtable/ashaar', fetcher)
}