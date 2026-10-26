import { parseDate, required } from '@noeldemartin/utils';
import { z } from 'zod';

import { MAX_RATING, MIN_RATING } from '@/models/Rating';

import type { ExternalMedia } from './MediaParser';
import MediaParser from './MediaParser';

function parseRating(rating: string | undefined): number | undefined {
    const ratingText = rating?.trim();

    return ratingText ? Number(ratingText) : undefined;
}

function isValidRating(rating: string | undefined): boolean {
    const value = parseRating(rating);

    return value === undefined || (Number.isInteger(value) && value >= MIN_RATING && value <= MAX_RATING);
}

const RowSchema = z
    .object({
        name: z.string().optional(),
        date: z.string().optional(),
        imdb: z.string().optional(),
        rating: z
            .string()
            .optional()
            .refine(isValidRating, {
                message: `Rating must be a whole number between ${MIN_RATING} and ${MAX_RATING}`,
            }),
    })
    .refine((row) => !!row.name?.trim() || !!row.imdb?.trim(), {
        message: 'Either name or IMDb is required',
    });

export default class CustomParser extends MediaParser {
    static parse(csvRows: object[]): Promise<ExternalMedia[]> {
        const parser = new CustomParser();

        return parser.parse(csvRows);
    }

    async parse(csvRows: object[]): Promise<ExternalMedia[]> {
        const data: ExternalMedia[] = [];
        const parsedRows = csvRows.map((row) => RowSchema.safeParse(row));

        for (const [index, parsedRow] of parsedRows.entries()) {
            if (!parsedRow.success) {
                data.push({ validationError: parsedRow.error.message, raw: required(csvRows[index]) });

                continue;
            }

            const name = parsedRow.data.name?.trim() || undefined;
            const imdb = parsedRow.data.imdb?.trim();
            const imdbMatch = imdb?.match(/(?:title\/)?(tt\d+)/);
            const imdbId = (imdbMatch ? imdbMatch[1] : imdb) || undefined;
            const date = parsedRow.data.date?.trim();
            const watchedAt = date ? parseDate(date) : undefined;
            const rating = parseRating(parsedRow.data.rating);

            data.push({
                name,
                imdbId,
                watchedAt,
                rating,
                raw: parsedRow.data,
            });
        }

        return data;
    }
}
