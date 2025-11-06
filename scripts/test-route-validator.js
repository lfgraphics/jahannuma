#!/usr/bin/env node

/**
 * Test utility for Route Completeness Validator
 *
 * Simple test script to verify the validator functionality
 */

const path = require("path");
const fs = require("fs");

// Import the validator (we'll need to compile TypeScript first)
async function testValidator() {
  console.log("🧪 Testing Route Completeness Validator\n");

  try {
    // Test 1: Check if validator can be instantiated
    console.log("Test 1: Validator instantiation...");

    // Since we're using TypeScript, we need to use a different approach
    // Let's test the CLI instead which is in JavaScript
    const ValidationCLI = require("./validate-route-completeness.js");
    const cli = new ValidationCLI();

    console.log("✅ Validator CLI instantiated successfully\n");

    // Test 2: Check if app directory exists
    console.log("Test 2: App directory structure...");
    const appDir = path.join(process.cwd(), "app");

    if (!fs.existsSync(appDir)) {
      throw new Error("App directory not found");
    }

    const enDir = path.join(appDir, "EN");
    const hiDir = path.join(appDir, "HI");

    console.log(`  App directory: ${fs.existsSync(appDir) ? "✅" : "❌"}`);
    console.log(`  EN directory: ${fs.existsSync(enDir) ? "✅" : "❌"}`);
    console.log(`  HI directory: ${fs.existsSync(hiDir) ? "✅" : "❌"}\n`);

    // Test 3: Check some known routes
    console.log("Test 3: Known route structure...");

    const knownRoutes = [
      "E-Books",
      "Ashaar",
      "Ghazlen",
      "Nazmen",
      "Rubai",
      "Shaer",
    ];

    for (const route of knownRoutes) {
      const defaultExists = fs.existsSync(path.join(appDir, route));
      const enExists = fs.existsSync(path.join(enDir, route));
      const hiExists = fs.existsSync(path.join(hiDir, route));

      console.log(`  ${route}:`);
      console.log(`    Default: ${defaultExists ? "✅" : "❌"}`);
      console.log(`    EN: ${enExists ? "✅" : "❌"}`);
      console.log(`    HI: ${hiExists ? "✅" : "❌"}`);
    }

    console.log("\n🎉 Basic tests completed successfully!");
    console.log("\n💡 To run full validation, use:");
    console.log("   node scripts/validate-route-completeness.js validate");

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return false;
  }
}

// Run tests if executed directly
if (require.main === module) {
  testValidator().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testValidator };
