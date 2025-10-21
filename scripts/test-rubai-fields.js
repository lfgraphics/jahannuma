/**
 * Test Rubai fields individually to find the problematic field
 */

const BASE_URL = "http://localhost:3000";

async function testField(fields, description) {
  try {
    const fieldsParam = Array.isArray(fields) ? fields.join(",") : fields;
    const response = await fetch(
      `${BASE_URL}/api/airtable/rubai?fields=${fieldsParam}&pageSize=5`
    );
    const data = await response.json();

    const recordCount = data.data?.records?.length || data.records?.length || 0;
    console.log(
      `${description}: ${response.ok ? "✅" : "❌"} (${recordCount} records)`
    );

    if (!response.ok) {
      console.log(`  Error: ${data.message || "Unknown error"}`);
    }

    return response.ok && recordCount > 0;
  } catch (error) {
    console.log(`${description}: ❌ ERROR - ${error.message}`);
    return false;
  }
}

async function testRubaiFields() {
  console.log("🔍 TESTING RUBAI FIELDS INDIVIDUALLY");
  console.log("====================================");

  // Test base fields individually
  console.log("\n📋 Base Fields:");
  await testField(["shaer"], "shaer");
  await testField(["body"], "body");
  await testField(["unwan"], "unwan");
  await testField(["likes"], "likes");
  await testField(["comments"], "comments");
  await testField(["shares"], "shares");
  await testField(["id"], "id");

  // Test English fields individually
  console.log("\n🇬🇧 English Fields:");
  await testField(["enShaer"], "enShaer");
  await testField(["enBody"], "enBody");
  await testField(["enUnwan"], "enUnwan");

  // Test Hindi fields individually
  console.log("\n🇮🇳 Hindi Fields:");
  await testField(["hiShaer"], "hiShaer");
  await testField(["hiBody"], "hiBody");
  await testField(["hiUnwan"], "hiUnwan");

  // Test combinations
  console.log("\n🔗 Field Combinations:");
  await testField(["shaer", "body", "unwan"], "Base core fields");
  await testField(["shaer", "body", "unwan", "likes"], "Base + likes");
  await testField(
    ["shaer", "body", "unwan", "likes", "comments"],
    "Base + likes + comments"
  );
  await testField(
    ["shaer", "body", "unwan", "likes", "comments", "shares"],
    "All base fields"
  );

  // Test with English fields
  await testField(["shaer", "body", "unwan", "enShaer"], "Base + enShaer");
  await testField(
    ["shaer", "body", "unwan", "enShaer", "enBody"],
    "Base + enShaer + enBody"
  );
  await testField(
    ["shaer", "body", "unwan", "enShaer", "enBody", "enUnwan"],
    "Base + all English"
  );

  // Test the full multilingual set
  console.log("\n🌐 Full Multilingual Set:");
  const fullSet = [
    "shaer",
    "body",
    "unwan",
    "likes",
    "comments",
    "shares",
    "id",
    "enShaer",
    "enBody",
    "enUnwan",
    "hiShaer",
    "hiBody",
    "hiUnwan",
  ];
  await testField(fullSet, "Complete multilingual field set");
}

testRubaiFields().catch(console.error);
