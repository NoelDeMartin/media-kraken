export const TMDB_IMAGE_SIZE_SHORTHANDS = {
    small: 'w92',
    medium: 'w185',
    large: 'w500',
} as const;

export type TMDBImageSize = keyof typeof TMDB_IMAGE_SIZE_SHORTHANDS;

function tmdbImageUrl(path: string | null | undefined, size: TMDBImageSize): string | undefined {
    return path ? `https://image.tmdb.org/t/p/${TMDB_IMAGE_SIZE_SHORTHANDS[size]}${path}` : undefined;
}

export function tmdbMovieUrl(id: number | string): string {
    return `https://www.themoviedb.org/movie/${id}`;
}

export function tmdbShowUrl(id: number | string): string {
    return `https://www.themoviedb.org/tv/${id}`;
}

export function tmdbPersonUrl(id: number | string): string {
    return `https://www.themoviedb.org/person/${id}`;
}

export function tmdbGenreUrl(id: number | string): string {
    return `https://www.themoviedb.org/genre/${id}`;
}

export function tmdbPosterUrl(posterPath?: string | null, size: TMDBImageSize = 'large'): string | undefined {
    return tmdbImageUrl(posterPath, size);
}

export function tmdbBackdropUrl(backdropPath?: string | null, size: TMDBImageSize = 'large'): string | undefined {
    return tmdbImageUrl(backdropPath, size);
}

export function tmdbProfileUrl(profilePath?: string | null, size: TMDBImageSize = 'medium'): string | undefined {
    return tmdbImageUrl(profilePath, size);
}

export function parseTmdbId(url: string): number | null {
    const id = url.split('/').filter(Boolean).pop()?.replace(/\D/g, '').trim();

    return id ? Number(id) : null;
}
