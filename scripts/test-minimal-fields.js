/**
 * Test minimal field sets to identify valid fields
 */

const BASE_URL = "http://localhost:3000";

async function testFields(endpoint, fields) {
  try {
    const fieldsParam = fields.join(",");
    const response = await fetch(
      `${BASE_URL}/api/airtable/${endpoint}?fields=${fieldsParam}&pageSize=1`
    );
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data: data,
      fields: fields,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      fields: fields,
    };
  }
}

async function findValidFields() {
  console.log("🔍 TESTING MINIMAL FIELD SETS");
  console.log("=============================");

  // Test basic fields for RUBAI
  console.log("\n📋 RUBAI - Testing basic fields:");

  const rubaiBasicFields = ["id", "shaer", "body", "unwan"];
  const rubaiResult = await testFields("rubai", rubaiBasicFields);
  console.log(
    `Basic fields (${rubaiBasicFields.join(", ")}): ${
      rubaiResult.success ? "✅ SUCCESS" : "❌ FAILED"
    }`
  );
  if (!rubaiResult.success) {
    console.log(`Error: ${rubaiResult.data?.message || "Unknown error"}`);
  }

  // Test English fields for RUBAI
  const rubaiEnglishFields = ["enShaer", "enBody"];
  const rubaiEnResult = await testFields("rubai", rubaiEnglishFields);
  console.log(
    `English fields (${rubaiEnglishFields.join(", ")}): ${
      rubaiEnResult.success ? "✅ SUCCESS" : "❌ FAILED"
    }`
  );
  if (!rubaiEnResult.success) {
    console.log(`Error: ${rubaiEnResult.data?.message || "Unknown error"}`);
  }

  // Test basic fields for EBOOKS
  console.log("\n📋 EBOOKS - Testing basic fields:");

  const ebooksBasicFields = ["id", "bookName", "writer"];
  const ebooksResult = await testFields("ebooks", ebooksBasicFields);
  console.log(
    `Basic fields (${ebooksBasicFields.join(", ")}): ${
      ebooksResult.success ? "✅ SUCCESS" : "❌ FAILED"
    }`
  );
  if (!ebooksResult.success) {
    console.log(`Error: ${ebooksResult.data?.message || "Unknown error"}`);
  }

  // Test problematic fields individually
  console.log("\n🔍 Testing problematic fields individually:");

  const problematicFields = [
    { endpoint: "rubai", field: "enUnwan" },
    { endpoint: "ebooks", field: "doc" },
    { endpoint: "ebooks", field: "mahmood" },
    { endpoint: "ebooks", field: "ePDFs" },
  ];

  for (const test of problematicFields) {
    const result = await testFields(test.endpoint, [test.field]);
    console.log(
      `${test.endpoint}/${test.field}: ${
        result.success ? "✅ EXISTS" : "❌ MISSING"
      }`
    );
    if (!result.success && result.data?.message) {
      console.log(`  Error: ${result.data.message}`);
    }
  }
}

findValidFields().catch(console.error);
