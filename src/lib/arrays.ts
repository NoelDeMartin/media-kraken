export function shuffle<T>(items: T[]): T[] {
    const shuffled = items.slice(0);

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [shuffled[j] as T, shuffled[i] as T];
    }

    return shuffled;
}
