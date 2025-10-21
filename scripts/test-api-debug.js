/**
 * Debug script to test API endpoints and capture detailed error information
 */

const BASE_URL = "http://localhost:3000";

async function testEndpointWithDetails(endpoint) {
  const url = `${BASE_URL}/api/airtable/${endpoint}?maxRecords=3`;

  console.log(`\n🔍 Testing: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "API-Debug-Test/1.0",
      },
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log(`Response body:`, text.substring(0, 500));

    if (response.headers.get("content-type")?.includes("application/json")) {
      try {
        const data = JSON.parse(text);
        console.log(`Parsed JSON:`, JSON.stringify(data, null, 2));
      } catch (e) {
        console.log(`Failed to parse JSON:`, e.message);
      }
    }
  } catch (error) {
    console.log(`Network error:`, error.message);
  }
}

async function runDebugTests() {
  console.log("🔧 API Debug Tests");
  console.log("==================");

  // Test a few key endpoints
  await testEndpointWithDetails("ashaar");
  await testEndpointWithDetails("ghazlen");
  await testEndpointWithDetails("ebooks");
}

runDebugTests().catch(console.error);
