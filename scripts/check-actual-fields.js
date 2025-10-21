/**
 * Check actual fields available in Airtable tables
 * This script fetches data without specifying fields to see what's actually available
 */

const BASE_URL = "http://localhost:3000";

async function fetchWithoutFields(endpoint) {
  try {
    // Fetch without specifying fields to get all available fields
    const response = await fetch(
      `${BASE_URL}/api/airtable/${endpoint}?pageSize=1`
    );
    const data = await response.json();

    console.log(
      `\n📊 ${endpoint.toUpperCase()} Response:`,
      JSON.stringify(data, null, 2)
    );

    if (data.data?.records?.[0]?.fields) {
      return data.data.records[0].fields;
    } else if (data.records?.[0]?.fields) {
      return data.records[0].fields;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error.message);
    return null;
  }
}

async function checkAllFields() {
  console.log("🔍 CHECKING ACTUAL AIRTABLE FIELDS");
  console.log("==================================");

  const endpoints = ["rubai", "ebooks"];

  for (const endpoint of endpoints) {
    console.log(`\n📋 ${endpoint.toUpperCase()}:`);

    const fields = await fetchWithoutFields(endpoint);

    if (fields) {
      const fieldNames = Object.keys(fields).sort();
      console.log(`Available fields: ${fieldNames.join(", ")}`);

      // Show sample values
      console.log("Sample data:");
      Object.entries(fields).forEach(([key, value]) => {
        if (typeof value === "string" && value.length > 0) {
          console.log(
            `  ${key}: "${value.substring(0, 50)}${
              value.length > 50 ? "..." : ""
            }"`
          );
        } else if (value !== null && value !== undefined) {
          console.log(`  ${key}: ${JSON.stringify(value)}`);
        }
      });
    } else {
      console.log("No data available");
    }
  }
}

checkAllFields().catch(console.error);
