import { stringToCamelCase, stringToSlug } from '@noeldemartin/utils';
import { parse as parseCSV } from 'csv-parse/sync';

class CSV {
    public parse<T extends Record<string, unknown>>(csv: string): T[] {
        const rows = parseCSV(csv, {
            trim: true,
            skipEmptyLines: true,
            relaxColumnCount: true,
        }) as string[][];

        if (rows.length < 2) {
            return [];
        }

        const header = rows.shift()!.map((h) => stringToCamelCase(stringToSlug(h)));

        return rows.map((row) => {
            const item = {} as Record<string, unknown>;

            for (let i = 0; i < header.length; i++) {
                const headerKey = header[i];

                if (headerKey) {
                    item[headerKey] = row[i];
                }
            }

            return item as T;
        });
    }
}

export default new CSV();
