# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended package manager)
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd jahannuma

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Clerk and Airtable credentials

# Start development server
pnpm dev
```

### Environment Variables

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Airtable Configuration
AIRTABLE_TOKEN=
AIRTABLE_BASE_ID=

# Optional: Additional services
NEXT_PUBLIC_ANALYTICS_ID=
```

## Project Structure

### New Modular Architecture (src/)

```
src/
├── types/              # Type definitions by feature
│   ├── airtable/       # Airtable base types
│   ├── features/       # Feature-specific types (ashaar, ghazlen, etc.)
│   ├── api/           # API request/response types
│   ├── ui/            # UI state types
│   └── index.ts       # Barrel exports
├── hooks/             # Custom React hooks
│   ├── airtable/      # Data fetching hooks
│   ├── auth/          # Authentication hooks
│   ├── social/        # Social interaction hooks
│   ├── utils/         # Utility hooks
│   └── index.ts       # Barrel exports
├── lib/               # Server-side utilities and services
│   ├── airtable/      # Airtable client and operations
│   ├── cache/         # Caching utilities
│   ├── user/          # User metadata management
│   ├── social/        # Social features
│   ├── i18n/          # Internationalization
│   └── seo/           # SEO utilities
├── components/        # UI components by feature
│   ├── ashaar/        # Ashaar-specific components
│   ├── ghazlen/       # Ghazal components
│   ├── nazmen/        # Nazm components
│   ├── rubai/         # Rubai components
│   ├── shared/        # Common components
│   └── index.ts       # Barrel exports
└── utils/             # Client-side utilities
    ├── date.ts        # Date formatting
    ├── text.ts        # Text manipulation
    ├── url.ts         # URL utilities
    ├── storage.ts     # Local storage
    ├── performance.ts # Performance optimization
    ├── validation.ts  # Form validation
    └── index.ts       # Barrel exports
```

## Development Workflow

### 1. Feature Development

When implementing a new feature:

```typescript
// 1. Define types in src/types/features/
export interface NewFeatureRecord {
  id: string;
  title: string;
  content: string;
}

// 2. Create hooks in src/hooks/
export function useNewFeature() {
  return useAirtableList<NewFeatureRecord>("/api/airtable/new-feature");
}

// 3. Implement API routes in app/api/
export async function GET() {
  // Server-side logic
}

// 4. Create components in src/components/
export function NewFeatureCard() {
  // Component implementation
}
```

### 2. Code Organization

#### Import Patterns

```typescript
// Preferred: Barrel imports for common usage
import { AshaarRecord, useAirtableList } from "@/src/types";
import { AsharCard } from "@/src/components";

// Specific imports when needed
import { formatDate } from "@/src/utils/date";
import { validateEmail } from "@/src/utils/validation";
```

#### File Naming Conventions

- **Types**: PascalCase (e.g., `UserRecord`, `ApiResponse`)
- **Components**: PascalCase (e.g., `AsharCard.tsx`)
- **Hooks**: camelCase starting with 'use' (e.g., `useAirtableList.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **API Routes**: lowercase (e.g., `route.ts`, `[id]/route.ts`)

## API Development

### Creating API Routes

```typescript
// app/api/airtable/[feature]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const { userId } = await auth();

    // Business logic
    const data = await fetchData();

    // Type-safe response
    const response: ApiResponse<DataType> = {
      success: true,
      data,
    };

    return NextResponse.json(response);
  } catch (error) {
    // Error handling
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_FAILED",
          message: "Failed to fetch data",
        },
      },
      { status: 500 }
    );
  }
}
```

### API Route Patterns

- **List endpoints**: `GET /api/airtable/[feature]`
- **Detail endpoints**: `GET /api/airtable/[feature]/[id]`
- **User actions**: `POST /api/user/[action]`
- **Search**: `GET /api/search/[feature]?q=query`

## Component Development

### Component Structure

```typescript
// src/components/feature/FeatureCard.tsx
import React from "react";
import { FeatureRecord } from "@/src/types";

interface FeatureCardProps {
  data: FeatureRecord;
  onLike?: (id: string) => void;
  className?: string;
}

export function FeatureCard({ data, onLike, className }: FeatureCardProps) {
  return <div className={className}>{/* Component implementation */}</div>;
}

// Export both named and default
export { FeatureCard as default };
```

### Component Categories

1. **Feature Components**: Domain-specific UI (ashaar, ghazlen, etc.)
2. **Shared Components**: Reusable UI elements
3. **Layout Components**: Page structure and navigation
4. **Form Components**: Input handling and validation

## Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### Test Structure

```typescript
// src/utils/__tests__/date.test.ts
import { formatDate } from "../date";

describe("formatDate", () => {
  it("should format date correctly", () => {
    const result = formatDate("2023-12-25");
    expect(result).toBe("December 25, 2023");
  });
});
```

## Performance Guidelines

### 1. Component Optimization

```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Complex rendering */}</div>;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return complexCalculation(data);
}, [data]);
```

### 2. Bundle Optimization

```typescript
// Lazy load components
const LazyComponent = lazy(() => import("./LazyComponent"));

// Dynamic imports for utilities
const { heavyFunction } = await import("@/src/utils/heavy");
```

### 3. Image Optimization

```typescript
// Use Next.js Image component
import Image from "next/image";

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority={isAboveFold}
/>;
```

## Debugging

### Development Tools

```bash
# TypeScript checking
pnpm tsc --noEmit

# Linting
pnpm lint

# Build validation
pnpm build
```

### Common Issues

1. **Import Errors**: Check path aliases in `tsconfig.json`
2. **Type Errors**: Ensure proper type imports
3. **Build Failures**: Verify all exports are properly defined

## Deployment

### Build Process

```bash
# Production build
pnpm build

# Start production server
pnpm start
```

### Environment Setup

1. Set production environment variables
2. Configure domain and SSL
3. Set up monitoring and analytics
4. Configure CDN for static assets

## Contributing

### Code Standards

1. **TypeScript**: All new code must be TypeScript
2. **ESLint**: Follow configured linting rules
3. **Prettier**: Use for code formatting
4. **Comments**: JSDoc for public APIs

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes following architecture
3. Add tests for new functionality
4. Update documentation as needed
5. Submit PR with clear description

### Review Checklist

- [ ] TypeScript compilation passes
- [ ] All tests pass
- [ ] Performance impact considered
- [ ] Documentation updated
- [ ] Security implications reviewed
