/**
 * Comprehensive test script for homepage content loading
 * Tests all content endpoints and validates error handling
 * Requirements: 4.1, 4.2, 4.4, 4.5
 */

const { performance } = require("perf_hooks");

// Configuration
const BASE_URL = "http://localhost:3000";

// Content endpoints to test (matching homepage requirements)
const CONTENT_ENDPOINTS = [
  { name: "Ashaar", endpoint: "ashaar", maxRecords: 3, required: true },
  { name: "Ghazlen", endpoint: "ghazlen", maxRecords: 3, required: true },
  { name: "E-Books", endpoint: "ebooks", maxRecords: 3, required: true },
  { name: "Nazmen", endpoint: "nazmen", maxRecords: 3, required: false },
  { name: "Rubai", endpoint: "rubai", maxRecords: 3, required: false },
  { name: "Shaer", endpoint: "shaer", maxRecords: 3, required: false },
];

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  performance: {},
  apiStatus: {},
  errorHandling: {
    tested: 0,
    passed: 0,
  },
};

/**
 * Fetch data from an API endpoint with detailed error capture
 */
async function fetchEndpointDetailed(endpoint, params = {}) {
  const searchParams = new URLSearchParams(params);
  const url = `${BASE_URL}/api/airtable/${endpoint}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  const start = performance.now();

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Homepage-Content-Test/1.0",
      },
    });

    const end = performance.now();
    const duration = end - start;

    // Get response text first to handle both JSON and HTML responses
    const responseText = await response.text();

    let data;
    let isJson = false;

    try {
      data = JSON.parse(responseText);
      isJson = true;
    } catch (e) {
      data = responseText;
      isJson = false;
    }

    return {
      success: response.ok && isJson,
      data,
      duration,
      status: response.status,
      statusText: response.statusText,
      url,
      isJson,
      responseText: responseText.substring(0, 200), // First 200 chars for debugging
    };
  } catch (error) {
    const end = performance.now();
    const duration = end - start;

    return {
      success: false,
      error: error.message,
      duration,
      url,
      networkError: true,
    };
  }
}

/**
 * Test API error handling scenarios
 */
async function testErrorHandling() {
  console.log("\n🚨 Testing API Error Handling...");

  const errorTests = [
    {
      name: "Invalid Endpoint",
      test: () => fetchEndpointDetailed("invalid-endpoint"),
      expectation: "Should return 404 or proper error response",
    },
    {
      name: "Invalid Parameters",
      test: () => fetchEndpointDetailed("ashaar", { pageSize: "999" }),
      expectation: "Should validate parameters and return error",
    },
    {
      name: "Malformed Request",
      test: () =>
        fetchEndpointDetailed("ashaar", { filterByFormula: "INVALID(" }),
      expectation: "Should handle malformed filter formulas",
    },
  ];

  for (const errorTest of errorTests) {
    testResults.errorHandling.tested++;

    try {
      console.log(`  Testing: ${errorTest.name}`);
      const result = await errorTest.test();

      // Check if error is handled appropriately
      if (!result.success || result.status >= 400) {
        console.log(
          `  ✅ ${errorTest.name}: Error properly handled (${
            result.status || "Network Error"
          })`
        );
        testResults.errorHandling.passed++;
      } else {
        console.log(`  ⚠️  ${errorTest.name}: Unexpectedly succeeded`);
      }
    } catch (error) {
      console.log(`  ✅ ${errorTest.name}: Exception properly caught`);
      testResults.errorHandling.passed++;
    }
  }
}

/**
 * Test rate limiting and loading states
 */
async function testRateLimitingAndLoading() {
  console.log("\n⏱️  Testing Rate Limiting and Loading States...");

  // Test concurrent requests to check rate limiting
  const concurrentRequests = Array(5)
    .fill()
    .map(() => fetchEndpointDetailed("ashaar", { maxRecords: "1" }));

  const start = performance.now();
  const results = await Promise.allSettled(concurrentRequests);
  const end = performance.now();

  const totalDuration = end - start;
  let rateLimitDetected = false;
  let successfulRequests = 0;

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      const response = result.value;
      if (response.status === 429) {
        rateLimitDetected = true;
        console.log(`  ✅ Rate limiting detected on request ${index + 1}`);
      } else if (response.success) {
        successfulRequests++;
      }
    }
  });

  console.log(
    `  📊 Concurrent requests: ${successfulRequests}/${results.length} successful`
  );
  console.log(`  ⏱️  Total time: ${totalDuration.toFixed(2)}ms`);

  if (rateLimitDetected) {
    console.log(`  ✅ Rate limiting is working properly`);
  } else {
    console.log(
      `  ℹ️  No rate limiting detected (may be expected for low volume)`
    );
  }
}

/**
 * Test a single content endpoint with comprehensive validation
 */
async function testContentEndpoint(contentConfig) {
  const { name, endpoint, maxRecords, required } = contentConfig;

  console.log(`\n🧪 Testing ${name} endpoint...`);

  try {
    const result = await fetchEndpointDetailed(endpoint, {
      maxRecords: maxRecords.toString(),
    });

    // Record API status for reporting
    testResults.apiStatus[name] = {
      status: result.status,
      success: result.success,
      isJson: result.isJson,
      duration: result.duration,
    };

    if (!result.success) {
      const errorType = result.networkError
        ? "Network Error"
        : result.status === 500
        ? "Server Error (500)"
        : result.status === 404
        ? "Not Found (404)"
        : result.status === 422
        ? "Field Mapping Error (422)"
        : `HTTP ${result.status}`;

      testResults.failed++;
      testResults.errors.push({
        endpoint: name,
        error: `${errorType}: ${result.error || result.statusText}`,
        url: result.url,
        required: required,
        debugInfo: result.responseText,
      });

      console.log(`❌ ${name} failed: ${errorType}`);

      // For required endpoints, this is a critical failure
      if (required) {
        console.log(
          `   🚨 CRITICAL: ${name} is required for homepage functionality`
        );
      }

      return false;
    }

    // Success case - validate response structure if JSON
    if (result.isJson && result.data) {
      const validationErrors = validateJsonResponse(result.data, endpoint);

      if (validationErrors.length > 0) {
        testResults.failed++;
        testResults.errors.push({
          endpoint: name,
          error: `Validation errors: ${validationErrors.join(", ")}`,
          url: result.url,
          required: required,
        });
        console.log(
          `❌ ${name} validation failed: ${validationErrors.join(", ")}`
        );
        return false;
      }
    }

    // Record performance
    testResults.performance[name] = result.duration;

    // Success
    testResults.passed++;
    console.log(`✅ ${name} passed (${result.duration.toFixed(2)}ms)`);

    // Log sample data for verification
    if (result.isJson && result.data?.data?.records?.length > 0) {
      const sampleRecord = result.data.data.records[0];
      console.log(
        `   Sample: ${
          sampleRecord.fields?.title ||
          sampleRecord.fields?.name ||
          sampleRecord.fields?.shaer ||
          "No title"
        }`
      );
    } else if (result.isJson && result.data?.records?.length > 0) {
      const sampleRecord = result.data.records[0];
      console.log(
        `   Sample: ${
          sampleRecord.fields?.title ||
          sampleRecord.fields?.name ||
          sampleRecord.fields?.shaer ||
          "No title"
        }`
      );
    }

    return true;
  } catch (error) {
    testResults.failed++;
    testResults.errors.push({
      endpoint: name,
      error: error.message,
      url: `${BASE_URL}/api/airtable/${endpoint}`,
      required: required,
    });
    console.log(`❌ ${name} exception: ${error.message}`);
    return false;
  }
}

/**
 * Validate JSON response structure
 */
function validateJsonResponse(data, contentType) {
  const validations = [];

  // Check for common response patterns
  if (data.success !== undefined) {
    // Pattern 1: { success: boolean, data: { records: [] } }
    if (typeof data.success !== "boolean") {
      validations.push("Invalid success property type");
    }

    if (data.success && !data.data) {
      validations.push("Missing data property in successful response");
    }

    if (data.success && data.data && !Array.isArray(data.data.records)) {
      validations.push("Missing or invalid records array in data");
    }
  } else if (Array.isArray(data.records)) {
    // Pattern 2: { records: [] } (direct records)
    // This is valid
  } else if (Array.isArray(data)) {
    // Pattern 3: Direct array of records
    // This is valid
  } else {
    validations.push("Unrecognized response structure");
  }

  return validations;
}

/**
 * Test homepage data fetching simulation
 */
async function testHomepageDataFetch() {
  console.log("\n🏠 Testing Homepage Data Fetch Simulation...");

  try {
    // Simulate the homepage's Promise.allSettled approach for required content
    const requiredEndpoints = CONTENT_ENDPOINTS.filter((ep) => ep.required);
    const promises = requiredEndpoints.map((ep) =>
      fetchEndpointDetailed(ep.endpoint, {
        maxRecords: ep.maxRecords.toString(),
      })
    );

    const results = await Promise.allSettled(promises);

    let successCount = 0;
    let failureCount = 0;

    results.forEach((result, index) => {
      const endpointName = requiredEndpoints[index].name;

      if (result.status === "fulfilled" && result.value.success) {
        successCount++;
        console.log(`✅ Homepage ${endpointName}: Success`);
      } else {
        failureCount++;
        const error =
          result.status === "rejected"
            ? result.reason
            : result.value.error || result.value.statusText;
        console.log(`❌ Homepage ${endpointName}: ${error}`);
      }
    });

    console.log(
      `\n📊 Homepage simulation: ${successCount}/${requiredEndpoints.length} required endpoints successful`
    );

    if (successCount === requiredEndpoints.length) {
      console.log(
        "✅ Homepage would load successfully with all required content"
      );
      return true;
    } else if (successCount > 0) {
      console.log(
        "⚠️  Homepage would load with partial content (some failures)"
      );
      return false;
    } else {
      console.log(
        "❌ Homepage would fail to load (all required endpoints failed)"
      );
      return false;
    }
  } catch (error) {
    console.log(`❌ Homepage simulation failed: ${error.message}`);
    return false;
  }
}

/**
 * Generate comprehensive test report
 */
function generateReport() {
  console.log("\n📋 COMPREHENSIVE TEST REPORT");
  console.log("==============================");
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.passed + testResults.failed}`);

  // API Status Summary
  console.log("\n🔌 API STATUS SUMMARY:");
  Object.entries(testResults.apiStatus).forEach(([endpoint, status]) => {
    const statusIcon = status.success ? "✅" : "❌";
    const requiredIcon = CONTENT_ENDPOINTS.find((ep) => ep.name === endpoint)
      ?.required
      ? "🚨"
      : "ℹ️";
    console.log(
      `${statusIcon} ${requiredIcon} ${endpoint}: ${
        status.status
      } (${status.duration?.toFixed(2)}ms)`
    );
  });

  // Error Details
  if (testResults.errors.length > 0) {
    console.log("\n🚨 ERROR DETAILS:");
    testResults.errors.forEach((error, index) => {
      const criticalIcon = error.required ? "🚨 CRITICAL" : "ℹ️  NON-CRITICAL";
      console.log(
        `${index + 1}. ${criticalIcon} ${error.endpoint}: ${error.error}`
      );
      console.log(`   URL: ${error.url}`);
      if (error.debugInfo) {
        console.log(`   Debug: ${error.debugInfo}`);
      }
    });
  }

  // Performance Summary
  if (Object.keys(testResults.performance).length > 0) {
    console.log("\n⏱️  PERFORMANCE SUMMARY:");
    Object.entries(testResults.performance).forEach(([endpoint, duration]) => {
      console.log(`${endpoint}: ${duration.toFixed(2)}ms`);
    });

    const avgPerformance =
      Object.values(testResults.performance).reduce((a, b) => a + b, 0) /
      Object.values(testResults.performance).length;
    console.log(`Average: ${avgPerformance.toFixed(2)}ms`);
  }

  // Error Handling Summary
  console.log("\n🛡️  ERROR HANDLING SUMMARY:");
  console.log(`Tests: ${testResults.errorHandling.tested}`);
  console.log(`Passed: ${testResults.errorHandling.passed}`);
  console.log(
    `Success Rate: ${(
      (testResults.errorHandling.passed / testResults.errorHandling.tested) *
      100
    ).toFixed(1)}%`
  );

  // Overall Assessment
  console.log("\n🎯 OVERALL ASSESSMENT:");
  const criticalErrors = testResults.errors.filter((e) => e.required).length;
  const nonCriticalErrors = testResults.errors.filter(
    (e) => !e.required
  ).length;

  if (criticalErrors === 0 && testResults.passed > 0) {
    console.log("✅ PASS: All critical endpoints working, homepage can load");
  } else if (criticalErrors > 0) {
    console.log(
      "❌ FAIL: Critical endpoints failing, homepage functionality impacted"
    );
  } else {
    console.log("⚠️  PARTIAL: Some functionality may be limited");
  }

  console.log(`Critical errors: ${criticalErrors}`);
  console.log(`Non-critical errors: ${nonCriticalErrors}`);

  return criticalErrors === 0;
}

/**
 * Main test runner
 */
async function runComprehensiveTests() {
  console.log("🚀 Starting Comprehensive Homepage Content Tests");
  console.log("===============================================");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Testing ${CONTENT_ENDPOINTS.length} content endpoints\n`);

  // Test individual endpoints
  for (const contentConfig of CONTENT_ENDPOINTS) {
    await testContentEndpoint(contentConfig);
  }

  // Test homepage simulation
  await testHomepageDataFetch();

  // Test error handling scenarios
  await testErrorHandling();

  // Test rate limiting and loading states
  await testRateLimitingAndLoading();

  // Generate comprehensive report
  const criticalTestsPassed = generateReport();

  if (criticalTestsPassed) {
    console.log(
      "\n🎉 Critical tests passed! Homepage functionality is working."
    );
    process.exit(0);
  } else {
    console.log(
      "\n💥 Critical tests failed. Homepage functionality may be impacted."
    );
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runComprehensiveTests().catch((error) => {
    console.error("💥 Test runner failed:", error);
    process.exit(1);
  });
}

module.exports = {
  runComprehensiveTests,
  testContentEndpoint,
  fetchEndpointDetailed,
};
