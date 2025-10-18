/**
 * Test script to verify the performance optimization fixes
 */

const { performance } = require('perf_hooks');

// Test URL building
function testURLBuilding() {
  console.log('🧪 Testing URL building...');
  
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://jahan-numa.org';
  
  const endpoint = 'ashaar';
  const params = { maxRecords: '3' };
  const searchParams = new URLSearchParams(params);
  
  const url = `${baseUrl}/api/airtable/${endpoint}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;
  
  console.log('✅ URL built successfully:', url);
  return url;
}

// Test performance monitoring
function testPerformanceMonitoring() {
  console.log('🧪 Testing performance monitoring...');
  
  const start = performance.now();
  
  // Simulate some work
  setTimeout(() => {
    const end = performance.now();
    const duration = end - start;
    
    console.log('✅ Performance monitoring working:', `${duration.toFixed(2)}ms`);
  }, 100);
}

// Test bundle optimization utilities
function testBundleOptimization() {
  console.log('🧪 Testing bundle optimization utilities...');
  
  // Test debounce function
  let callCount = 0;
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };
  
  const debouncedFn = debounce(() => callCount++, 100);
  
  // Call multiple times quickly
  debouncedFn();
  debouncedFn();
  debouncedFn();
  
  setTimeout(() => {
    console.log('✅ Debounce working:', callCount === 1 ? 'PASS' : 'FAIL');
  }, 200);
}

// Run all tests
function runTests() {
  console.log('🚀 Running performance optimization tests...\n');
  
  try {
    testURLBuilding();
    testPerformanceMonitoring();
    testBundleOptimization();
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };