/**
 * SWR cache update utilities for optimistic updates and rollbacks.
 * Provides helpers for updating cached data after mutations.
 */

/**
 * Update a specific field in a paged list (for SWR infinite data).
 * Used for optimistic updates of likes, comments, shares in list views.
 */
export function updatePagedListField(
  current: any,
  targetId: string,
  field: "likes" | "comments" | "shares",
  increment: number
) {
  const apply = (page: any) => {
    if (!page?.records) return page;

    return {
      ...page,
      records: page.records.map((record: any) => {
        if (record.id === targetId) {
          return {
            ...record,
            fields: {
              ...record.fields,
              [field]: (record.fields[field] ?? 0) + increment,
            },
          };
        }
        return record;
      }),
    };
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
 */
export function addCommentToList(current: any, newComment: any) {
  if (!current?.records) return current;

  return {
    ...current,
    records: [newComment, ...current.records],
  };
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
 */
export function updateMultipleRecords(
  current: any,
  updates: Array<{ id: string; fields: Record<string, any> }>
) {
  const updateMap = new Map(updates.map((u) => [u.id, u.fields]));

  const apply = (page: any) => {
    if (!page?.records) return page;

    return {
      ...page,
      records: page.records.map((record: any) => {
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
      }),
    };
  };

  return Array.isArray(current) ? current.map(apply) : apply(current);
}
