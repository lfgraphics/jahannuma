/**
 * Migration utilities for transitioning from hardcoded base IDs to centralized management
 */

import { BASE_IDS, validateAllBaseIds, type AirtableBaseId } from './airtable-constants';

// Legacy base ID mappings for migration reference
export const LEGACY_BASE_IDS = {
  ASHAAR: "appeI2xzzyvUN5bR7",
  GHAZLEN: "appvzkf6nX376pZy6",
  NAZMEN: "app5Y2OsuDgpXeQdz",
  RUBAI: "appIewyeCIcAD4Y11",
  EBOOKS: "appXcBoNMGdIaSUyA",
  SHAER: "appgWv81tu4RT3uRB",
  ASHAAR_COMMENTS: "appkb5lm483FiRD54",
  GHAZLEN_COMMENTS: "appzB656cMxO0QotZ",
  NAZMEN_COMMENTS: "appjF9QvJeKAM9c9F",
  RUBAI_COMMENTS: "appseIUI98pdLBT1K",
} as const;

/**
 * Validate that all base IDs are properly configured
 */
export function validateMigration(): { success: boolean; report: string[] } {
  const report: string[] = [];
  
  // Validate base ID format
  const validation = validateAllBaseIds();
  if (!validation.valid) {
    report.push('❌ Base ID validation failed:');
    validation.errors.forEach(error => report.push(`  - ${error}`));
    return { success: false, report };
  }
  
  report.push('✅ All base IDs have valid format');
  
  // Check for consistency with legacy IDs where applicable
  const consistencyChecks = [
    { key: 'ASHAAR', legacy: LEGACY_BASE_IDS.ASHAAR, current: BASE_IDS.ASHAAR },
    { key: 'GHAZLEN', legacy: LEGACY_BASE_IDS.GHAZLEN, current: BASE_IDS.GHAZLEN },
    { key: 'NAZMEN', legacy: LEGACY_BASE_IDS.NAZMEN, current: BASE_IDS.NAZMEN },
    { key: 'RUBAI', legacy: LEGACY_BASE_IDS.RUBAI, current: BASE_IDS.RUBAI },
    { key: 'EBOOKS', legacy: LEGACY_BASE_IDS.EBOOKS, current: BASE_IDS.EBOOKS },
    { key: 'SHAER', legacy: LEGACY_BASE_IDS.SHAER, current: BASE_IDS.SHAER },
  ];
  
  let hasInconsistencies = false;
  consistencyChecks.forEach(({ key, legacy, current }) => {
    if (legacy === current) {
      report.push(`✅ ${key}: Consistent with legacy (${current})`);
    } else {
      report.push(`⚠️  ${key}: Changed from ${legacy} to ${current}`);
      hasInconsistencies = true;
    }
  });
  
  // Check new base IDs
  const newBaseIds = [
    { key: 'ALERTS', id: BASE_IDS.ALERTS },
    { key: 'DID_YOU_KNOW', id: BASE_IDS.DID_YOU_KNOW },
    { key: 'ADS', id: BASE_IDS.ADS },
    { key: 'CAROUSEL', id: BASE_IDS.CAROUSEL },
  ];
  
  newBaseIds.forEach(({ key, id }) => {
    report.push(`✅ ${key}: New base ID configured (${id})`);
  });
  
  if (hasInconsistencies) {
    report.push('');
    report.push('⚠️  Note: Some base IDs have changed from legacy values.');
    report.push('   Make sure this is intentional and update any hardcoded references.');
  }
  
  return { success: true, report };
}

/**
 * Get migration status for a specific base ID
 */
export function getMigrationStatus(baseId: string): {
  isLegacy: boolean;
  isCurrent: boolean;
  recommendation: string;
} {
  const isLegacy = Object.values(LEGACY_BASE_IDS).includes(baseId as any);
  const isCurrent = Object.values(BASE_IDS).includes(baseId as AirtableBaseId);
  
  let recommendation = '';
  if (isLegacy && isCurrent) {
    recommendation = 'This base ID is still valid. No migration needed.';
  } else if (isLegacy && !isCurrent) {
    recommendation = 'This is a legacy base ID that has been updated. Use the new centralized constants.';
  } else if (!isLegacy && isCurrent) {
    recommendation = 'This is a new base ID. Good to use.';
  } else {
    recommendation = 'This base ID is not recognized. Check if it should be added to the constants.';
  }
  
  return { isLegacy, isCurrent, recommendation };
}

/**
 * Find the current base ID for a legacy base ID
 */
export function findCurrentBaseId(legacyBaseId: string): AirtableBaseId | null {
  // Find the key for the legacy base ID
  const legacyKey = Object.entries(LEGACY_BASE_IDS).find(
    ([, value]) => value === legacyBaseId
  )?.[0];
  
  if (!legacyKey) {
    return null;
  }
  
  // Return the current base ID for that key
  return BASE_IDS[legacyKey as keyof typeof BASE_IDS] || null;
}

/**
 * Generate a migration report for the entire codebase
 */
export function generateMigrationReport(): string {
  const { success, report } = validateMigration();
  
  const header = [
    '# Airtable Base ID Migration Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Status: ${success ? '✅ PASSED' : '❌ FAILED'}`,
    '',
    '## Validation Results',
    '',
  ];
  
  const footer = [
    '',
    '## Next Steps',
    '',
    '1. Update any remaining hardcoded base IDs in components',
    '2. Test all API endpoints with new base IDs',
    '3. Update environment variables if needed',
    '4. Remove legacy constants once migration is complete',
    '',
    '## Usage',
    '',
    '```typescript',
    'import { BASE_IDS, getBaseIdForTable } from "src/lib/airtable/airtable-constants";',
    '',
    '// Use centralized constants',
    'const baseId = BASE_IDS.ASHAAR;',
    '',
    '// Or use helper functions',
    'const baseId = getBaseIdForTable("Ashaar");',
    '```',
  ];
  
  return [...header, ...report, ...footer].join('\n');
}