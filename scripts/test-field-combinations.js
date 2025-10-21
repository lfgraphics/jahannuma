/**
 * Test different field combinations to identify problematic fields
 */

const BASE_URL = "http://localhost:3000";

async function testFieldCombination(endpoint, fields, description) {
  try {
    const fieldsParam = fields.join(",");
    const response = await fetch(
      `${BASE_URL}/api/airtable/${endpoint}?fields=${fieldsParam}&pageSize=1`
    );
    const data = await response.json();

    console.log(`${description}: ${response.ok ? "✅ SUCCESS" : "❌ FAILED"}`);
    if (!response.ok) {
      console.log(`  Error: ${data.message || "Unknown error"}`);
      console.log(`  Fields tested: ${fields.join(", ")}`);
    }

    return response.ok;
  } catch (error) {
    console.log(`${description}: ❌ ERROR - ${error.message}`);
    return false;
  }
}

async function testRubaiFields() {
  console.log("\n🔍 TESTING RUBAI FIELDS:");

  // Test base fields
  await testFieldCombination(
    "rubai",
    ["shaer", "body", "unwan", "likes", "id"],
    "Base fields (core)"
  );
  await testFieldCombination(
    "rubai",
    ["comments", "shares"],
    "Base fields (optional)"
  );

  // Test English fields individually
  await testFieldCombination("rubai", ["enShaer"], "English: enShaer");
  await testFieldCombination("rubai", ["enBody"], "English: enBody");
  await testFieldCombination("rubai", ["enUnwan"], "English: enUnwan");

  // Test Hindi fields individually
  await testFieldCombination("rubai", ["hiShaer"], "Hindi: hiShaer");
  await testFieldCombination("rubai", ["hiBody"], "Hindi: hiBody");
  await testFieldCombination("rubai", ["hiUnwan"], "Hindi: hiUnwan");

  // Test all English together
  await testFieldCombination(
    "rubai",
    ["enShaer", "enBody", "enUnwan"],
    "All English fields"
  );

  // Test all Hindi together
  await testFieldCombination(
    "rubai",
    ["hiShaer", "hiBody", "hiUnwan"],
    "All Hindi fields"
  );
}

async function testEbooksFields() {
  console.log("\n🔍 TESTING EBOOKS FIELDS:");

  // Test core fields
  await testFieldCombination(
    "ebooks",
    ["bookName", "writer", "id"],
    "Core fields"
  );

  // Test problematic fields individually
  await testFieldCombination("ebooks", ["doc"], "Field: doc");
  await testFieldCombination("ebooks", ["mahmood"], "Field: mahmood");
  await testFieldCombination("ebooks", ["ePDFs"], "Field: ePDFs");
  await testFieldCombination("ebooks", ["MPDX"], "Field: MPDX");
  await testFieldCombination("ebooks", ["book"], "Field: book");
  await testFieldCombination("ebooks", ["download"], "Field: download");
  await testFieldCombination("ebooks", ["files"], "Field: files");
  await testFieldCombination(
    "ebooks",
    ["publishingDate"],
    "Field: publishingDate"
  );

  // Test English fields
  await testFieldCombination("ebooks", ["enBookName"], "English: enBookName");
  await testFieldCombination("ebooks", ["enWriter"], "English: enWriter");
  await testFieldCombination("ebooks", ["enMahmood"], "English: enMahmood");

  // Test Hindi fields
  await testFieldCombination("ebooks", ["hiBookName"], "Hindi: hiBookName");
  await testFieldCombination("ebooks", ["hiWriter"], "Hindi: hiWriter");
  await testFieldCombination("ebooks", ["hiMahmood"], "Hindi: hiMahmood");

  // Test all base fields together
  await testFieldCombination(
    "ebooks",
    ["bookName", "writer", "publishingDate", "mahmood", "id"],
    "Safe base fields"
  );
}

async function runFieldTests() {
  console.log("🔍 FIELD COMBINATION TESTING");
  console.log("============================");

  await testRubaiFields();
  await testEbooksFields();
}

runFieldTests().catch(console.error);
