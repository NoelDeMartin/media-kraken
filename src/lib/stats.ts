export interface MediaStatsEntry<T> {
    key: T;
    count: number;
}

export function countEntries<T>(items: T[]): Map<T, number> {
    const counts = new Map<T, number>();

    for (const item of items) {
        counts.set(item, (counts.get(item) ?? 0) + 1);
    }

    return counts;
}

export function sortedEntries<T>(items: T[]): MediaStatsEntry<T>[] {
    return Array.from(countEntries(items).entries())
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count);
}
