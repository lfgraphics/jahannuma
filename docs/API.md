# API Routes Documentation

## Overview

This document provides comprehensive documentation for all API routes in the Jahannuma platform. All routes follow RESTful conventions and provide consistent error handling and response formats.

## Base URL

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

## Response Format

All API responses follow a consistent format:

### Success Response

```typescript
{
  success: true,
  data: {
    // Response data
  }
}
```

### Error Response

```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: string
  }
}
```

## Content API Routes

### Ashaar (Poetry)

#### `GET /api/airtable/ashaar`

Fetch a paginated list of poetry records.

**Query Parameters:**

- `pageSize` (number, default: 20) - Number of records per page
- `offset` (string, optional) - Pagination offset token
- `filter` (string, optional) - Airtable filter formula
- `sort` (string, default: 'Created') - Sort field
- `view` (string, default: 'Main View') - Airtable view

**Response:**

```typescript
{
  success: true,
  data: {
    records: AshaarRecord[],
    offset?: string,
    hasMore: boolean,
    total: number,
    userMetadata?: { userId: string }
  }
}
```

**Example:**

```bash
GET /api/airtable/ashaar?pageSize=10&sort=Views&filter=AND({Status}="Published")
```

#### `GET /api/airtable/ashaar/[id]`

Fetch a specific poetry record by ID.

**Parameters:**

- `id` (string) - Airtable record ID

**Response:**

```typescript
{
  success: true,
  data: {
    record: AshaarRecord,
    userMetadata?: {
      userId: string,
      isLiked: boolean
    }
  }
}
```

**Example:**

```bash
GET /api/airtable/ashaar/recABC123XYZ
```

### Ghazlen (Ghazals)

#### `GET /api/airtable/ghazlen`

Fetch a paginated list of ghazal records.

**Query Parameters:** Same as Ashaar API

**Response:**

```typescript
{
  success: true,
  data: {
    records: GhazlenRecord[],
    offset?: string,
    hasMore: boolean,
    total: number,
    userMetadata?: { userId: string }
  }
}
```

#### `GET /api/airtable/ghazlen/[id]`

Fetch a specific ghazal record by ID.

**Response:**

```typescript
{
  success: true,
  data: {
    record: GhazlenRecord,
    userMetadata?: {
      userId: string,
      isLiked: boolean
    }
  }
}
```

### Nazmen (Nazms)

#### `GET /api/airtable/nazmen`

Fetch a paginated list of nazm records.

#### `GET /api/airtable/nazmen/[id]`

Fetch a specific nazm record by ID.

### Rubai

#### `GET /api/airtable/rubai`

Fetch a paginated list of rubai records.

#### `GET /api/airtable/rubai/[id]`

Fetch a specific rubai record by ID.

### E-Books

#### `GET /api/airtable/ebooks`

Fetch a paginated list of e-book records.

#### `GET /api/airtable/ebooks/[id]`

Fetch a specific e-book record by ID.

### Comments

#### `GET /api/airtable/comments`

Fetch comments for a specific content item.

**Query Parameters:**

- `contentType` (required) - Type of content (ashaar, ghazlen, nazmen, rubai)
- `contentId` (required) - ID of the content item
- `pageSize` (number, default: 20)
- `offset` (string, optional)

#### `POST /api/airtable/comments`

Create a new comment (requires authentication).

**Request Body:**

```typescript
{
  contentType: 'ashaar' | 'ghazlen' | 'nazmen' | 'rubai',
  contentId: string,
  comment: string,
  parentId?: string // For replies
}
```

#### `PUT /api/airtable/comments/[id]`

Update a comment (requires authentication and ownership).

#### `DELETE /api/airtable/comments/[id]`

Delete a comment (requires authentication and ownership).

## User API Routes

### Likes

#### `POST /api/user/likes`

Toggle like status for a content item (requires authentication).

**Request Body:**

```typescript
{
  contentType: 'ashaar' | 'ghazlen' | 'nazmen' | 'rubai',
  contentId: string
}
```

**Response:**

```typescript
{
  success: true,
  data: {
    isLiked: boolean,
    likeCount: number
  }
}
```

#### `GET /api/user/likes`

Get user's liked content (requires authentication).

**Query Parameters:**

- `contentType` (optional) - Filter by content type
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**

```typescript
{
  success: true,
  data: {
    likes: UserLike[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      hasMore: boolean
    }
  }
}
```

### Favorites

#### `POST /api/user/favorites`

Add/remove content from favorites (requires authentication).

#### `GET /api/user/favorites`

Get user's favorite content (requires authentication).

### Metadata

#### `GET /api/user/metadata`

Get user metadata and preferences (requires authentication).

#### `PUT /api/user/metadata`

Update user metadata and preferences (requires authentication).

## Search API Routes

### Global Search

#### `GET /api/search`

Search across all content types.

**Query Parameters:**

- `q` (required) - Search query
- `type` (optional) - Content type filter
- `author` (optional) - Author filter
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**

```typescript
{
  success: true,
  data: {
    results: SearchResult[],
    pagination: PaginationInfo,
    facets: {
      contentTypes: { [key: string]: number },
      authors: { [key: string]: number }
    }
  }
}
```

### Content-Specific Search

#### `GET /api/search/ashaar`

Search within poetry content only.

#### `GET /api/search/ghazlen`

Search within ghazal content only.

#### `GET /api/search/nazmen`

Search within nazm content only.

#### `GET /api/search/rubai`

Search within rubai content only.

## Analytics API Routes

### View Tracking

#### `POST /api/analytics/view`

Track content views for analytics.

**Request Body:**

```typescript
{
  contentType: string,
  contentId: string,
  metadata?: {
    referrer?: string,
    userAgent?: string
  }
}
```

### Popular Content

#### `GET /api/analytics/popular`

Get popular content based on views and engagement.

**Query Parameters:**

- `period` (optional) - Time period (day, week, month, year)
- `contentType` (optional) - Filter by content type
- `limit` (number, default: 10)

## Error Codes

### Common Error Codes

- `INVALID_REQUEST` - Malformed request or missing required parameters
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Request validation failed
- `RATE_LIMITED` - Too many requests
- `FETCH_FAILED` - Database operation failed
- `INTERNAL_ERROR` - Unexpected server error

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

API routes implement rate limiting to prevent abuse:

- **Authenticated users**: 1000 requests per hour
- **Anonymous users**: 100 requests per hour
- **Search endpoints**: 60 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Caching

### Client-Side Caching

All GET endpoints include appropriate cache headers:

```
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

### Server-Side Caching

- Content data: 5 minutes TTL
- User-specific data: 1 minute TTL
- Search results: 10 minutes TTL

## Authentication Examples

### Using with SWR

```typescript
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";

function useAshaarList() {
  const { getToken } = useAuth();

  return useSWR("/api/airtable/ashaar", async (url) => {
    const token = await getToken();
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  });
}
```

### Direct API Call

```typescript
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      },
      { status: 401 }
    );
  }

  // Handle authenticated request
}
```

## Testing

### Example Test Cases

```typescript
// Test successful content fetch
test("GET /api/airtable/ashaar returns paginated results", async () => {
  const response = await fetch("/api/airtable/ashaar?pageSize=5");
  const data = await response.json();

  expect(data.success).toBe(true);
  expect(data.data.records).toHaveLength(5);
  expect(data.data.hasMore).toBeDefined();
});

// Test authentication requirement
test("POST /api/user/likes requires authentication", async () => {
  const response = await fetch("/api/user/likes", {
    method: "POST",
    body: JSON.stringify({ contentType: "ashaar", contentId: "test" }),
  });

  expect(response.status).toBe(401);
});
```

## Migration Notes

### From Direct Airtable Calls

**Before:**

```typescript
// Direct Airtable API call in component
const records = await airtable("Ashaar").select().firstPage();
```

**After:**

```typescript
// Use API route with proper caching and error handling
const { data, error } = useSWR("/api/airtable/ashaar", fetcher);
```

### Benefits of API Route Architecture

1. **Security**: No client-side API key exposure
2. **Performance**: Server-side caching and optimization
3. **Reliability**: Centralized error handling
4. **Scalability**: Rate limiting and request optimization
5. **Maintainability**: Consistent response formats

## Monitoring and Logging

All API routes include comprehensive logging for monitoring:

```typescript
console.log(`API ${method} ${pathname}`, {
  userId,
  timestamp: new Date().toISOString(),
  params,
  duration: Date.now() - startTime,
});
```

Monitor key metrics:

- Response times
- Error rates
- Cache hit rates
- Rate limit violations

## Conclusion

This API architecture provides a secure, scalable, and maintainable foundation for the Jahannuma platform. The consistent patterns and comprehensive documentation ensure smooth development and integration across the entire application.
