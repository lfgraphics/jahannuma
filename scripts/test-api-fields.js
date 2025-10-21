/**
 * Test what fields the API is actually requesting
 */

const BASE_URL = "http://localhost:3000";

async function testAPIFields() {
  console.log("🔍 TESTING ACTUAL API FIELD REQUESTS");
  console.log("====================================");

  const endpoints = ["nazmen", "ebooks", "ghazlen"];

  for (const endpoint of endpoints) {
    console.log(`\n📋 ${endpoint.toUpperCase()}:`);

    try {
      // Test with default fields (what the API uses)
      const response = await fetch(
        `${BASE_URL}/api/airtable/${endpoint}?pageSize=1`
      );
      const data = await response.json();

      if (data.data?.records?.[0]?.fields) {
        const fields = Object.keys(data.data.records[0].fields).sort();
        console.log(`Available fields: ${fields.join(", ")}`);

        // Check specific fields
        const testFields = {
          nazmen: ["displayLine", "enDisplayLine", "hiDisplayLine"],
          ebooks: ["maloomat", "enMaloomat", "hiMaloomat"],
          ghazlen: ["enGhazalHead", "hiGhazalHead"],
        };

        const fieldsToCheck = testFields[endpoint] || [];
        fieldsToCheck.forEach((field) => {
          const exists = fields.includes(field);
          const value = data.data.records[0].fields[field];
          console.log(
            `  ${field}: ${exists ? "✅" : "❌"} ${
              exists ? `(value: ${value || "null"})` : ""
            }`
          );
        });
      } else {
        console.log("No records returned");
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }
}

testAPIFields().catch(console.error);
