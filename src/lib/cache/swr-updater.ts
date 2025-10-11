/**
 * SWR cache update utilities for optimistic updates and rollbacks.
 * Provides helpers for updating cached data after mutations.
 */

/**
 * Update a specific field in a paged list (for SWR infinite data).
 * Used for optimistic updates of likes, comments, shares in list views.
 * Supports both legacy { records } and new { success, data: { records } } response shapes.
 */
export function updatePagedListField(
  current: any,
  targetId: string,
  field: "likes" | "comments" | "shares",
  increment: number
) {
  const apply = (page: any) => {
    const container = page?.data ?? page; // support both
    const records = container?.records;
    if (!records) return page;
    
    const newRecords = records.map((r: any) => 
      r.id === targetId 
        ? { ...r, fields: { ...r.fields, [field]: (r.fields[field] ?? 0) + increment } } 
        : r
    );
    
    return container === page.data 
      ? { ...page, data: { ...page.data, records: newRecords } } 
      : { ...page, records: newRecords };
  };

  return Array.isArray(current) ? current.map(apply) : apply(current);
}

/**
 * Update a single record field in cached data.
 * Used for optimistic updates of individual record views.
 */
export function updateRecordField(
  current: any,
  field: "likes" | "comments" | "shares",
  increment: number
) {
  if (!current) return current;

  return {
    ...current,
    fields: {
      ...current.fields,
      [field]: (current.fields[field] ?? 0) + increment,
    },
  };
}

/**
 * Add a new comment to a cached comments list.
 * Used for optimistic updates when adding comments.
 * Supports both legacy { records } and new { success, data: { records } } response shapes.
 */
export function addCommentToList(current: any, newComment: any) {
  const container = current?.data ?? current; // support both
  const records = container?.records;
  if (!records) return current;

  const newRecords = [newComment, ...records];
  
  return container === current?.data
    ? { ...current, data: { ...current.data, records: newRecords } }
    : { ...current, records: newRecords };
}

/**
 * Update multiple fields in a record.
 * Used for complex optimistic updates.
 */
export function updateRecordFields(current: any, updates: Record<string, any>) {
  if (!current) return current;

  return {
    ...current,
    fields: {
      ...current.fields,
      ...updates,
    },
  };
}

/**
 * Update multiple records in a paged list.
 * Used when multiple records need to be updated simultaneously.
 * Supports both legacy { records } and new { success, data: { records } } response shapes.
 */
export function updateMultipleRecords(
  current: any,
  updates: Array<{ id: string; fields: Record<string, any> }>
) {
  const updateMap = new Map(updates.map((u) => [u.id, u.fields]));

  const apply = (page: any) => {
    const container = page?.data ?? page; // support both
    const records = container?.records;
    if (!records) return page;

    const newRecords = records.map((record: any) => {
      const update = updateMap.get(record.id);
      if (update) {
        return {
          ...record,
          fields: {
            ...record.fields,
            ...update,
          },
        };
      }
      return record;
    });

    return container === page.data
      ? { ...page, data: { ...page.data, records: newRecords } }
      : { ...page, records: newRecords };
  };

  return Array.isArray(current) ? current.map(apply) : apply(current);
}
