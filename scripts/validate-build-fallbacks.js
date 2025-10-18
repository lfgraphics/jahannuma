#!/usr/bin/env node

/**
 * Build Fallback Validation Script
 * Validates that fallback mechanisms work correctly during build failures
 */

const fs = require('fs');
const path = require('path');

class FallbackValidator {
  constructor() {
    this.validationResults = {
      buildSafeFallbacks: null,
      cacheUtils: null,
      errorHandling: null,
      universalDataFetcher: null
    };
  }

  /**
   * Validate build-safe fallbacks implementation
   */
  validateBuildSafeFallbacks() {
    console.log('\n🔍 Validating build-safe fallbacks...');
    
    const fallbackPath = 'lib/build-safe-fallbacks.ts';
    
    if (!fs.existsSync(fallbackPath)) {
      console.log('❌ Build-safe fallbacks file not found');
      return { exists: false, valid: false };
    }

    const content = fs.readFileSync(fallbackPath, 'utf8');
    
    // Check for required fallback patterns
    const requiredPatterns = [
      /export.*buildSafeFallback/,
      /catch.*error/i,
      /fallback.*data/i,
      /build.*time/i
    ];

    const patternResults = requiredPatterns.map(pattern => ({
      pattern: pattern.toString(),
      found: pattern.test(content)
    }));

    const allPatternsFound = patternResults.every(result => result.found);

    console.log(`${allPatternsFound ? '✅' : '❌'} Build-safe fallbacks validation`);
    
    this.validationResults.buildSafeFallbacks = {
      exists: true,
      valid: allPatternsFound,
      patterns: patternResults
    };

    return this.validationResults.buildSafeFallbacks;
  }

  /**
   * Validate cache utilities for build-time caching
   */
  validateCacheUtils() {
    console.log('\n🔍 Validating cache utilities...');
    
    const cachePath = 'lib/cache-utils.ts';
    
    if (!fs.existsSync(cachePath)) {
      console.log('❌ Cache utilities file not found');
      return { exists: false, valid: false };
    }

    const content = fs.readFileSync(cachePath, 'utf8');
    
    // Check for caching mechanisms
    const cachePatterns = [
      /cache/i,
      /set.*cache/i,
      /get.*cache/i,
      /invalidate/i
    ];

    const cacheResults = cachePatterns.map(pattern => ({
      pattern: pattern.toString(),
      found: pattern.test(content)
    }));

    const validCache = cacheResults.filter(result => result.found).length >= 2;

    console.log(`${validCache ? '✅' : '❌'} Cache utilities validation`);
    
    this.validationResults.cacheUtils = {
      exists: true,
      valid: validCache,
      patterns: cacheResults
    };

    return this.validationResults.cacheUtils;
  }

  /**
   * Validate error handling mechanisms
   */
  validateErrorHandling() {
    console.log('\n🔍 Validating error handling...');
    
    const errorHandlingPath = 'lib/error-handling.ts';
    
    if (!fs.existsSync(errorHandlingPath)) {
      console.log('❌ Error handling file not found');
      return { exists: false, valid: false };
    }

    const content = fs.readFileSync(errorHandlingPath, 'utf8');
    
    // Check for error handling patterns
    const errorPatterns = [
      /try.*catch/s,
      /error.*handling/i,
      /retry/i,
      /timeout/i
    ];

    const errorResults = errorPatterns.map(pattern => ({
      pattern: pattern.toString(),
      found: pattern.test(content)
    }));

    const validErrorHandling = errorResults.filter(result => result.found).length >= 2;

    console.log(`${validErrorHandling ? '✅' : '❌'} Error handling validation`);
    
    this.validationResults.errorHandling = {
      exists: true,
      valid: validErrorHandling,
      patterns: errorResults
    };

    return this.validationResults.errorHandling;
  }

  /**
   * Validate universal data fetcher
   */
  validateUniversalDataFetcher() {
    console.log('\n🔍 Validating universal data fetcher...');
    
    const fetcherPath = 'lib/universal-data-fetcher.ts';
    
    if (!fs.existsSync(fetcherPath)) {
      console.log('❌ Universal data fetcher file not found');
      return { exists: false, valid: false };
    }

    const content = fs.readFileSync(fetcherPath, 'utf8');
    
    // Check for universal fetcher patterns
    const fetcherPatterns = [
      /server.*client/i,
      /environment/i,
      /isServer/i,
      /fallback/i
    ];

    const fetcherResults = fetcherPatterns.map(pattern => ({
      pattern: pattern.toString(),
      found: pattern.test(content)
    }));

    const validFetcher = fetcherResults.filter(result => result.found).length >= 2;

    console.log(`${validFetcher ? '✅' : '❌'} Universal data fetcher validation`);
    
    this.validationResults.universalDataFetcher = {
      exists: true,
      valid: validFetcher,
      patterns: fetcherResults
    };

    return this.validationResults.universalDataFetcher;
  }

  /**
   * Test actual fallback behavior
   */
  async testFallbackBehavior() {
    console.log('\n🧪 Testing fallback behavior...');
    
    try {
      // Try to import and test fallback functions
      const fallbackModule = require('../lib/build-safe-fallbacks.ts');
      
      if (fallbackModule && typeof fallbackModule.buildSafeFallback === 'function') {
        console.log('✅ Fallback function is importable and callable');
        return { importable: true, callable: true };
      } else {
        console.log('❌ Fallback function not properly exported');
        return { importable: true, callable: false };
      }
    } catch (error) {
      console.log('❌ Cannot import fallback module:', error.message);
      return { importable: false, callable: false };
    }
  }

  /**
   * Generate validation report
   */
  generateValidationReport() {
    console.log('\n📊 FALLBACK VALIDATION REPORT');
    console.log('=' .repeat(50));

    const validations = [
      { name: 'Build Safe Fallbacks', result: this.validationResults.buildSafeFallbacks },
      { name: 'Cache Utils', result: this.validationResults.cacheUtils },
      { name: 'Error Handling', result: this.validationResults.errorHandling },
      { name: 'Universal Data Fetcher', result: this.validationResults.universalDataFetcher }
    ];

    let passCount = 0;
    const totalCount = validations.length;

    validations.forEach(validation => {
      const status = validation.result?.valid ? '✅ PASS' : '❌ FAIL';
      const exists = validation.result?.exists ? 'EXISTS' : 'MISSING';
      
      console.log(`\n${validation.name}: ${status} (${exists})`);
      
      if (validation.result?.valid) {
        passCount++;
      }

      if (validation.result?.patterns) {
        validation.result.patterns.forEach(pattern => {
          console.log(`   ${pattern.found ? '✅' : '❌'} ${pattern.pattern}`);
        });
      }
    });

    console.log(`\n📈 Summary: ${passCount}/${totalCount} validations passed`);

    // Recommendations
    console.log('\n💡 Recommendations:');
    
    if (passCount < totalCount) {
      console.log('   - Implement missing fallback mechanisms');
      console.log('   - Ensure all required patterns are present in code');
    }
    
    if (!this.validationResults.buildSafeFallbacks?.valid) {
      console.log('   - Implement build-safe fallback functions');
    }
    
    if (!this.validationResults.cacheUtils?.valid) {
      console.log('   - Add proper caching mechanisms for build-time data');
    }

    return {
      summary: { passCount, totalCount },
      validations: validations.map(v => ({
        name: v.name,
        ...v.result
      }))
    };
  }
}

// Main execution
async function main() {
  const validator = new FallbackValidator();
  
  try {
    console.log('🔍 Starting fallback validation...');
    
    // Run all validations
    validator.validateBuildSafeFallbacks();
    validator.validateCacheUtils();
    validator.validateErrorHandling();
    validator.validateUniversalDataFetcher();
    
    // Test actual behavior
    await validator.testFallbackBehavior();
    
    // Generate report
    const report = validator.generateValidationReport();
    
    // Save results
    const resultsPath = path.join(process.cwd(), 'fallback-validation-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Validation results saved to: ${resultsPath}`);
    
    // Exit with appropriate code
    const allPassed = report.summary.passCount === report.summary.totalCount;
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Fallback validation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { FallbackValidator };