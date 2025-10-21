/**
 * Test Rubai API specifically to debug why no data is returned
 */

const BASE_URL = "http://localhost:3000";

async function testRubaiAPI() {
  console.log("🔍 DEBUGGING RUBAI API");
  console.log("======================");

  // Test 1: Basic API call without any parameters
  console.log("\n1️⃣ Testing basic API call:");
  try {
    const response = await fetch(`${BASE_URL}/api/airtable/rubai`);
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${response.ok}`);
    console.log(`Data:`, JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }

  // Test 2: With minimal fields
  console.log("\n2️⃣ Testing with minimal fields:");
  try {
    const response = await fetch(
      `${BASE_URL}/api/airtable/rubai?fields=id,shaer,body`
    );
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${response.ok}`);
    console.log(`Data:`, JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }

  // Test 3: With pageSize parameter
  console.log("\n3️⃣ Testing with pageSize=100:");
  try {
    const response = await fetch(`${BASE_URL}/api/airtable/rubai?pageSize=100`);
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${response.ok}`);
    console.log(
      `Records count: ${
        data.data?.records?.length || data.records?.length || 0
      }`
    );
    if (data.data?.records?.length > 0 || data.records?.length > 0) {
      const records = data.data?.records || data.records;
      console.log(`First record:`, JSON.stringify(records[0], null, 2));
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }

  // Test 4: Without any field filtering
  console.log("\n4️⃣ Testing without field filtering:");
  try {
    const response = await fetch(
      `${BASE_URL}/api/airtable/rubai?pageSize=10&fields=`
    );
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${response.ok}`);
    console.log(
      `Records count: ${
        data.data?.records?.length || data.records?.length || 0
      }`
    );
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

testRubaiAPI().catch(console.error);
