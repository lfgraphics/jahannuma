/**
 * Airtable Field Diagnostic Script
 * Fetches raw data from each endpoint to see actual field structure
 */

const BASE_URL = "http://localhost:3000";

async function fetchRawData(endpoint) {
  try {
    const response = await fetch(
      `${BASE_URL}/api/airtable/${endpoint}?maxRecords=1`
    );
    const data = await response.json();

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

async function diagnoseAllEndpoints() {
  console.log("🔍 AIRTABLE FIELD DIAGNOSTIC REPORT");
  console.log("===================================\n");

  const endpoints = ["ashaar", "ghazlen", "nazmen", "rubai", "shaer", "ebooks"];

  for (const endpoint of endpoints) {
    console.log(`📊 ${endpoint.toUpperCase()} - Available Fields:`);

    const fields = await fetchRawData(endpoint);

    if (fields) {
      const fieldNames = Object.keys(fields).sort();

      // Categorize fields
      const urduFields = fieldNames.filter(
        (f) => !f.startsWith("en") && !f.startsWith("hi")
      );
      const englishFields = fieldNames.filter((f) => f.startsWith("en"));
      const hindiFields = fieldNames.filter((f) => f.startsWith("hi"));

      console.log(
        `   📝 Urdu/Base fields (${urduFields.length}): ${urduFields.join(
          ", "
        )}`
      );
      console.log(
        `   🇬🇧 English fields (${englishFields.length}): ${englishFields.join(
          ", "
        )}`
      );
      console.log(
        `   🇮🇳 Hindi fields (${hindiFields.length}): ${hindiFields.join(", ")}`
      );

      // Show sample values for key fields
      const sampleData = {};
      ["name", "shaer", "bookName", "takhallus"].forEach((key) => {
        if (fields[key]) sampleData[key] = fields[key];
      });

      if (Object.keys(sampleData).length > 0) {
        console.log(
          `   📋 Sample data: ${JSON.stringify(sampleData, null, 2).replace(
            /\n/g,
            " "
          )}`
        );
      }
    } else {
      console.log(`   ❌ No data available or API error`);
    }

    console.log("");
  }
}

diagnoseAllEndpoints().catch(console.error);
