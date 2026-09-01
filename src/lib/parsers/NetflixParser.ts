import { parseDate, required } from '@noeldemartin/utils';
import { z } from 'zod';

import type { ExternalMedia } from './MediaParser';
import MediaParser from './MediaParser';
import NetflixDateParser from './NetflixDateParser';

const SHOW_TITLE_REGEX = /((season|series)\s+\d+|limited\s+series):/i;

const RowSchema = z.object({
    title: z.string(),
    date: z.string(),
});

export default class NetflixParser extends MediaParser {
    static parse(csvRows: object[]): Promise<ExternalMedia[]> {
        const parser = new NetflixParser();

        return parser.parse(csvRows);
    }

    async parse(csvRows: object[]): Promise<ExternalMedia[]> {
        const data: ExternalMedia[] = [];
        const parsedRows = csvRows.map((row) => RowSchema.safeParse(row));
        const dateParser = NetflixDateParser.fromDates(parsedRows.map((row) => row.data?.date).filter(Boolean));

        for (const [index, parsedRow] of parsedRows.entries()) {
            if (!parsedRow.success) {
                data.push({ validationError: parsedRow.error.message, raw: required(csvRows[index]) });

                continue;
            }

            if (SHOW_TITLE_REGEX.test(parsedRow.data.title)) {
                data.push({ skippedMessage: 'Not a movie', raw: parsedRow.data });

                continue;
            }

            data.push({
                name: parsedRow.data.title,
                type: 'movie',
                watchedAt: dateParser?.parseDate(parsedRow.data.date) ?? parseDate(parsedRow.data.date),
                raw: parsedRow.data,
            });
        }

        return data;
    }
}
