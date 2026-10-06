import { arrayUnique } from '@noeldemartin/utils';

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

export function mergeExternalUrls(existingUrls: string[], newUrls: string[]): string[] {
    return arrayUnique([...existingUrls, ...newUrls], (url) => url.replace(/\/+$/, ''));
}
