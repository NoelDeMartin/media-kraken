import { PromisedValue, stringToCamelCase, stringToSlug } from '@noeldemartin/utils';
import Papa from 'papaparse';

export function parseCSV(file: File): Promise<object[]> {
    const promisedData = new PromisedValue<object[]>();

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => stringToCamelCase(stringToSlug(header)),
        complete({ data }) {
            promisedData.resolve(data as object[]);
        },
        error(error) {
            promisedData.reject(error);
        },
    });

    return promisedData;
}
