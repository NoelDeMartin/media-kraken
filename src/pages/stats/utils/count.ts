export function countEntries<T>(items: T[]): Map<T, number> {
    const counts = new Map<T, number>();

    for (const item of items) {
        counts.set(item, (counts.get(item) ?? 0) + 1);
    }

    return counts;
}
