# Route Patterns and Dependencies Documentation

## Overview

This document maps all dynamic route patterns and component dependencies across the Jahannuma application sections, providing a comprehensive guide for implementing missing routes in EN and HI language directories.

## Dynamic Route Patterns

### 1. [slug]/[id] Pattern

**Sections**: E-Books, Ashaar, Ghazlen, Nazmen, Rubai
**Purpose**: Nested dynamic routing for content items with URL-friendly slugs and unique identifiers

#### E-Books Section

- **Route**: `/E-Books/[slug]/[id]`
- **Component**: `app/E-Books/[slug]/[id]/page.tsx`
- **Dependencies**:
  - `@/hooks/useAirtableRecord` - Single record fetching
  - `@/hooks/useLikeButton` - Like functionality
  - `@/hooks/useAuthGuard` - Authentication management
  - `@/app/Components/PdfViewer` - PDF viewing (dynamic import)
  - `@/components/ui/login-required-dialog` - Auth dialogs
  - `@/lib/airtable-client-utils` - Airtable utilities
- **Data Structure**: BookRecordFields interface
- **Key Features**: PDF viewing, like/share functionality, download protection

#### Poetry Sections (Ashaar, Ghazlen, Nazmen, Rubai)

- **Route**: `/[Section]/[slug]/[id]`
- **Component**: `app/[Section]/[slug]/[id]/page.tsx`
- **Dependencies**:
  - `@/hooks/useAirtableList` - List fetching with filters
  - `@/hooks/useAirtableRecord` - Single record fetching
  - `@/lib/airtable-utils` - Formatting and filtering utilities
  - `@/app/Components/Loader` - Loading states
  - `@/hooks/useAuthGuard` - Authentication
- **Data Structure**: AshaarRecord, GhazlenRecord interfaces
- **Key Features**: Poetry display, navigation, social actions

### 2. [name] Pattern

**Sections**: Shaer (poets), nested in poetry sections
**Purpose**: Name-based routing for poets and authors

#### Shaer Section

- **Route**: `/Shaer/[name]`
- **Component**: `app/Shaer/[name]/page.tsx` (Server Component)
- **Dependencies**:
  - Server-side data fetching
  - Metadata generation for SEO
  - `@/lib/utils` - Utility functions
  - Client component for interactivity
- **Data Structure**: IntroFields interface
- **Key Features**: Poet profiles, metadata generation, multi-language support

#### Poetry Section Poet Pages

- **Route**: `/[Section]/shaer/[name]`
- **Component**: `app/[Section]/shaer/[name]/page.tsx`
- **Dependencies**:
  - `@/hooks/useAirtableList` - Filtered poetry by poet
  - `@/hooks/useAirtableMutation` - Update operations
  - `@/hooks/useCommentSystem` - Comment functionality
  - `@/hooks/useShareAction` - Share functionality
  - `@/app/Components/DataCard` - Poetry card display
- **Data Structure**: Section-specific record interfaces
- **Key Features**: Poet's poetry collection, social interactions

### 3. [unwan] Pattern

**Sections**: Ashaar/mozu, Ghazlen/mozu (topic-based routing)
**Purpose**: Topic/theme-based content organization

#### Topic Pages

- **Route**: `/[Section]/mozu/[unwan]`
- **Component**: `app/[Section]/mozu/[unwan]/page.tsx`
- **Dependencies**:
  - `@/hooks/useAirtableList` - Topic-filtered content
  - `@/hooks/useAirtableMutation` - Update operations
  - `@/hooks/useCommentSystem` - Comments
  - `@/app/Components/DataCard` - Content cards
  - `@/lib/airtable-utils` - Topic filtering
- **Data Structure**: Section-specific record interfaces
- **Key Features**: Topic-based content filtering, social interactions

### 4. [id] Pattern

**Sections**: bazmehindi, bazmeurdu, Blogs, Interview
**Purpose**: Simple ID-based routing for content items

#### Content Sections

- **Route**: `/[Section]/[id]`
- **Component**: `app/[Section]/[id]/page.tsx`
- **Dependencies**:
  - Section-specific data fetching
  - Content display components
  - Navigation utilities
- **Data Structure**: Section-specific interfaces
- **Key Features**: Content display, navigation

### 5. Catch-All Pattern

**Sections**: sign-in, sign-up (authentication)
**Purpose**: Flexible authentication routing

#### Authentication Pages

- **Route**: `/[auth-type]/[[...auth-params]]`
- **Component**: `app/[auth-type]/[[...auth-params]]/page.tsx`
- **Dependencies**:
  - Authentication provider integration
  - Route parameter handling
- **Key Features**: Flexible auth routing, parameter handling

## Static Route Patterns

### Core Static Pages

#### High Priority Static Routes

- **Favorites**: User favorites management
- **Founders**: Organization information
- **Interview**: Interview content (also has dynamic routes)

#### Policy and Legal Pages

- **privacypolicy**: Privacy policy content
- **terms&conditions**: Terms and conditions
- **cancellation&refund**: Cancellation and refund policy
- **shipping&delivery**: Shipping and delivery information

## Component Dependencies Analysis

### Core Shared Components

#### Data Display Components

- `DataCard`: Universal content card component
- `SkeletonLoader`: Loading state component
- `Loader`: General loading component
- `CommentSection`: Comment system component

#### UI Components

- `LoginRequiredDialog`: Authentication dialogs
- `PdfViewer`: PDF viewing functionality
- Various UI components from `@/components/ui/`

#### Hooks and Utilities

- `useAirtableList`: List data fetching
- `useAirtableRecord`: Single record fetching
- `useAirtableMutation`: Data mutations
- `useAuthGuard`: Authentication management
- `useLikeButton`: Like functionality
- `useCommentSystem`: Comment system
- `useShareAction`: Share functionality

### Language-Specific Considerations

#### Font Management

- Current: Mehr Nastaliq for Urdu (default)
- Required: English fonts for EN directory
- Required: Devanagari fonts for HI directory

#### Content Localization

- Text direction (RTL for Urdu/Arabic, LTR for English/Hindi)
- Language-specific metadata
- Localized error messages and UI text

## Implementation Priority Matrix

### High Priority Routes (Critical for functionality)

1. **E-Books/[slug]/[id]** - Core content access
2. **Poetry sections [slug]/[id]** - Main content routes
3. **Favorites** - User functionality
4. **Authentication pages** - User management

### Medium Priority Routes (Important for completeness)

1. **Policy pages** - Legal compliance
2. **Founders** - Organization information
3. **Interview** - Additional content

### Low Priority Routes (Nice to have)

1. **Poetry section topic pages** - Enhanced navigation
2. **Poet-specific pages in sections** - Specialized views

## Component Reusability Strategy

### Shared Components

- Most components can be reused across language directories
- Language context should be passed as props
- Font configuration should be handled at the layout level

### Language-Specific Adaptations

- Metadata generation for SEO
- Text direction and layout adjustments
- Font loading and application
- Error message localization

### Data Fetching Consistency

- Same Airtable bases and tables across languages
- Consistent API endpoints
- Shared caching strategies
- Unified error handling

## Missing Route Implementation Guide

### For Each Missing Route:

1. **Create directory structure** matching the pattern
2. **Copy base component** from default implementation
3. **Add language context** integration
4. **Update font configuration** for the target language
5. **Implement proper metadata** for SEO
6. **Add error boundaries** with localized messages
7. **Test navigation** and functionality

### Component Dependencies Checklist:

- [ ] Airtable hooks configured
- [ ] Authentication integration
- [ ] Language context available
- [ ] Font configuration applied
- [ ] Error handling implemented
- [ ] SEO metadata configured
- [ ] Navigation links updated

## Testing Strategy

### Route Accessibility Testing

- Verify all dynamic routes resolve correctly
- Test parameter validation and error handling
- Confirm navigation between language versions

### Component Integration Testing

- Test shared component functionality across languages
- Verify data fetching consistency
- Confirm authentication flows work properly

### Performance Testing

- Monitor font loading performance
- Test component lazy loading
- Verify caching strategies effectiveness

## Maintenance Considerations

### Future Route Additions

- Follow established patterns for consistency
- Update this documentation for new patterns
- Maintain component reusability principles

### Language Directory Synchronization

- Implement automated checks for route parity
- Create utilities for bulk route generation
- Establish update procedures for new features

### Performance Optimization

- Implement code splitting for language-specific routes
- Optimize font loading strategies
- Monitor and optimize bundle sizes per language
