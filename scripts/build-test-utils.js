#!/usr/bin/env node

/**
 * Build Testing Utilities
 * Tests build process with various API states to ensure robust deployment
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class BuildTester {
  constructor() {
    this.results = {
      normalBuild: null,
      apiUnavailableBuild: null,
      partialApiFail: null,
      fallbackMechanisms: null
    };
    this.originalEnv = { ...process.env };
  }

  /**
   * Run a build with specific environment configuration
   */
  async runBuild(testName, envOverrides = {}) {
    console.log(`\n🧪 Running build test: ${testName}`);
    console.log('=' .repeat(50));

    // Set environment variables
    const testEnv = { ...this.originalEnv, ...envOverrides };

    return new Promise((resolve, reject) => {
      const buildProcess = spawn('npm', ['run', 'build'], {
        env: testEnv,
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';

      buildProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });

      buildProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });

      buildProcess.on('close', (code) => {
        const result = {
          testName,
          exitCode: code,
          success: code === 0,
          stdout,
          stderr,
          duration: Date.now(),
          envOverrides
        };

        if (code === 0) {
          console.log(`✅ ${testName} - Build successful`);
        } else {
          console.log(`❌ ${testName} - Build failed with code ${code}`);
        }

        resolve(result);
      });

      buildProcess.on('error', (error) => {
        console.error(`❌ ${testName} - Build process error:`, error);
        reject(error);
      });
    });
  }

  /**
   * Test 1: Normal build with working API
   */
  async testNormalBuild() {
    this.results.normalBuild = await this.runBuild('Normal Build', {
      NODE_ENV: 'production',
      NEXT_PUBLIC_VERCEL_URL: 'https://jahannuma.vercel.app'
    });
    return this.results.normalBuild;
  }

  /**
   * Test 2: Build when Airtable API is unavailable
   */
  async testApiUnavailableBuild() {
    this.results.apiUnavailableBuild = await this.runBuild('API Unavailable Build', {
      NODE_ENV: 'production',
      NEXT_PUBLIC_VERCEL_URL: 'https://jahannuma.vercel.app',
      // Simulate API unavailability by using invalid credentials
      AIRTABLE_API_KEY: 'invalid_key_for_testing',
      AIRTABLE_BASE_ID: 'invalid_base_for_testing'
    });
    return this.results.apiUnavailableBuild;
  }

  /**
   * Test 3: Build with partial API failures
   */
  async testPartialApiFail() {
    this.results.partialApiFail = await this.runBuild('Partial API Failure Build', {
      NODE_ENV: 'production',
      NEXT_PUBLIC_VERCEL_URL: 'https://jahannuma.vercel.app',
      // Simulate network timeout issues
      BUILD_TIMEOUT: '1000', // Very short timeout to trigger failures
      API_RETRY_COUNT: '1'
    });
    return this.results.partialApiFail;
  }

  /**
   * Test 4: Verify fallback mechanisms work
   */
  async testFallbackMechanisms() {
    console.log('\n🔍 Testing fallback mechanisms...');
    
    // Check if fallback data files exist
    const fallbackPaths = [
      'lib/build-safe-fallbacks.ts',
      'lib/cache-utils.ts'
    ];

    const fallbackTests = [];
    
    for (const fallbackPath of fallbackPaths) {
      const exists = fs.existsSync(fallbackPath);
      fallbackTests.push({
        file: fallbackPath,
        exists,
        status: exists ? '✅' : '❌'
      });
      console.log(`${exists ? '✅' : '❌'} Fallback file: ${fallbackPath}`);
    }

    // Test build with fallback mode enabled
    const fallbackBuild = await this.runBuild('Fallback Mechanisms Test', {
      NODE_ENV: 'production',
      NEXT_PUBLIC_VERCEL_URL: 'https://jahannuma.vercel.app',
      USE_BUILD_FALLBACKS: 'true',
      AIRTABLE_API_KEY: 'invalid_key_for_testing'
    });

    this.results.fallbackMechanisms = {
      fallbackFiles: fallbackTests,
      buildResult: fallbackBuild
    };

    return this.results.fallbackMechanisms;
  }

  /**
   * Check build output for specific patterns
   */
  analyzeBuildOutput(result) {
    const analysis = {
      hasUrlErrors: /Failed to parse URL/.test(result.stderr),
      hasHydrationErrors: /Hydration/.test(result.stderr),
      hasTypeScriptErrors: /Type error/.test(result.stderr),
      hasBuildErrors: /Build error/.test(result.stderr),
      buildSize: this.extractBuildSize(result.stdout),
      warnings: this.extractWarnings(result.stderr)
    };

    return analysis;
  }

  extractBuildSize(stdout) {
    const sizeMatch = stdout.match(/Total size:\s*(\d+(?:\.\d+)?)\s*(kB|MB)/);
    return sizeMatch ? `${sizeMatch[1]} ${sizeMatch[2]}` : 'Unknown';
  }

  extractWarnings(stderr) {
    const warningLines = stderr.split('\n').filter(line => 
      line.includes('Warning') || line.includes('warn')
    );
    return warningLines.slice(0, 5); // Limit to first 5 warnings
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    console.log('\n📊 BUILD TEST REPORT');
    console.log('=' .repeat(60));

    const allTests = [
      this.results.normalBuild,
      this.results.apiUnavailableBuild,
      this.results.partialApiFail
    ].filter(Boolean);

    // Summary
    const successCount = allTests.filter(test => test.success).length;
    const totalTests = allTests.length;
    
    console.log(`\n📈 Summary: ${successCount}/${totalTests} tests passed`);
    
    // Detailed results
    allTests.forEach(test => {
      console.log(`\n🧪 ${test.testName}:`);
      console.log(`   Status: ${test.success ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Exit Code: ${test.exitCode}`);
      
      const analysis = this.analyzeBuildOutput(test);
      console.log(`   URL Errors: ${analysis.hasUrlErrors ? '❌ Found' : '✅ None'}`);
      console.log(`   Hydration Errors: ${analysis.hasHydrationErrors ? '❌ Found' : '✅ None'}`);
      console.log(`   TypeScript Errors: ${analysis.hasTypeScriptErrors ? '❌ Found' : '✅ None'}`);
      console.log(`   Build Size: ${analysis.buildSize}`);
      
      if (analysis.warnings.length > 0) {
        console.log(`   Warnings: ${analysis.warnings.length} found`);
      }
    });

    // Fallback mechanisms report
    if (this.results.fallbackMechanisms) {
      console.log('\n🛡️  Fallback Mechanisms:');
      this.results.fallbackMechanisms.fallbackFiles.forEach(file => {
        console.log(`   ${file.status} ${file.file}`);
      });
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    
    if (!this.results.normalBuild?.success) {
      console.log('   - Fix normal build issues before proceeding');
    }
    
    if (!this.results.apiUnavailableBuild?.success) {
      console.log('   - Implement better API fallback mechanisms');
    }
    
    if (allTests.some(test => this.analyzeBuildOutput(test).hasUrlErrors)) {
      console.log('   - Address remaining URL parsing errors');
    }

    if (allTests.some(test => this.analyzeBuildOutput(test).hasHydrationErrors)) {
      console.log('   - Fix hydration mismatches between server and client');
    }

    return {
      summary: { successCount, totalTests },
      tests: allTests.map(test => ({
        ...test,
        analysis: this.analyzeBuildOutput(test)
      })),
      fallbacks: this.results.fallbackMechanisms
    };
  }

  /**
   * Save test results to file
   */
  saveResults(report) {
    const resultsPath = path.join(process.cwd(), 'build-test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}`);
  }
}

// Main execution
async function main() {
  const tester = new BuildTester();
  
  try {
    console.log('🚀 Starting comprehensive build testing...');
    
    // Run all tests
    await tester.testNormalBuild();
    await tester.testApiUnavailableBuild();
    await tester.testPartialApiFail();
    await tester.testFallbackMechanisms();
    
    // Generate and save report
    const report = tester.generateReport();
    tester.saveResults(report);
    
    // Exit with appropriate code
    const allPassed = report.summary.successCount === report.summary.totalTests;
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Build testing failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { BuildTester };