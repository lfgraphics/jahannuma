# Implementation Plan

- [x] 1. Set up environment-aware URL building infrastructure

  - Create URL builder utility that detects server vs client environment
  - Implement base URL detection for different deployment environments
  - Add proper TypeScript interfaces for URL configuration
  - _Requirements: 2.1, 2.3, 2.4_

- [x] 2. Implement server-side data fetching foundation

  - [x] 2.1 Create direct Airtable API client for server-side use

    - Implement server-only Airtable client with proper authentication
    - Add error handling for API failures during build time
    - Implement request timeout and retry logic
    - _Requirements: 1.1, 1.2, 5.1, 5.3_

  - [x] 2.2 Build universal data fetcher interface

    - Create unified interface that works in both server and client contexts
    - Implement environment detection and routing logic
    - Add caching strategies for different environments
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 2.3 Add build-time safe fallback mechanisms

    - Implement graceful fallbacks when APIs are unavailable during build
    - Create cached data fallback system
    - Add comprehensive error logging for debugging
    - _Requirements: 5.1, 5.2, 5.4_

- [x] 3. Update Ashaar data fetching implementation

  - [x] 3.1 Convert Ashaar pages to use server-side data fetching

    - Update Ashaar list pages to fetch data during SSR
    - Implement proper error boundaries for failed data fetching
    - Add SEO meta tags based on fetched data
    - _Requirements: 1.1, 1.3, 3.1_

  - [x] 3.2 Create client-side Ashaar hooks with new infrastructure

    - Update useAirtableList hook for Ashaar to use absolute URLs
    - Implement hydration bridge for seamless server-to-client transition
    - Add optimistic updates for client-side interactions
    - _Requirements: 2.1, 2.2, 3.1_

  - [ ]\* 3.3 Write unit tests for Ashaar data fetching
    - Test server-side data fetching with various API states
    - Test client-side hook behavior and error handling
    - Test hydration consistency between server and client
    - _Requirements: 1.1, 2.1, 3.1_

- [x] 4. Update Ghazlen data fetching implementation

  - [x] 4.1 Convert Ghazlen pages to use server-side data fetching

    - Update Ghazlen list and detail pages for SSR data fetching
    - Implement proper SEO optimization with meta tags
    - Add structured data for better search engine understanding
    - _Requirements: 1.1, 1.3, 3.1_

  - [x] 4.2 Update client-side Ghazlen hooks

    - Migrate Ghazlen hooks to new URL building infrastructure
    - Implement proper error handling and fallbacks
    - Add loading states and error boundaries
    - _Requirements: 2.1, 2.2, 4.2_

  - [ ]\* 4.3 Write unit tests for Ghazlen data fetching
    - Test server-side rendering with Ghazlen data
    - Test client-side interactions and state management
    - _Requirements: 1.1, 2.1_

- [x] 5. Update Nazmen data fetching implementation

  - [x] 5.1 Convert Nazmen pages to use server-side data fetching

    - Update Nazmen components for SSR compatibility
    - Implement SEO-friendly URLs and meta tags
    - Add proper error handling for build-time failures
    - _Requirements: 1.1, 1.3, 3.1_

  - [x] 5.2 Update client-side Nazmen hooks

    - Migrate to new data fetching infrastructure
    - Implement proper caching and revalidation strategies
    - _Requirements: 2.1, 2.2, 3.3_

  - [ ]\* 5.3 Write unit tests for Nazmen data fetching
    - Test SSR data fetching and error scenarios
    - Test client-side hook behavior
    - _Requirements: 1.1, 2.1_

- [ ] 6. Update Rubai data fetching implementation

  - [x] 6.1 Convert Rubai pages to use server-side data fetching

    - Update Rubai list and detail pages for SSR
    - Implement proper SEO meta tags and structured data
    - Add error boundaries and fallback UI
    - _Requirements: 1.1, 1.3, 3.1_

  - [x] 6.2 Update client-side Rubai hooks

    - Migrate Rubai hooks to new infrastructure
    - Implement optimistic updates for user interactions
    - _Requirements: 2.1, 2.2_

  - [ ]\* 6.3 Write unit tests for Rubai data fetching
    - Test server-side data fetching reliability
    - Test client-side state management
    - _Requirements: 1.1, 2.1_

- [ ] 7. Update Ebooks data fetching implementation

  - [ ] 7.1 Convert Ebooks pages to use server-side data fetching

    - Update Ebooks components for SSR compatibility
    - Implement proper SEO optimization for ebook listings
    - Add download tracking with proper error handling

    - _Requirements: 1.1, 1.3, 3.1_

  - [ ] 7.2 Update client-side Ebooks hooks

    - Migrate to new data fetching infrastructure

    - Implement proper error handling for download failures
    - _Requirements: 2.1, 2.2_

  - [ ]\* 7.3 Write unit tests for Ebooks data fetching
    - Test SSR behavior with ebook data
    - Test download functionality and error handling
    - _Requirements: 1.1, 2.1_

- [ ] 8. Update shared components and utilities

  - [x] 8.1 Update common data fetching utilities

    - Migrate shared hooks and utilities to new infrastructure
    - Update error handling components to work with new error types
    - Implement consistent loading states across the application

    - _Requirements: 4.1, 4.3, 4.4_

  - [ ] 8.2 Update API route handlers

    - Ensure API routes work properly with new client-side fetching
    - Implement proper error responses and status codes
    - Add request validation and sanitization
    - _Requirements: 2.1, 2.4, 4.2_

  - [ ] 8.3 Update global error handling and logging
    - Implement comprehensive error logging for both server and client
    - Add error reporting for build-time failures
    - Create debugging utilities for data fetching issues
    - _Requirements: 4.2, 4.3, 5.4_

- [ ] 9. Implement comprehensive SEO optimizations

  - [ ] 9.1 Add dynamic meta tags based on fetched data

    - Generate page titles, descriptions, and keywords from content

    - Implement Open Graph and Twitter Card meta tags

    - Add canonical URLs and proper hreflang attributes
    - _Requirements: 1.3, 3.1_

  - [ ] 9.2 Implement structured data markup

    - Add JSON-LD structured data for poems, books, and authors
    - Implement breadcrumb structured data
    - Add organization and website structured data

    - _Requirements: 1.3_

  - [ ] 9.3 Optimize page loading and Core Web Vitals
    - Implement proper image optimization and lazy loading
    - Add preloading for critical resources
    - Optimize font loading and reduce layout shift
    - _Requirements: 1.1, 3.3_

- [ ] 10. Build testing and validation

  - [ ] 10.1 Test build process with various API states

    - Test successful builds with working Airtable API
    - Test builds when Airtable API is unavailable
    - Test builds with partial API failures
    - Verify fallback mechanisms work during build time
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 10.2 Validate SEO implementation

    - Test meta tag generation with real data
    - Validate structured data markup with Google's tools
    - Test page rendering in search engine crawlers
    - Verify Core Web Vitals scores meet targets
    - _Requirements: 1.3, 3.1_

  - [ ] 10.3 Fix any remaining build errors

    - Identify and resolve any remaining URL parsing errors
    - Fix hydration mismatches between server and client
    - Resolve any TypeScript errors introduced by changes
    - Ensure all pages build successfully in production mode
    - _Requirements: 1.1, 1.2, 2.1_

  - [ ]\* 10.4 Write integration tests for build process
    - Create automated tests for build success scenarios
    - Test error handling during build failures
    - Validate SEO output in automated tests
    - _Requirements: 5.1, 5.2_

- [x] 11. Performance optimization and monitoring

  - [x] 11.1 Implement caching strategies

    - Add appropriate caching headers for API responses
    - Implement client-side cache management
    - Add cache invalidation strategies
    - _Requirements: 3.3, 5.1_

  - [x] 11.2 Add performance monitoring

    - Implement logging for data fetching performance
    - Add monitoring for build time duration
    - Create alerts for API failure rates
    - _Requirements: 4.3, 5.4_

  - [ ] 11.3 Optimize bundle size and loading
    - Remove unused dependencies and code
    - Implement proper code splitting for data fetching utilities
    - Optimize import statements and tree shaking
    - _Requirements: 1.1, 3.3_
