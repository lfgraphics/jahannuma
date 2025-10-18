# Data Structure Fix for SWR Hooks

## Problem
The SWR hooks were expecting the old data structure where each page was directly `{ records: [...], offset: "..." }`, but the new API response structure wraps the data in a nested object:

```javascript
{
  data: {
    hasMore: true,
    offset: "itrpwZ4GFHcHHTkxN/recRI1KM1qjSSNXJ3",
    records: [...],
    userMetadata: {userId: 'user_33JZAojFo61jlb3D44yoU9aNagL'},
    success: true
  }
}
```

## Root Cause
The universal data fetcher and enhanced Airtable infrastructure now returns responses in a different format, but the existing hooks were still trying to access `page?.records` and `page?.offset` directly.

## Solution
Updated all affected hooks to handle both the old and new data structures by:

1. **Records Processing**: Changed from `page?.records` to `(page?.data || page)?.records`
2. **Pagination**: Changed from `page?.offset` to `(page?.data || page)?.offset`
3. **Optimistic Updates**: Updated all optimistic update functions to preserve the original data structure

## Fixed Hooks
- ✅ `useAshaarData.ts`
- ✅ `useEbooksData.ts`
- ✅ `useRubaiData.ts`
- ✅ `useNazmenData.ts`
- ✅ `useGhazlenData.ts`
- ✅ `useEnhancedAirtableList.ts`
- ✅ `useAirtableList.ts`

## Changes Made

### 1. Records Processing
**Before:**
```javascript
const records = useMemo(() => {
  return (swr.data ?? []).flatMap((page: any) => page?.records ?? []);
}, [swr.data]);
```

**After:**
```javascript
const records = useMemo(() => {
  return (swr.data ?? []).flatMap((page: any) => {
    // Handle new data structure where records are nested under 'data'
    const pageData = page?.data || page;
    return pageData?.records ?? [];
  });
}, [swr.data]);
```

### 2. Pagination (hasMore)
**Before:**
```javascript
const hasMore = useMemo(() => {
  return !!(swr.data && swr.data[swr.data.length - 1]?.offset);
}, [swr.data]);
```

**After:**
```javascript
const hasMore = useMemo(() => {
  if (!swr.data || swr.data.length === 0) return false;
  const lastPage = swr.data[swr.data.length - 1];
  // Handle new data structure where offset is nested under 'data'
  const pageData = lastPage?.data || lastPage;
  return !!(pageData?.offset);
}, [swr.data]);
```

### 3. Key Generation (getKey)
**Before:**
```javascript
const getKey = (pageIndex: number, previousPageData: any): string | null => {
  if (options.enabled === false) return null;
  if (previousPageData && !previousPageData.offset) return null; // reached end
  const offset = pageIndex === 0 ? undefined : previousPageData?.offset;
  // ...
};
```

**After:**
```javascript
const getKey = (pageIndex: number, previousPageData: any): string | null => {
  if (options.enabled === false) return null;
  
  // Handle new data structure where offset is nested under 'data'
  const pageData = previousPageData?.data || previousPageData;
  if (previousPageData && !pageData?.offset) return null; // reached end
  
  const offset = pageIndex === 0 ? undefined : pageData?.offset;
  // ...
};
```

### 4. Optimistic Updates
**Before:**
```javascript
updateRecord: (recordId: string, updates: Record<string, any>) => {
  swr.mutate(
    (pages: any[] | undefined) => {
      if (!pages) return pages;
      return pages.map((page: any) => ({
        ...page,
        records: (page.records || []).map((record: any) =>
          record.id === recordId
            ? { ...record, fields: { ...record.fields, ...updates } }
            : record
        ),
      }));
    },
    { revalidate: false }
  );
}
```

**After:**
```javascript
updateRecord: (recordId: string, updates: Record<string, any>) => {
  swr.mutate(
    (pages: any[] | undefined) => {
      if (!pages) return pages;
      return pages.map((page: any) => {
        // Handle new data structure where records are nested under 'data'
        const pageData = page?.data || page;
        const updatedRecords = (pageData?.records || []).map((record: any) =>
          record.id === recordId
            ? { ...record, fields: { ...record.fields, ...updates } }
            : record
        );
        
        // Preserve the original structure
        if (page?.data) {
          return {
            ...page,
            data: {
              ...pageData,
              records: updatedRecords,
            }
          };
        } else {
          return {
            ...page,
            records: updatedRecords,
          };
        }
      });
    },
    { revalidate: false }
  );
}
```

## Backward Compatibility
All fixes maintain backward compatibility by checking for both data structures:
- `page?.data || page` - tries new structure first, falls back to old
- This ensures the hooks work regardless of which API response format is received

## Testing
- ✅ All hooks compile without TypeScript errors
- ✅ Data structure handling is consistent across all hooks
- ✅ Optimistic updates preserve the correct data structure
- ✅ Pagination works with both old and new response formats

## Impact
This fix resolves the issue where:
- Ashaar page was showing empty records despite successful API calls
- E-Books and other content pages were returning blank arrays
- Pagination was not working correctly
- Optimistic updates were failing

The pages should now correctly display data and handle pagination as expected.