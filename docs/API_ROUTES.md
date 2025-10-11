# API Routes Documentation

## Overview

This document provides comprehensive documentation for all API routes in the Jahannuma platform. The API follows RESTful conventions and provides consistent error handling and response formats for managing Urdu poetry content including Ashaar, Ghazlen, Nazmen, Rubai, Comments, and E-Books.

## Base URLs

```
Production: https://jahan-numa.org/api
Development: http://localhost:3000/api
```

## Authentication

Most user-specific operations require authentication via Clerk:

```typescript
import { auth } from "@clerk/nextjs/server";
const { userId } = await auth();
```

Authentication is required for:

- Creating comments
- Managing user preferences
- Like/unlike operations
- User-specific content filtering

## Standard Response Format

All API responses follow a consistent format:

### Success Response

```typescript
{
  success: true,
  data: {
    records?: Array<Record>,
    record?: Record,
    offset?: string,
    totalRecords?: number,
    pageSize?: number
  }
}
```

### Error Response

```typescript
{
  success: false,
  error: {
    message: string,
    code?: string,
    details?: any
  }
}
```

## Common Query Parameters

All list endpoints support these query parameters:

- `pageSize` (number): Number of records per page (default: 20, max: 100)
- `offset` (string): Pagination offset token from previous response
- `sort` (string): Sort format: "field:direction" (e.g., "Created:desc")
- `filterByFormula` (string): Airtable formula for filtering
- `fields` (string): Comma-separated list of fields to return
- `view` (string): Airtable view name (default: "Main View")
- `search` (string): Search term for text-based filtering

---

## Ashaar (Poetry Verses) API

### List Ashaar

**GET** `/api/airtable/ashaar`

Retrieve a paginated list of Ashaar records.

#### Query Parameters

- All common query parameters
- `authorFilter` (string): Filter by specific author
- `moodFilter` (string): Filter by mood/theme

#### Response

```typescript
{
  success: true,
  data: {
    records: Array<{
      id: string,
      fields: {
        "Misra 1": string,
        "Misra 2": string,
        Author: string,
        Mood?: string,
        Category?: string,
        Created: string,
        Likes?: number,
        "Book Name"?: string,
        "Page Number"?: number
      }
    }>,
    offset?: string,
    totalRecords: number,
    pageSize: number
  }
}
```

#### Example

```bash
curl "http://localhost:3000/api/airtable/ashaar?pageSize=10&sort=Created:desc"
```

### Get Single Ashaar

**GET** `/api/airtable/ashaar/[id]`

Retrieve a specific Ashaar record with user metadata.

#### Path Parameters

- `id` (string): Record ID or slug

#### Response

```typescript
{
  success: true,
  data: {
    record: {
      id: string,
      fields: { /* Ashaar fields */ },
      userMetadata?: {
        isLiked: boolean,
        likeCount: number
      }
    }
  }
}
```

#### Example

```bash
curl "http://localhost:3000/api/airtable/ashaar/rec123abc"
```

---

## Ghazlen (Ghazals) API

### List Ghazlen

**GET** `/api/airtable/ghazlen`

Retrieve a paginated list of Ghazal records.

#### Query Parameters

- All common query parameters
- `authorFilter` (string): Filter by specific author
- `meterFilter` (string): Filter by poetic meter

#### Response

```typescript
{
  success: true,
  data: {
    records: Array<{
      id: string,
      fields: {
        "Ghazal Title": string,
        "First Line": string,
        "Full Text": string,
        Author: string,
        Meter?: string,
        Created: string,
        Likes?: number,
        "Publication Year"?: number
      }
    }>,
    offset?: string,
    totalRecords: number,
    pageSize: number
  }
}
```

#### Example

```bash
curl "http://localhost:3000/api/airtable/ghazlen?authorFilter=Ghalib"
```

### Get Single Ghazal

**GET** `/api/airtable/ghazlen/[id]`

Retrieve a specific Ghazal record with user metadata.

#### Path Parameters

- `id` (string): Record ID or slug

#### Response

```typescript
{
  success: true,
  data: {
    record: {
      id: string,
      fields: { /* Ghazal fields */ },
      userMetadata?: {
        isLiked: boolean,
        likeCount: number
      }
    }
  }
}
```

---

## Nazmen (Poems) API

### List Nazmen

**GET** `/api/airtable/nazmen`

Retrieve a paginated list of Nazm records.

#### Query Parameters

- All common query parameters
- `authorFilter` (string): Filter by specific author
- `themeFilter` (string): Filter by theme

#### Response

```typescript
{
  success: true,
  data: {
    records: Array<{
      id: string,
      fields: {
        Title: string,
        "Full Text": string,
        Author: string,
        Theme?: string,
        Created: string,
        Likes?: number,
        "Line Count"?: number
      }
    }>,
    offset?: string,
    totalRecords: number,
    pageSize: number
  }
}
```

#### Example

```bash
curl "http://localhost:3000/api/airtable/nazmen?themeFilter=Nature"
```

### Get Single Nazm

**GET** `/api/airtable/nazmen/[id]`

Retrieve a specific Nazm record with user metadata.

#### Path Parameters

- `id` (string): Record ID or slug

#### Response

```typescript
{
  success: true,
  data: {
    record: {
      id: string,
      fields: { /* Nazm fields */ },
      userMetadata?: {
        isLiked: boolean,
        likeCount: number
      }
    }
  }
}
```

---

## Rubai (Quatrains) API

### List Rubai

**GET** `/api/airtable/rubai`

Retrieve a paginated list of Rubai records.

#### Query Parameters

- All common query parameters
- `authorFilter` (string): Filter by specific author
- `styleFilter` (string): Filter by style

#### Response

```typescript
{
  success: true,
  data: {
    records: Array<{
      id: string,
      fields: {
        "Line 1": string,
        "Line 2": string,
        "Line 3": string,
        "Line 4": string,
        Author: string,
        Style?: string,
        Created: string,
        Likes?: number
      }
    }>,
    offset?: string,
    totalRecords: number,
    pageSize: number
  }
}
```

#### Example

```bash
curl "http://localhost:3000/api/airtable/rubai?sort=Likes:desc"
```

### Get Single Rubai

**GET** `/api/airtable/rubai/[id]`

Retrieve a specific Rubai record with user metadata.

#### Path Parameters

- `id` (string): Record ID or slug

#### Response

```typescript
{
  success: true,
  data: {
    record: {
      id: string,
      fields: { /* Rubai fields */ },
      userMetadata?: {
        isLiked: boolean,
        likeCount: number
      }
    }
  }
}
```

---

## Comments API

### List Comments

**GET** `/api/airtable/comments`

Retrieve comments with optional filtering by content ID.

#### Query Parameters

- All common query parameters
- `dataId` (string): Filter comments for specific content record

#### Response

```typescript
{
  success: true,
  data: {
    records: Array<{
      id: string,
      fields: {
        Comment: string,
        "User ID": string,
        "User Name": string,
        "Data ID": string,
        Created: string,
        "Is Approved"?: boolean
      }
    }>,
    offset?: string,
    totalRecords: number,
    pageSize: number
  }
}
```

#### Example

```bash
curl "http://localhost:3000/api/airtable/comments?dataId=rec123abc"
```

### Create Comment

**POST** `/api/airtable/comments`

Create a new comment. Requires authentication.

#### Request Body

```typescript
{
  comment: string,
  dataId: string,
  userName?: string
}
```

#### Response

```typescript
{
  success: true,
  data: {
    record: {
      id: string,
      fields: { /* Comment fields */ }
    }
  }
}
```

#### Example

```bash
curl -X POST "http://localhost:3000/api/airtable/comments" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Beautiful verse!", "dataId": "rec123abc"}'
```

---

## E-Books API

### List E-Books

**GET** `/api/airtable/ebooks`

Retrieve a paginated list of E-Book records.

#### Query Parameters

- All common query parameters
- `authorFilter` (string): Filter by author
- `categoryFilter` (string): Filter by category

#### Response

```typescript
{
  success: true,
  data: {
    records: Array<{
      id: string,
      fields: {
        Title: string,
        Author: string,
        Description?: string,
        Category?: string,
        "File URL"?: string,
        "Cover Image"?: string,
        "Publication Year"?: number,
        Created: string,
        Likes?: number
      }
    }>,
    offset?: string,
    totalRecords: number,
    pageSize: number
  }
}
```

#### Example

```bash
curl "http://localhost:3000/api/airtable/ebooks?categoryFilter=Classical"
```

### Get Single E-Book

**GET** `/api/airtable/ebooks/[id]`

Retrieve a specific E-Book record with user metadata.

#### Path Parameters

- `id` (string): Record ID or slug

#### Response

```typescript
{
  success: true,
  data: {
    record: {
      id: string,
      fields: { /* E-Book fields */ },
      userMetadata?: {
        isLiked: boolean,
        likeCount: number
      }
    }
  }
}
```

---

## Error Handling

### Common Error Codes

- `400` - Bad Request: Invalid parameters or request body
- `401` - Unauthorized: Authentication required
- `404` - Not Found: Resource does not exist
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Unexpected server error

### Error Response Examples

```typescript
// Validation Error
{
  success: false,
  error: {
    message: "Invalid comment text",
    code: "VALIDATION_ERROR",
    details: { field: "comment", issue: "required" }
  }
}

// Not Found Error
{
  success: false,
  error: {
    message: "Record not found",
    code: "NOT_FOUND"
  }
}
```

---

## Testing Guide

### Development Environment

1. Start the development server:

```bash
pnpm dev
```

2. API will be available at `http://localhost:3000/api`

### Using curl

Basic list request:

```bash
curl "http://localhost:3000/api/airtable/ashaar?pageSize=5"
```

Filtered request:

```bash
curl "http://localhost:3000/api/airtable/ashaar?filterByFormula=Author='Ghalib'"
```

Create comment (requires auth):

```bash
curl -X POST "http://localhost:3000/api/airtable/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"comment": "Test comment", "dataId": "recXXX"}'
```

### Using JavaScript/TypeScript

```typescript
// Fetch Ashaar with pagination
const response = await fetch(
  "/api/airtable/ashaar?pageSize=10&sort=Created:desc"
);
const data = await response.json();

if (data.success) {
  console.log("Records:", data.data.records);
  if (data.data.offset) {
    // Fetch next page
    const nextPage = await fetch(
      `/api/airtable/ashaar?offset=${data.data.offset}`
    );
  }
}

// Create comment
const commentResponse = await fetch("/api/airtable/comments", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    comment: "Beautiful poetry!",
    dataId: "rec123abc",
  }),
});
```

### Response Validation

All responses include:

- `success` boolean indicating operation result
- `data` object for successful responses
- `error` object for failed responses

### Rate Limiting

- Development: No rate limiting
- Production: 100 requests per minute per IP
- Authenticated users: 1000 requests per minute

### Best Practices

1. **Pagination**: Always handle `offset` for large datasets
2. **Error Handling**: Check `success` field before processing `data`
3. **Field Selection**: Use `fields` parameter to reduce payload size
4. **Caching**: Implement client-side caching for frequently accessed data
5. **Authentication**: Include proper headers for user-specific operations

---

## Schema Reference

### Common Field Types

- **Text Fields**: String values, may contain Unicode (Urdu/Arabic)
- **Date Fields**: ISO 8601 format strings
- **Number Fields**: Integer or float values
- **Boolean Fields**: true/false values
- **Array Fields**: JSON arrays for multiple values
- **File Fields**: Objects with URL and metadata

### Field Naming Convention

- Primary content fields use descriptive names ("Misra 1", "Title")
- Metadata fields use standard names ("Created", "Likes")
- User fields prefixed with "User" ("User ID", "User Name")
- Reference fields may use ID suffixes ("Data ID")

This documentation is maintained alongside the codebase and should be updated when API changes are made.
