// Returns the first item with the highest value, or null if the array is empty.
export function arrayMax<T>(items: T[], value: (item: T) => number): T | null {
    return items.reduce<T | null>((max, item) => (max === null || value(item) > value(max) ? item : max), null);
}

export function shuffle<T>(items: T[]): T[] {
    const shuffled = items.slice(0);

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [shuffled[j] as T, shuffled[i] as T];
    }

    return shuffled;
}
