/**
 * Test Rubai API with different parameters to see what's happening
 */

const BASE_URL = "http://localhost:3000";

async function testRubaiVariations() {
  console.log("🔍 TESTING RUBAI API VARIATIONS");
  console.log("===============================");

  const testCases = [
    { name: "No parameters", url: `${BASE_URL}/api/airtable/rubai` },
    { name: "PageSize 1", url: `${BASE_URL}/api/airtable/rubai?pageSize=1` },
    { name: "PageSize 10", url: `${BASE_URL}/api/airtable/rubai?pageSize=10` },
    { name: "PageSize 20", url: `${BASE_URL}/api/airtable/rubai?pageSize=20` },
    {
      name: "No fields filter",
      url: `${BASE_URL}/api/airtable/rubai?pageSize=5&fields=`,
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log(`🔗 URL: ${testCase.url}`);

    try {
      const response = await fetch(testCase.url);
      const data = await response.json();

      console.log(`   Status: ${response.status}`);
      console.log(`   Success: ${data.success}`);

      const records = data.data?.records || data.records || [];
      console.log(`   Records: ${records.length}`);

      if (records.length > 0) {
        console.log(`   First record ID: ${records[0].id}`);
        console.log(
          `   First record fields: ${Object.keys(records[0].fields).join(", ")}`
        );
        console.log(
          `   Sample data: ${JSON.stringify(records[0].fields, null, 2)}`
        );
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

testRubaiVariations().catch(console.error);
