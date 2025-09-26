export function updatePagedListField(current: any, targetId: string, field: "likes"|"comments"|"shares", inc: number) {
  const apply = (page: any) => !page?.records ? page : ({
    ...page,
    records: page.records.map((r: any) => r.id === targetId ? { ...r, fields: { ...r.fields, [field]: (r.fields[field] ?? 0) + inc } } : r)
  });
  return Array.isArray(current) ? current.map(apply) : apply(current);
}
