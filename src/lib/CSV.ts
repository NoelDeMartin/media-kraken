import { stringToCamelCase, stringToSlug } from '@noeldemartin/utils';

class CSV {
    public parse<T extends Record<string, unknown>>(csvText: string): T[] {
        const rows = this.parseRows(csvText);

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

    private parseRows(text: string): string[][] {
        const rows: string[][] = [];
        let currentRow: string[] = [];
        let currentCell = '';
        let inQuotes = false;

        // Normalize newlines
        const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        for (let i = 0; i < cleanText.length; i++) {
            const char = cleanText[i];
            const nextChar = cleanText[i + 1];

            if (inQuotes) {
                if (char === '"') {
                    if (nextChar === '"') {
                        currentCell += '"';
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    currentCell += char;
                }
            } else {
                if (char === '"') {
                    inQuotes = true;
                } else if (char === ',') {
                    currentRow.push(currentCell.trim());
                    currentCell = '';
                } else if (char === '\n') {
                    currentRow.push(currentCell.trim());
                    if (currentRow.some((cell) => cell.length > 0)) {
                        rows.push(currentRow);
                    }
                    currentRow = [];
                    currentCell = '';
                } else {
                    currentCell += char;
                }
            }
        }

        if (currentCell.length > 0 || currentRow.length > 0) {
            currentRow.push(currentCell.trim());
            if (currentRow.some((cell) => cell.length > 0)) {
                rows.push(currentRow);
            }
        }

        return rows;
    }
}

export default new CSV();
