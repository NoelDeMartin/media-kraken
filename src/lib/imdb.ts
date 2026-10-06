export function imdbUrl(imdbId: string): string {
    return `https://www.imdb.com/title/${imdbId}/`;
}

export function parseImdbId(url: string): string | null {
    const id = url.split('/').filter(Boolean).pop();

    return id?.split(/[?#]/)[0] ?? null;
}
