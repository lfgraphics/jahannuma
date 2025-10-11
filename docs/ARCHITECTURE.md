# Jahannuma Architecture Migration Guide

## Overview

This document outlines the complete migration from the existing mixed component structure to a modern, feature-based modular architecture. The migration implements a scalable, maintainable codebase with proper separation of concerns, API-first approach, and comprehensive multi-language support.

## Migration Summary

### ✅ Completed

- **Type System**: Complete migration from `app/types.ts` to feature-based `src/types/`
- **Hooks Migration**: All hooks moved to `src/hooks/` with domain organization
- **Library Utilities**: Comprehensive `src/lib/` with enhanced functionality
- **Component Structure**: Feature-based component organization with barrel exports
- **API Foundation**: Next.js API routes structure for secure server-side operations
- **Configuration Updates**: Enhanced `tsconfig.json` and `next.config.ts`
- **Utility Functions**: Complete `src/utils/` with comprehensive helper functions
- **Basic Components**: Placeholder component exports to enable module resolution
- **TypeScript Validation**: Clean compilation with 0 errors
- **Next.js 15 Compatibility**: Updated for async params and removed deprecated options

### 🔄 Pending Implementation

- Individual component implementations (replace placeholders)
- Complete API route handlers implementation
- Component migration from `app/Components/`
- Testing setup and comprehensive documentation

## Architecture Overview

```
src/
├── types/           # Feature-based type definitions
│   ├── airtable/    # Airtable record types
│   ├── api/         # API request/response types
│   ├── auth/        # Authentication types
│   ├── common/      # Shared utility types
│   └── index.ts     # Barrel exports
├── hooks/           # Custom React hooks by domain
│   ├── airtable/    # Data fetching hooks
│   ├── auth/        # Authentication hooks
│   ├── social/      # Like/share/comment hooks
│   ├── utils/       # Utility hooks
│   └── index.ts     # Barrel exports
├── lib/             # Utility functions and services
│   ├── airtable/    # Server-side Airtable client
│   ├── cache/       # Caching utilities
│   ├── user/        # User metadata management
│   ├── social/      # Social features utilities
│   ├── i18n/        # Internationalization
│   ├── seo/         # SEO and metadata utilities
│   └── index.ts     # Barrel exports
├── components/      # Feature-based UI components
│   ├── ashaar/      # Poetry components
│   ├── ghazlen/     # Ghazal components
│   ├── nazmen/      # Nazm components
│   ├── rubai/       # Rubai components
│   ├── shared/      # Common components
│   └── index.ts     # Barrel exports
└── index.ts         # Main barrel export
```

## Key Features

### 1. Type System (`src/types/`)

**Features:**

- Generic `AirtableRecord<T>` with field mappings
- `WithCounts` mixin for like/comment counts
- Feature-specific record types (AshaarRecord, GhazlenRecord, etc.)
- Complete API request/response types
- Authentication and user metadata types

**Usage:**

```typescript
import type { AshaarRecord, AsharListResponse } from "@/src/types";
```

### 2. Hooks System (`src/hooks/`)

**Features:**

- API-route based data fetching (no direct Airtable calls)
- Authentication state management
- Social interactions (likes, comments, shares)
- Utility hooks (debouncing, safe auth, etc.)

**Key Hooks:**

```typescript
// Data fetching
useAirtableList("/api/airtable/ashaar", options);
useAirtableRecord("/api/airtable/ashaar/123");

// Social features
useLikeButton(contentType, contentId);
useCommentSystem(contentType, contentId);
useShareAction();

// Authentication
useAuthGuard(redirectTo);
useSafeAuth();
```

### 3. Library Utilities (`src/lib/`)

**Airtable (`src/lib/airtable/`)**

- Server-side Airtable client with TypeScript support
- Secure API key management
- CRUD operations for all content types

**Cache (`src/lib/cache/`)**

- TTL-based caching with automatic cleanup
- LRU cache implementation
- SWR integration utilities

**User Management (`src/lib/user/`)**

- Clerk integration for user metadata
- Like/favorite management
- User preference storage

**Social Features (`src/lib/social/`)**

- Share functionality with platform-specific URLs
- Download utilities for content
- Social media integration

**Internationalization (`src/lib/i18n/`)**

- Enhanced multilingual text management
- RTL/LTR support utilities
- Font family management for different scripts

**SEO (`src/lib/seo/`)**

- Next.js metadata generation
- Structured data (JSON-LD) for rich snippets
- Open Graph and Twitter Card optimization

### 4. Component Organization (`src/components/`)

**Feature-based Structure:**

- `ashaar/` - Poetry-specific components
- `ghazlen/` - Ghazal components with audio support
- `nazmen/` - Nazm components
- `rubai/` - Rubai components
- `shared/` - Common UI components

**Barrel Exports:**
Clean imports with feature-based organization:

```typescript
import { AsharCard, AsharList } from "@/src/components/ashaar";
import { LanguageToggle, LikeButton } from "@/src/components/shared";
```

## API Routes Architecture

### Secure Server-side Operations

All API routes use the server-side Airtable client for secure operations:

```typescript
// app/api/airtable/ashaar/route.ts
import { listAshaarRecords } from "@/src/lib/airtable/airtable-client";
```

### Authentication Integration

```typescript
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
// Handle authenticated operations
```

### Error Handling

Standardized error responses across all API routes:

```typescript
{
  success: false,
  error: {
    code: 'FETCH_FAILED',
    message: 'Human-readable message',
    details: 'Technical details'
  }
}
```

## Configuration Enhancements

### TypeScript (`tsconfig.json`)

**Granular Path Aliases:**

```json
{
  "paths": {
    "@/*": ["./*"],
    "@/src/*": ["./src/*"],
    "@/src/types/*": ["./src/types/*"],
    "@/src/hooks/*": ["./src/hooks/*"],
    "@/src/lib/*": ["./src/lib/*"],
    "@/src/components/*": ["./src/components/*"]
  }
}
```

### Next.js (`next.config.ts`)

**Enhanced Features:**

- Internationalization support (en, ur, hi)
- Performance optimizations
- Security headers
- Bundle optimization
- SWC minification

## Migration Benefits

### 1. **Scalability**

- Feature-based organization scales with team growth
- Clear separation of concerns
- Modular architecture supports independent development

### 2. **Maintainability**

- Barrel exports provide clean import paths
- Type safety throughout the application
- Centralized utility functions

### 3. **Performance**

- API-first approach with proper caching
- Optimized bundle splitting
- Server-side rendering optimization

### 4. **Developer Experience**

- Comprehensive TypeScript support
- Clear architectural patterns
- Extensive documentation

### 5. **Security**

- Server-side API operations
- Secure authentication integration
- No client-side API key exposure

## Next Steps

1. **Component Implementation**

   - Migrate components from `app/Components/`
   - Implement feature-specific components
   - Add comprehensive prop types

2. **API Route Completion**

   - Implement all CRUD operations
   - Add comprehensive error handling
   - Implement rate limiting

3. **Testing Setup**

   - Unit tests for utilities
   - Integration tests for API routes
   - E2E tests for critical paths

4. **Documentation**
   - API documentation
   - Component stories (Storybook)
   - Deployment guides

## Import Examples

### Before Migration

```typescript
import { useAirtableList } from "../../../hooks/useAirtableList";
import { AshaarRecord } from "../../../app/types";
```

### After Migration

```typescript
import { useAirtableList } from "@/src/hooks";
import type { AshaarRecord } from "@/src/types";
```

## Conclusion

This migration establishes a robust, scalable foundation for the Jahannuma platform. The modular architecture, comprehensive type system, and API-first approach provide excellent developer experience while maintaining high performance and security standards.

The new structure supports the multi-language nature of the platform and provides a solid foundation for future feature development and team scaling.
