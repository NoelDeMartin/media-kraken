import JSZip from 'jszip';
import TheMovieDBApi, { TMDBMovie } from '@/api/TheMovieDBApi';

import Services from '@/services';

import MediaValidationError from '@/errors/MediaValidationError';
import MediaNotFoundError from '@/errors/MediaNotFoundError';

import Movie from '@/models/soukai/Movie';

import { MediaParser } from '@/utils/parsers';
import TMDBMoviesParser from '@/utils/parsers/TMDBMoviesParser';
import Str from '@/utils/Str';
import CSV from '@/utils/CSV';

interface LetterBoxdRow {
    name: string;
    year?: string | number | null;
    letterboxdUri?: string | null;
    date?: string | null; // exported "Date" column
    watchedDate?: string | null; // diary.csv's "Watched Date"
}

function parseDate(dateString?: string | null): Date | null {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
}

class LetterBoxdParser implements MediaParser<LetterBoxdRow, Movie> {
    public async validate(data: LetterBoxdRow): Promise<void> {
        if (typeof data.name !== 'string' || data.name.length < 3)
            throw new MediaValidationError(['Invalid format']);

        if (data.year && isNaN(parseInt(String(data.year))))
            throw new MediaValidationError(['Invalid year']);

        const dateToCheck = data.watchedDate ?? data.date;
        if (dateToCheck && parseDate(dateToCheck) === null)
            throw new MediaValidationError(['Invalid date']);

        if (await this.alreadyInCollection(data)) return;
    }

    public async parse(data: LetterBoxdRow): Promise<Movie> {
        const watchedAt = parseDate(data.watchedDate ?? data.date) ?? undefined;

        const slug = Str.slug(data.name);
        const { results } = await TheMovieDBApi.searchMovies(data.name);

        const match: TMDBMovie | undefined = results.find((result) => {
            if (!result.release_date) return false;

            if (Str.slug(result.title) !== slug) return false;

            if (data.year) {
                const resultYear = new Date(result.release_date).getFullYear();
                if (resultYear !== parseInt(String(data.year))) return false;
            }

            if (watchedAt && new Date(result.release_date) > watchedAt)
                return false;

            return true;
        });

        if (!match) throw new MediaNotFoundError('This movie could not be found');

        const movie = await TMDBMoviesParser.parse(match);

        movie.setRelationModels('actions', []);

        if (watchedAt) {
            movie.createdAt = watchedAt;
            movie.updatedAt = watchedAt;
            movie.watch(watchedAt);
        }

        if (data.letterboxdUri) movie.externalUrls.push(data.letterboxdUri);

        return movie;
    }

    /**
     * Extract CSV data from a Letterboxd export ZIP file.
     * Combines watched.csv and diary.csv, prioritizing watched date from diary.
     */
    public async extractAndPrepare(zipContent: ArrayBuffer): Promise<LetterBoxdRow[]> {
        const zip = new JSZip();
        await zip.loadAsync(zipContent);

        const watchedData = await this.extractCSV(zip, 'watched.csv');
        const diaryData = await this.extractCSV(zip, 'diary.csv');

        // Map diary entries by movie name for quick lookup
        const diaryMap = new Map<string, any>();
        for (const entry of diaryData) {
            const key = `${entry.name}|${entry.year || ''}`;
            diaryMap.set(key, entry);
        }

        const merged: LetterBoxdRow[] = [];
        for (const watchedEntry of watchedData) {
            const key = `${watchedEntry.name}|${watchedEntry.year || ''}`;
            const diaryEntry = diaryMap.get(key);

            const merged_entry: LetterBoxdRow = {
                name: watchedEntry.name,
                year: watchedEntry.year,
                letterboxdUri: watchedEntry.letterboxdUri,
                date: watchedEntry.date,
                // Prefer diary's watchedDate (actual date watched), fall back to watched.csv's date
                watchedDate: diaryEntry?.watchedDate || watchedEntry.date,
            };

            merged.push(merged_entry);
        }

        return merged;
    }

    private async extractCSV(zip: JSZip, filename: string): Promise<any[]> {
        // Find the file in the ZIP (may be nested in a dated subdirectory)
        let file: JSZip.JSZipObject | null = null;

        zip.forEach((relativePath: string, zipEntry: JSZip.JSZipObject) => {
            if (
                relativePath.endsWith(`/${filename}`) ||
                relativePath === filename
            ) {
                file = zipEntry;
            }
        });

        if (!file) {
            return [];
        }

        const csv = await (file as JSZip.JSZipObject).async('string');
        return CSV.parse<any>(csv);
    }

    private async alreadyInCollection(data: LetterBoxdRow): Promise<boolean> {
        const tmpMovie = new Movie({ title: data.name });
        tmpMovie.externalUrls = data.letterboxdUri ? [data.letterboxdUri] : [];
        tmpMovie.setRelationModels('actions', []);

        const collectionMovie = Services.$media.movies.find((collectionMovie) =>
            collectionMovie.is(tmpMovie),
        );

        return !!collectionMovie;
    }
}

export default new LetterBoxdParser();
