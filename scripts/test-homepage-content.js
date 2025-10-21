/**
 * Test script for homepage content loading
 * Tests all content endpoints used by the homepage to verify they load without API errors
 * Requirements: 4.1, 4.2
 */

const { performance } = require("perf_hooks");

// Configuration - Force localhost for testing local development
const BASE_URL = "http://localhost:3000";

// Content endpoints to test (matching homepage requirements)
const CONTENT_ENDPOINTS = [
  { name: "Ashaar", endpoint: "ashaar", maxRecords: 3 },
  { name: "Ghazlen", endpoint: "ghazlen", maxRecords: 3 },
  { name: "E-Books", endpoint: "ebooks", maxRecords: 3 },
  { name: "Nazmen", endpoint: "nazmen", maxRecords: 3 },
  { name: "Rubai", endpoint: "rubai", maxRecords: 3 },
  { name: "Shaer", endpoint: "shaer", maxRecords: 3 },
];

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  performance: {},
};

/**
 * Fetch data from an API endpoint
 */
async function fetchEndpoint(endpoint, params = {}) {
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

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      data,
      duration,
      status: response.status,
      url,
    };
  } catch (error) {
    const end = performance.now();
    const duration = end - start;

    return {
      success: false,
      error: error.message,
      duration,
      url,
    };
  }
}

/**
 * Validate response data structure
 */
function validateResponseData(data, contentType) {
  const validations = [];

  // Check if response has success property
  if (typeof data.success !== "boolean") {
    validations.push("Missing or invalid success property");
  }

  // Check if data property exists when success is true
  if (data.success && !data.data) {
    validations.push("Missing data property in successful response");
  }

  // Check if records array exists
  if (data.success && data.data && !Array.isArray(data.data.records)) {
    validations.push("Missing or invalid records array");
  }

  // Check record structure for content types
  if (
    data.success &&
    data.data &&
    data.data.records &&
    data.data.records.length > 0
  ) {
    const record = data.data.records[0];

    if (!record.id) {
      validations.push("Record missing id field");
    }

    if (!record.fields) {
      validations.push("Record missing fields object");
    }

    // Content-specific field validations
    if (record.fields) {
      switch (contentType) {
        case "ashaar":
        case "ghazlen":
        case "nazmen":
        case "rubai":
          if (!record.fields.shaer && !record.fields.poet) {
            validations.push("Poetry record missing poet/shaer field");
          }
          break;
        case "ebooks":
          if (!record.fields.title && !record.fields.name) {
            validations.push("Book record missing title/name field");
          }
          break;
        case "shaer":
          if (!record.fields.name && !record.fields.shaer) {
            validations.push("Poet record missing name/shaer field");
          }
          break;
      }
    }
  }

  return validations;
}

/**
 * Test a single content endpoint
 */
async function testContentEndpoint(contentConfig) {
  const { name, endpoint, maxRecords } = contentConfig;

  console.log(`\n🧪 Testing ${name} endpoint...`);

  try {
    // Test basic endpoint call
    const result = await fetchEndpoint(endpoint, {
      maxRecords: maxRecords.toString(),
    });

    if (!result.success) {
      testResults.failed++;
      testResults.errors.push({
        endpoint: name,
        error: result.error,
        url: result.url,
      });
      console.log(`❌ ${name} failed: ${result.error}`);
      return false;
    }

    // Validate response structure
    const validationErrors = validateResponseData(result.data, endpoint);

    if (validationErrors.length > 0) {
      testResults.failed++;
      testResults.errors.push({
        endpoint: name,
        error: `Validation errors: ${validationErrors.join(", ")}`,
        url: result.url,
      });
      console.log(
        `❌ ${name} validation failed: ${validationErrors.join(", ")}`
      );
      return false;
    }

    // Record performance
    testResults.performance[name] = result.duration;

    // Success
    testResults.passed++;
    console.log(
      `✅ ${name} passed (${result.duration.toFixed(2)}ms, ${
        result.data.data?.records?.length || 0
      } records)`
    );

    // Log sample data for verification
    if (result.data.data?.records?.length > 0) {
      const sampleRecord = result.data.data.records[0];
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
    });
    console.log(`❌ ${name} exception: ${error.message}`);
    return false;
  }
}

/**
 * Test homepage data fetching simulation
 */
async function testHomepageDataFetch() {
  console.log("\n🏠 Testing homepage data fetch simulation...");

  try {
    // Simulate the homepage's Promise.allSettled approach
    const promises = [
      fetchEndpoint("ashaar", { maxRecords: "3" }),
      fetchEndpoint("ghazlen", { maxRecords: "3" }),
      fetchEndpoint("ebooks", { maxRecords: "3" }),
    ];

    const results = await Promise.allSettled(promises);

    let successCount = 0;
    let failureCount = 0;

    results.forEach((result, index) => {
      const endpointName = ["ashaar", "ghazlen", "ebooks"][index];

      if (result.status === "fulfilled" && result.value.success) {
        successCount++;
        console.log(`✅ Homepage ${endpointName}: Success`);
      } else {
        failureCount++;
        const error =
          result.status === "rejected" ? result.reason : result.value.error;
        console.log(`❌ Homepage ${endpointName}: ${error}`);
      }
    });

    console.log(
      `\n📊 Homepage simulation: ${successCount}/3 endpoints successful`
    );

    if (successCount === 3) {
      console.log("✅ Homepage would load successfully");
      return true;
    } else {
      console.log("⚠️  Homepage would have partial failures");
      return false;
    }
  } catch (error) {
    console.log(`❌ Homepage simulation failed: ${error.message}`);
    return false;
  }
}

/**
 * Test error handling scenarios
 */
async function testErrorScenarios() {
  console.log("\n🚨 Testing error handling scenarios...");

  // Test invalid endpoint
  console.log("Testing invalid endpoint...");
  const invalidResult = await fetchEndpoint("invalid-endpoint");
  if (!invalidResult.success) {
    console.log("✅ Invalid endpoint properly returns error");
  } else {
    console.log("⚠️  Invalid endpoint unexpectedly succeeded");
  }

  // Test invalid parameters
  console.log("Testing invalid parameters...");
  const invalidParamsResult = await fetchEndpoint("ashaar", {
    pageSize: "999",
  });
  if (
    !invalidParamsResult.success ||
    (invalidParamsResult.data && !invalidParamsResult.data.success)
  ) {
    console.log("✅ Invalid parameters properly handled");
  } else {
    console.log("⚠️  Invalid parameters not properly validated");
  }
}

/**
 * Generate test report
 */
function generateReport() {
  console.log("\n📋 TEST REPORT");
  console.log("================");
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.passed + testResults.failed}`);

  if (testResults.errors.length > 0) {
    console.log("\n🚨 ERRORS:");
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.endpoint}: ${error.error}`);
      console.log(`   URL: ${error.url}`);
    });
  }

  console.log("\n⏱️  PERFORMANCE:");
  Object.entries(testResults.performance).forEach(([endpoint, duration]) => {
    console.log(`${endpoint}: ${duration.toFixed(2)}ms`);
  });

  const avgPerformance =
    Object.values(testResults.performance).reduce((a, b) => a + b, 0) /
    Object.values(testResults.performance).length;
  console.log(`Average: ${avgPerformance.toFixed(2)}ms`);

  return testResults.failed === 0;
}

/**
 * Main test runner
 */
async function runHomepageContentTests() {
  console.log("🚀 Starting Homepage Content Loading Tests");
  console.log("==========================================");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Testing ${CONTENT_ENDPOINTS.length} content endpoints\n`);

  // Test individual endpoints
  for (const contentConfig of CONTENT_ENDPOINTS) {
    await testContentEndpoint(contentConfig);
  }

  // Test homepage simulation
  await testHomepageDataFetch();

  // Test error scenarios
  await testErrorScenarios();

  // Generate report
  const allTestsPassed = generateReport();

  if (allTestsPassed) {
    console.log("\n🎉 All homepage content tests passed!");
    process.exit(0);
  } else {
    console.log("\n💥 Some tests failed. Check the errors above.");
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runHomepageContentTests().catch((error) => {
    console.error("💥 Test runner failed:", error);
    process.exit(1);
  });
}

module.exports = {
  runHomepageContentTests,
  testContentEndpoint,
  fetchEndpoint,
};
