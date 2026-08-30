export function findExternalId<T>(prefix: string, urls: string[], parser: (url: string) => T | null): T | null {
    for (const url of urls) {
        if (!url.startsWith(prefix)) {
            continue;
        }

        const id = parser(url);

        if (!id) {
            continue;
        }

        return id;
    }

    return null;
}

export function parseTmdbId(url: string): number | null {
    const id = url.split('/').filter(Boolean).pop()?.replace(/\D/g, '').trim();

    return id ? Number(id) : null;
}

export function parseImdbId(url: string): string | null {
    const id = url.split('/').filter(Boolean).pop();

    return id?.split(/[?#]/)[0] ?? null;
}
