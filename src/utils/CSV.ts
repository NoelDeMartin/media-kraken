import parseCSV from 'csv-parse/lib/sync';

import Str from '@/utils/Str';

class CSV {

    public parse<T extends Record<string, unknown>>(csv: string): T[] {
        const rows = parseCSV(csv, {
            trim: true,
            skipEmptyLines: true,
            relaxColumnCount: true,
        }) as string[][];

        if (rows.length < 2)
            return [];

        const header = rows.shift()!.map(h => Str.camel(Str.slug(h)));

        return rows.map(row => {
            const item = {} as Record<string, unknown>;

            for (let i = 0; i < header.length; i++) {
                item[header[i]] = row[i];
            }

            return item as T;
        });
    }

}

export default new CSV();
