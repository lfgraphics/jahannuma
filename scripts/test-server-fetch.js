/**
 * Test script to verify server-side data fetching
 */

const { fetchList } = require('../lib/universal-data-fetcher');

async function testServerFetch() {
  console.log('🧪 Testing server-side data fetching...');
  
  try {
    console.log('Environment check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- AIRTABLE_API_KEY:', process.env.AIRTABLE_API_KEY ? 'Set' : 'Not set');
    console.log('- NEXT_PUBLIC_Api_Token:', process.env.NEXT_PUBLIC_Api_Token ? 'Set' : 'Not set');
    
    console.log('\nTesting Ashaar data fetch...');
    const ashaarData = await fetchList(
      "appeI2xzzyvUN5bR7", // Ashaar base ID
      "Ashaar",
      { pageSize: 5 },
      { 
        cache: false,
        fallback: null,
        throwOnError: true,
        debug: true
      }
    );
    
    console.log('✅ Ashaar data fetched successfully:');
    console.log('- Records count:', ashaarData?.records?.length || 0);
    console.log('- Has offset:', !!ashaarData?.offset);
    console.log('- Sample record:', ashaarData?.records?.[0] ? 'Present' : 'None');
    
  } catch (error) {
    console.error('❌ Server-side fetch failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
}

// Run the test
testServerFetch().catch(console.error);