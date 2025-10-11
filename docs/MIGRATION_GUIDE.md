# Migration Guide

## Overview

This guide provides comprehensive instructions for migrating between different versions of the Jahannuma platform, including database migrations, API changes, and breaking changes.

## Table of Contents

1. [Version Migration Overview](#version-migration-overview)
2. [Database Migrations](#database-migrations)
3. [API Breaking Changes](#api-breaking-changes)
4. [Configuration Updates](#configuration-updates)
5. [Component Migrations](#component-migrations)
6. [Environment Variables](#environment-variables)
7. [Troubleshooting](#troubleshooting)

## Version Migration Overview

### Migration Checklist

Before starting any migration:

- [ ] Backup current Airtable data
- [ ] Document current environment configuration
- [ ] Test migration in staging environment
- [ ] Prepare rollback strategy
- [ ] Update dependencies
- [ ] Run comprehensive tests

### Supported Migration Paths

- **v1.0.x → v1.1.x**: Minor updates, backward compatible
- **v1.x.x → v2.x.x**: Major version with breaking changes
- **v2.x.x → v3.x.x**: Architecture restructure

## Database Migrations

### Airtable Schema Updates

#### Version 1.0 → 1.1

**New Fields Added:**

- `Comments` table: Added `isVerified` field
- `Poetry` tables: Added `searchKeywords` field
- `Users` table: Added `preferences` field

**Migration Script:**

```typescript
// Run in Airtable console or via API
const updateSchema = async () => {
  // Add isVerified field to Comments
  await airtable("Comments").create([{ fields: { isVerified: false } }]);

  // Add searchKeywords to all poetry tables
  const tables = ["Ashaar", "Ghazlen", "Nazmen", "Rubai"];
  for (const table of tables) {
    await updateTable(table, { searchKeywords: "" });
  }
};
```

#### Version 1.1 → 2.0

**Breaking Changes:**

- Renamed `authorName` to `poet` in all poetry tables
- Split `content` field into `text` and `translation`
- Added required `language` field

**Migration Script:**

```typescript
const migrateToV2 = async () => {
  const tables = ["Ashaar", "Ghazlen", "Nazmen", "Rubai"];

  for (const table of tables) {
    const records = await airtable(table).select().all();

    for (const record of records) {
      const updates = {
        poet: record.get("authorName"),
        text: record.get("content"),
        language: detectLanguage(record.get("content")) || "ur",
      };

      await record.updateFields(updates);
    }
  }
};
```

### Data Backup and Restore

#### Creating Backups

```typescript
// app/scripts/backup-airtable.ts
import { AirtableClient } from "@/lib/airtable-client";

const backupData = async () => {
  const timestamp = new Date().toISOString().split("T")[0];
  const tables = ["Ashaar", "Ghazlen", "Nazmen", "Rubai", "Comments", "Users"];

  for (const tableName of tables) {
    const records = await AirtableClient.getAllRecords(tableName);

    // Save to local file
    await fs.writeFile(
      `./backups/${tableName}-${timestamp}.json`,
      JSON.stringify(records, null, 2)
    );
  }
};
```

#### Restoring from Backup

```typescript
const restoreFromBackup = async (backupDate: string) => {
  const tables = ["Ashaar", "Ghazlen", "Nazmen", "Rubai", "Comments", "Users"];

  for (const tableName of tables) {
    const backupData = await fs.readFile(
      `./backups/${tableName}-${backupDate}.json`
    );
    const records = JSON.parse(backupData.toString());

    // Clear existing data (if needed)
    await clearTable(tableName);

    // Restore records in batches
    for (let i = 0; i < records.length; i += 10) {
      const batch = records.slice(i, i + 10);
      await airtable(tableName).create(batch);
    }
  }
};
```

## API Breaking Changes

### Version 1.x → 2.x

#### Response Format Changes

**Before (v1.x):**

```json
{
  "data": [
    {
      "id": "rec123",
      "authorName": "Mirza Ghalib",
      "content": "Poetry text...",
      "createdTime": "2023-01-01T00:00:00.000Z"
    }
  ],
  "total": 100
}
```

**After (v2.x):**

```json
{
  "success": true,
  "data": [
    {
      "id": "rec123",
      "poet": "Mirza Ghalib",
      "text": "Poetry text...",
      "translation": null,
      "language": "ur",
      "metadata": {
        "createdTime": "2023-01-01T00:00:00.000Z",
        "updatedTime": "2023-01-01T00:00:00.000Z"
      }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "hasNext": true
  }
}
```

#### Migration Code for API Changes

```typescript
// Update API response handlers
const migrateApiHandlers = () => {
  // Old format handler
  const handleOldResponse = (response: any) => {
    return {
      data: response.data,
      total: response.total,
    };
  };

  // New format handler
  const handleNewResponse = (response: any) => {
    if (!response.success) {
      throw new Error(response.error || "API request failed");
    }

    return {
      data: response.data,
      pagination: response.pagination,
    };
  };
};
```

### Endpoint Changes

#### Renamed Endpoints

| Old Endpoint          | New Endpoint  | Notes                   |
| --------------------- | ------------- | ----------------------- |
| `/api/poetry/ashaar`  | `/api/ashaar` | Simplified path         |
| `/api/authors`        | `/api/poets`  | Renamed for consistency |
| `/api/search/content` | `/api/search` | Consolidated search     |

#### New Required Parameters

```typescript
// v2.x requires language parameter for content endpoints
const fetchPoetry = async (category: string, language: string = "ur") => {
  const response = await fetch(`/api/${category}?language=${language}`);
  return response.json();
};
```

## Configuration Updates

### Environment Variables

#### New Required Variables (v2.0+)

```bash
# Add to .env.local
NEXT_PUBLIC_DEFAULT_LANGUAGE=ur
NEXT_PUBLIC_SUPPORTED_LANGUAGES=ur,hi,en
AIRTABLE_CACHE_TTL=300
ENABLE_COMMENT_MODERATION=true
```

#### Updated Variable Names

| Old Name               | New Name                         | Migration             |
| ---------------------- | -------------------------------- | --------------------- |
| `AIRTABLE_API_KEY`     | `AIRTABLE_PERSONAL_ACCESS_TOKEN` | Update in environment |
| `NEXT_PUBLIC_SITE_URL` | `NEXT_PUBLIC_BASE_URL`           | Update all references |

### Next.js Configuration

#### next.config.js Changes

```typescript
// v1.x configuration
module.exports = {
  experimental: {
    appDir: true,
  },
};

// v2.x configuration
module.exports = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: ["dl.airtable.com"],
    formats: ["image/webp", "image/avif"],
  },
  i18n: {
    locales: ["ur", "hi", "en"],
    defaultLocale: "ur",
    localeDetection: false,
  },
};
```

## Component Migrations

### UI Component Updates

#### Button Component (v1 → v2)

**Before:**

```tsx
import { Button } from "@/components/Button";

<Button variant="primary" size="lg">
  Click me
</Button>;
```

**After:**

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="lg">
  Click me
</Button>;
```

#### Migration Script for Components

```bash
# Run this script to update component imports
npm run migrate:components
```

```typescript
// scripts/migrate-components.ts
const updateComponentImports = async () => {
  const files = await glob("**/*.{ts,tsx}", { ignore: "node_modules/**" });

  for (const file of files) {
    let content = await fs.readFile(file, "utf8");

    // Update Button imports
    content = content.replace(
      /import \{ Button \} from ['"]@\/components\/Button['"];?/g,
      "import { Button } from '@/components/ui/button';"
    );

    // Update variant names
    content = content.replace(/variant="primary"/g, 'variant="default"');
    content = content.replace(/variant="secondary"/g, 'variant="outline"');

    await fs.writeFile(file, content);
  }
};
```

### Hook Updates

#### useSWR Configuration Changes

**Before (v1.x):**

```typescript
import useSWR from "swr";

const { data } = useSWR("/api/ashaar", fetcher);
```

**After (v2.x):**

```typescript
import useSWR from "swr";

const { data } = useSWR("/api/ashaar?language=ur", fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
});
```

## Environment Variables

### Migration Checklist

1. **Update Environment Files:**

   ```bash
   # Copy current environment
   cp .env.local .env.local.backup

   # Update with new variables
   echo "NEXT_PUBLIC_DEFAULT_LANGUAGE=ur" >> .env.local
   echo "AIRTABLE_CACHE_TTL=300" >> .env.local
   ```

2. **Validate Configuration:**

   ```typescript
   // Add to your validation script
   const validateConfig = () => {
     const required = [
       "AIRTABLE_PERSONAL_ACCESS_TOKEN",
       "AIRTABLE_BASE_ID",
       "NEXT_PUBLIC_DEFAULT_LANGUAGE",
     ];

     for (const key of required) {
       if (!process.env[key]) {
         throw new Error(`Missing required environment variable: ${key}`);
       }
     }
   };
   ```

3. **Update Deployment:**
   - Update environment variables in production
   - Update CI/CD configuration
   - Update documentation

## Troubleshooting

### Common Migration Issues

#### 1. Airtable API Rate Limits

**Problem:** Migration scripts hitting rate limits

**Solution:**

```typescript
const rateLimitedRequest = async (fn: Function, retries = 3) => {
  try {
    return await fn();
  } catch (error) {
    if (error.statusCode === 429 && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return rateLimitedRequest(fn, retries - 1);
    }
    throw error;
  }
};
```

#### 2. Component Import Errors

**Problem:** Components not found after migration

**Solution:**

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### 3. Environment Variable Issues

**Problem:** New environment variables not being recognized

**Solution:**

```bash
# Restart development server
npm run dev
# Or restart your deployment
```

### Migration Validation

#### Data Integrity Check

```typescript
const validateMigration = async () => {
  const tables = ["Ashaar", "Ghazlen", "Nazmen", "Rubai"];

  for (const table of tables) {
    const records = await airtable(table).select().all();

    for (const record of records) {
      // Check required fields exist
      if (!record.get("poet")) {
        console.error(`Missing poet field in ${table}:${record.id}`);
      }

      if (!record.get("text")) {
        console.error(`Missing text field in ${table}:${record.id}`);
      }

      if (!record.get("language")) {
        console.error(`Missing language field in ${table}:${record.id}`);
      }
    }
  }
};
```

#### API Endpoint Testing

```typescript
const testApiEndpoints = async () => {
  const endpoints = [
    "/api/ashaar",
    "/api/ghazlen",
    "/api/nazmen",
    "/api/rubai",
    "/api/poets",
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`);
      const data = await response.json();

      if (!data.success) {
        console.error(`API test failed for ${endpoint}:`, data.error);
      }
    } catch (error) {
      console.error(`API test error for ${endpoint}:`, error);
    }
  }
};
```

### Rollback Procedures

#### Quick Rollback

```bash
# 1. Restore environment variables
cp .env.local.backup .env.local

# 2. Restore database from backup
npm run restore-backup -- --date=2023-12-01

# 3. Revert code changes
git revert --no-commit HEAD~5..HEAD
git commit -m "Rollback migration changes"

# 4. Rebuild and restart
npm run build
npm run start
```

#### Gradual Rollback

For partial rollbacks, use feature flags:

```typescript
// Add feature flag support
const useV2Features = process.env.ENABLE_V2_FEATURES === "true";

if (useV2Features) {
  // Use new API format
} else {
  // Use legacy API format
}
```

## Post-Migration Steps

1. **Monitor Application:**

   - Check error logs
   - Monitor API response times
   - Verify data integrity

2. **Update Documentation:**

   - Update API documentation
   - Update component documentation
   - Update deployment guides

3. **Clean Up:**

   - Remove deprecated code
   - Remove old environment variables
   - Archive old backups

4. **Team Communication:**
   - Notify team of changes
   - Share migration notes
   - Update development workflows
