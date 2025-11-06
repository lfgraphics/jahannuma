#!/usr/bin/env node

/**
 * Integration test for Route Completeness Validator
 *
 * Tests the validator functionality with real project data
 */

const { RouteCompletenessValidator } = require("../lib/route-validator-cli.js");

async function runIntegrationTests() {
  console.log("🧪 Running Route Completeness Validator Integration Tests\n");

  const validator = new RouteCompletenessValidator();
  let testsPassed = 0;
  let testsTotal = 0;

  // Test 1: Full validation
  testsTotal++;
  console.log("Test 1: Full validation...");
  try {
    const result = await validator.validateRouteCompleteness();

    if (result && typeof result.isValid === "boolean") {
      console.log("✅ Full validation completed successfully");
      console.log(
        `   - Validation result: ${result.isValid ? "PASSED" : "FAILED"}`
      );
      console.log(
        `   - EN completeness: ${result.summary.completenessPercentageEN}%`
      );
      console.log(
        `   - HI completeness: ${result.summary.completenessPercentageHI}%`
      );
      testsPassed++;
    } else {
      console.log("❌ Full validation returned invalid result");
    }
  } catch (error) {
    console.log("❌ Full validation failed:", error.message);
  }

  // Test 2: Quick validation
  testsTotal++;
  console.log("\nTest 2: Quick validation...");
  try {
    const isValid = await validator.quickValidation();

    if (typeof isValid === "boolean") {
      console.log("✅ Quick validation completed successfully");
      console.log(`   - Result: ${isValid ? "PASSED" : "FAILED"}`);
      testsPassed++;
    } else {
      console.log("❌ Quick validation returned invalid result");
    }
  } catch (error) {
    console.log("❌ Quick validation failed:", error.message);
  }

  // Test 3: Missing routes for EN
  testsTotal++;
  console.log("\nTest 3: Missing routes for EN...");
  try {
    const missingRoutes = await validator.getMissingRoutesForLanguage("EN");

    if (Array.isArray(missingRoutes)) {
      console.log("✅ Missing routes check completed successfully");
      console.log(`   - Missing routes count: ${missingRoutes.length}`);
      if (missingRoutes.length > 0) {
        console.log(`   - First missing route: ${missingRoutes[0].route}`);
      }
      testsPassed++;
    } else {
      console.log("❌ Missing routes check returned invalid result");
    }
  } catch (error) {
    console.log("❌ Missing routes check failed:", error.message);
  }

  // Test 4: Missing routes for HI
  testsTotal++;
  console.log("\nTest 4: Missing routes for HI...");
  try {
    const missingRoutes = await validator.getMissingRoutesForLanguage("HI");

    if (Array.isArray(missingRoutes)) {
      console.log("✅ Missing routes check completed successfully");
      console.log(`   - Missing routes count: ${missingRoutes.length}`);
      testsPassed++;
    } else {
      console.log("❌ Missing routes check returned invalid result");
    }
  } catch (error) {
    console.log("❌ Missing routes check failed:", error.message);
  }

  // Test 5: Specific route validation
  testsTotal++;
  console.log("\nTest 5: Specific route validation...");
  try {
    const result = validator.validateSpecificRoute("E-Books/[slug]/[id]");

    if (
      result &&
      typeof result.EN === "boolean" &&
      typeof result.HI === "boolean"
    ) {
      console.log("✅ Specific route validation completed successfully");
      console.log(`   - EN exists: ${result.EN}`);
      console.log(`   - HI exists: ${result.HI}`);
      testsPassed++;
    } else {
      console.log("❌ Specific route validation returned invalid result");
    }
  } catch (error) {
    console.log("❌ Specific route validation failed:", error.message);
  }

  // Test Results
  console.log("\n📊 TEST RESULTS");
  console.log("===============");
  console.log(`Tests passed: ${testsPassed}/${testsTotal}`);
  console.log(`Success rate: ${Math.round((testsPassed / testsTotal) * 100)}%`);

  if (testsPassed === testsTotal) {
    console.log("\n🎉 All integration tests passed!");
    console.log("\n✅ Route Completeness Validator is working correctly");
    return true;
  } else {
    console.log("\n❌ Some integration tests failed");
    return false;
  }
}

// Run tests if executed directly
if (require.main === module) {
  runIntegrationTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("❌ Integration test execution failed:", error.message);
      process.exit(1);
    });
}

module.exports = { runIntegrationTests };
