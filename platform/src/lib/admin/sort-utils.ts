export function sortByCreatedDesc<T>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aTime = (a as Record<string, unknown>).createdAt
      ? new Date((a as Record<string, unknown>).createdAt as string).getTime()
      : 0;
    const bTime = (b as Record<string, unknown>).createdAt
      ? new Date((b as Record<string, unknown>).createdAt as string).getTime()
      : 0;
    return bTime - aTime;
  });
}
