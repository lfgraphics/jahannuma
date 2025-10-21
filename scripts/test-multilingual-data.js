/**
 * Multilingual Data Validation Test
 * Tests all APIs to ensure they return correct language data (Urdu, English, Hindi)
 * Validates field mappings match actual Airtable schema
 */

const BASE_URL = "http://localhost:3000";

// Expected field structure based on actual Airtable schema screenshots
const EXPECTED_FIELDS = {
  ashaar: {
    base: [
      "shaer",
      "sher",
      "body",
      "unwan",
      "likes",
      "comments",
      "shares",
      "id",
    ],
    english: ["enShaer", "enSher", "enBody", "enUnwan"],
    hindi: ["hiShaer", "hiSher", "hiBody", "hiUnwan"],
  },
  ghazlen: {
    base: [
      "shaer",
      "ghazalHead",
      "ghazal",
      "unwan",
      "likes",
      "comments",
      "shares",
      "id",
    ],
    english: ["enShaer", "enGhazalHead", "enGhazal", "enUnwan"],
    hindi: ["hiShaer", "hiGhazalHead", "hiGhazal", "hiUnwan"],
  },
  nazmen: {
    base: [
      "shaer",
      "nazm",
      "unwan",
      "paband",
      "displayLine",
      "likes",
      "comments",
      "shares",
      "id",
    ],
    english: ["enShaer", "enNazm", "enUnwan", "enDisplayLine"],
    hindi: ["hiShaer", "hiNazm", "hiUnwan", "hiDisplayLine"],
  },
  rubai: {
    base: ["shaer", "body", "unwan", "likes", "comments", "shares", "id"],
    english: ["enShaer", "enBody"],
    hindi: ["hiShaer", "hiBody"],
  },
  shaer: {
    base: ["takhallus", "name", "location", "tafseel", "photo", "likes", "id"],
    english: ["enTakhallus", "enName", "enLocation", "enTafseel"],
    hindi: ["hiTakhallus", "hiName", "hiLocation", "hiTafseel"],
  },
  ebooks: {
    base: [
      "bookName",
      "writer",
      "publishingDate",
      "maloomat",
      "book",
      "download",
      "likes",
      "id",
    ],
    english: ["enBookName", "enWriter", "enMaloomat"],
    hindi: ["hiBookName", "hiWriter", "hiMaloomat"],
  },
};

const testResults = {
  endpoints: {},
  fieldCoverage: {},
  languageSupport: {},
  totalTests: 0,
  passed: 0,
  failed: 0,
};

/**
 * Fetch data from API endpoint
 */
async function fetchApiData(endpoint, params = {}) {
  const searchParams = new URLSearchParams(params);
  const url = `${BASE_URL}/api/airtable/${endpoint}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data: data,
      url,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url,
    };
  }
}

/**
 * Analyze field coverage in API response
 */
function analyzeFieldCoverage(contentType, records) {
  if (!records || records.length === 0) {
    return {
      hasData: false,
      fieldCoverage: { base: 0, english: 0, hindi: 0 },
      missingFields: { base: [], english: [], hindi: [] },
      presentFields: { base: [], english: [], hindi: [] },
    };
  }

  const sampleRecord = records[0];
  const fields = sampleRecord.fields || {};
  const expectedFields = EXPECTED_FIELDS[contentType];

  if (!expectedFields) {
    console.error(
      `No expected fields defined for content type: ${contentType}`
    );
    return {
      hasData: false,
      fieldCoverage: { base: 0, english: 0, hindi: 0 },
      missingFields: { base: [], english: [], hindi: [] },
      presentFields: { base: [], english: [], hindi: [] },
    };
  }

  const analysis = {
    hasData: true,
    fieldCoverage: { base: 0, english: 0, hindi: 0 },
    missingFields: { base: [], english: [], hindi: [] },
    presentFields: { base: [], english: [], hindi: [] },
  };

  // Check base fields
  expectedFields.base.forEach((field) => {
    if (fields.hasOwnProperty(field)) {
      analysis.presentFields.base.push(field);
      analysis.fieldCoverage.base++;
    } else {
      analysis.missingFields.base.push(field);
    }
  });

  // Check English fields
  expectedFields.english.forEach((field) => {
    if (fields.hasOwnProperty(field)) {
      analysis.presentFields.english.push(field);
      analysis.fieldCoverage.english++;
    } else {
      analysis.missingFields.english.push(field);
    }
  });

  // Check Hindi fields
  expectedFields.hindi.forEach((field) => {
    if (fields.hasOwnProperty(field)) {
      analysis.presentFields.hindi.push(field);
      analysis.fieldCoverage.hindi++;
    } else {
      analysis.missingFields.hindi.push(field);
    }
  });

  // Calculate coverage percentages
  analysis.fieldCoverage.base =
    expectedFields.base.length > 0
      ? (analysis.presentFields.base.length / expectedFields.base.length) * 100
      : 100;
  analysis.fieldCoverage.english =
    expectedFields.english.length > 0
      ? (analysis.presentFields.english.length /
          expectedFields.english.length) *
        100
      : 100;
  analysis.fieldCoverage.hindi =
    expectedFields.hindi.length > 0
      ? (analysis.presentFields.hindi.length / expectedFields.hindi.length) *
        100
      : 100;

  return analysis;
}

/**
 * Test multilingual data for a specific endpoint
 */
async function testMultilingualEndpoint(contentType) {
  console.log(`\n🌐 Testing ${contentType.toUpperCase()} multilingual data...`);
  testResults.totalTests++;

  try {
    const result = await fetchApiData(contentType, { maxRecords: "5" });

    if (!result.success) {
      console.log(`❌ ${contentType}: API call failed (${result.status})`);
      testResults.failed++;
      testResults.endpoints[contentType] = {
        status: "failed",
        error: result.error,
      };
      return;
    }

    const records = result.data?.data?.records || result.data?.records || [];
    const analysis = analyzeFieldCoverage(contentType, records);

    testResults.endpoints[contentType] = {
      status: "success",
      recordCount: records.length,
      analysis,
    };

    if (!analysis.hasData) {
      console.log(`⚠️  ${contentType}: No data returned`);
      testResults.passed++; // Still counts as success if API works
      return;
    }

    // Report field coverage
    console.log(`📊 ${contentType} Field Coverage:`);
    const expectedFields = EXPECTED_FIELDS[contentType];
    if (!expectedFields) {
      console.log(`   ❌ No expected fields defined for ${contentType}`);
      return;
    }

    console.log(
      `   Base fields: ${analysis.fieldCoverage.base.toFixed(1)}% (${
        analysis.presentFields.base.length
      }/${expectedFields.base.length})`
    );
    console.log(
      `   English fields: ${analysis.fieldCoverage.english.toFixed(1)}% (${
        analysis.presentFields.english.length
      }/${expectedFields.english.length})`
    );
    console.log(
      `   Hindi fields: ${analysis.fieldCoverage.hindi.toFixed(1)}% (${
        analysis.presentFields.hindi.length
      }/${expectedFields.hindi.length})`
    );

    // Show missing fields if any
    if (analysis.missingFields.base.length > 0) {
      console.log(
        `   ❌ Missing base fields: ${analysis.missingFields.base.join(", ")}`
      );
    }
    if (analysis.missingFields.english.length > 0) {
      console.log(
        `   ❌ Missing English fields: ${analysis.missingFields.english.join(
          ", "
        )}`
      );
    }
    if (analysis.missingFields.hindi.length > 0) {
      console.log(
        `   ❌ Missing Hindi fields: ${analysis.missingFields.hindi.join(", ")}`
      );
    }

    // Show sample data
    const sampleFields = records[0]?.fields || {};
    const sampleData = {
      urdu:
        sampleFields.shaer ||
        sampleFields.name ||
        sampleFields.bookName ||
        "N/A",
      english:
        sampleFields.enShaer ||
        sampleFields.enName ||
        sampleFields.enBookName ||
        "N/A",
      hindi:
        sampleFields.hiShaer ||
        sampleFields.hiName ||
        sampleFields.hiBookName ||
        "N/A",
    };

    console.log(
      `   📝 Sample data: UR:"${sampleData.urdu}" | EN:"${sampleData.english}" | HI:"${sampleData.hindi}"`
    );

    // Determine if this endpoint passes multilingual requirements
    // For ashaar, only count base and english since hindi fields don't exist
    const totalFields =
      expectedFields.base.length +
      expectedFields.english.length +
      expectedFields.hindi.length;
    const totalPresent =
      analysis.presentFields.base.length +
      analysis.presentFields.english.length +
      analysis.presentFields.hindi.length;
    const avgCoverage =
      totalFields > 0 ? (totalPresent / totalFields) * 100 : 100;
    if (avgCoverage >= 80) {
      console.log(
        `✅ ${contentType}: Excellent multilingual support (${avgCoverage.toFixed(
          1
        )}%)`
      );
      testResults.passed++;
    } else if (avgCoverage >= 60) {
      console.log(
        `⚠️  ${contentType}: Good multilingual support (${avgCoverage.toFixed(
          1
        )}%) - minor improvements needed`
      );
      testResults.passed++;
    } else {
      console.log(
        `❌ ${contentType}: Poor multilingual support (${avgCoverage.toFixed(
          1
        )}%) - needs fixes`
      );
      testResults.failed++;
    }
  } catch (error) {
    console.log(`❌ ${contentType}: Test failed - ${error.message}`);
    testResults.failed++;
    testResults.endpoints[contentType] = {
      status: "error",
      error: error.message,
    };
  }
}

/**
 * Generate comprehensive multilingual report
 */
function generateMultilingualReport() {
  console.log("\n📋 MULTILINGUAL DATA VALIDATION REPORT");
  console.log("=====================================");

  console.log(
    `📊 Overall: ${testResults.passed}/${testResults.totalTests} endpoints passed`
  );
  console.log(
    `Success Rate: ${(
      (testResults.passed / testResults.totalTests) *
      100
    ).toFixed(1)}%`
  );

  console.log("\n🌐 ENDPOINT ANALYSIS:");
  Object.entries(testResults.endpoints).forEach(([endpoint, result]) => {
    if (result.status === "success" && result.analysis?.hasData) {
      const analysis = result.analysis;
      const avgCoverage =
        (analysis.fieldCoverage.base +
          analysis.fieldCoverage.english +
          analysis.fieldCoverage.hindi) /
        3;
      const statusIcon =
        avgCoverage >= 80 ? "✅" : avgCoverage >= 60 ? "⚠️" : "❌";

      console.log(
        `${statusIcon} ${endpoint.toUpperCase()}: ${avgCoverage.toFixed(
          1
        )}% coverage (${result.recordCount} records)`
      );
      console.log(
        `   Base: ${analysis.fieldCoverage.base.toFixed(
          1
        )}% | EN: ${analysis.fieldCoverage.english.toFixed(
          1
        )}% | HI: ${analysis.fieldCoverage.hindi.toFixed(1)}%`
      );

      if (
        analysis.missingFields.base.length > 0 ||
        analysis.missingFields.english.length > 0 ||
        analysis.missingFields.hindi.length > 0
      ) {
        const allMissing = [
          ...analysis.missingFields.base,
          ...analysis.missingFields.english,
          ...analysis.missingFields.hindi,
        ];
        console.log(`   Missing: ${allMissing.join(", ")}`);
      }
    } else if (result.status === "success") {
      console.log(
        `⚠️  ${endpoint.toUpperCase()}: API works but no data returned`
      );
    } else {
      console.log(`❌ ${endpoint.toUpperCase()}: ${result.error || "Failed"}`);
    }
  });

  console.log("\n🎯 RECOMMENDATIONS:");
  let hasRecommendations = false;

  Object.entries(testResults.endpoints).forEach(([endpoint, result]) => {
    if (result.status === "success" && result.analysis?.hasData) {
      const analysis = result.analysis;
      const avgCoverage =
        (analysis.fieldCoverage.base +
          analysis.fieldCoverage.english +
          analysis.fieldCoverage.hindi) /
        3;

      if (avgCoverage < 80) {
        hasRecommendations = true;
        console.log(`🔧 ${endpoint.toUpperCase()}:`);

        if (analysis.missingFields.base.length > 0) {
          console.log(
            `   - Add base fields: ${analysis.missingFields.base.join(", ")}`
          );
        }
        if (analysis.missingFields.english.length > 0) {
          console.log(
            `   - Add English fields: ${analysis.missingFields.english.join(
              ", "
            )}`
          );
        }
        if (analysis.missingFields.hindi.length > 0) {
          console.log(
            `   - Add Hindi fields: ${analysis.missingFields.hindi.join(", ")}`
          );
        }
      }
    }
  });

  if (!hasRecommendations) {
    console.log("🎉 All endpoints have excellent multilingual support!");
  }

  return testResults.failed === 0;
}

/**
 * Main test runner for multilingual data validation
 */
async function runMultilingualTests() {
  console.log("🌐 Starting Multilingual Data Validation Tests");
  console.log("==============================================");
  console.log(`Base URL: ${BASE_URL}\n`);

  // Test all content endpoints
  const contentTypes = [
    "ashaar",
    "ghazlen",
    "nazmen",
    "rubai",
    "shaer",
    "ebooks",
  ];

  for (const contentType of contentTypes) {
    await testMultilingualEndpoint(contentType);
  }

  // Generate comprehensive report
  const allTestsPassed = generateMultilingualReport();

  if (allTestsPassed) {
    console.log("\n🎉 All multilingual data tests passed!");
    process.exit(0);
  } else {
    console.log(
      "\n💥 Some multilingual data issues found. Check recommendations above."
    );
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runMultilingualTests().catch((error) => {
    console.error("💥 Multilingual test runner failed:", error);
    process.exit(1);
  });
}

module.exports = {
  runMultilingualTests,
  testMultilingualEndpoint,
  analyzeFieldCoverage,
};
