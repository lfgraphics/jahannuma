/**
 * Test specific missing fields to see if they actually exist
 */

const BASE_URL = "http://localhost:3000";

async function testSpecificFields() {
  console.log("🔍 TESTING SPECIFIC MISSING FIELDS");
  console.log("==================================");

  const tests = [
    { endpoint: 'ghazlen', field: 'enGhazalHead', description: 'Ghazlen - enGhazalHead' },
    { endpoint: 'ghazlen', field: 'hiGhazalHead', description: 'Ghazlen - hiGhazalHead' },
    { endpoint: 'nazmen', field: 'displayLine', description: 'Nazmen - displayLine' },
    { endpoint: 'nazmen', field: 'enDisplayLine', description: 'Nazmen - enDisplayLine' },
    { endpoint: 'nazmen', field: 'hiDisplayLine', description: 'Nazmen - hiDisplayLine' },
    { endpoint: 'ebooks', field: 'maloomat', description: 'E-Books - maloomat' },
    { endpoint: 'ebooks', field: 'enMaloomat', description: 'E-Books - enMaloomat' },
    { endpoint: 'ebooks', field: 'hiMaloomat', description: 'E-Books - hiMaloomat' },
  ];

  for (const test of tests) {
    try {
      const response = await fetch(`${BASE_URL}/api/airtable/${test.endpoint}?fields=${test.field}&pageSize=5`);
      const data = await response.json();
      
      const recordCount = data.data?.records?.length || data.records?.length || 0;
      const status = response.ok && recordCount > 0 ? '✅ EXISTS' : '❌ MISSING';
      
      console.log(`${test.description}: ${status}`);
      
      if (!response.ok) {
        console.log(`  Error: ${data.message || 'Unknown error'}`);
      } else if (recordCount > 0) {
        const records = data.data?.records || data.records;
        const sampleField = records[0]?.fields?.[test.field];
        console.log(`  Sample value: ${sampleField || 'null/empty'}`);
      }
      
    } catch (error) {
      console.log(`${test.description}: ❌ ERROR - ${error.message}`);
    }
  }
}

testSpecificFields().catch(console.error);