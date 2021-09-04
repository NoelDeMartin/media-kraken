export interface UrlParts {
    protocol?: string;
    domain?: string;
    port?: string;
    path?: string;
    query?: string;
    fragment?: string;
}

class Url {

    public resolve(...parts: string[]): string {
        let url = parts.shift() as string;

        while (parts.length > 0) {
            const fragment = parts.shift() as string;

            if (fragment.startsWith('/')) {
                url = this.base(url) + fragment;
            } else if (fragment.startsWith('http://') || fragment.startsWith('https://')) {
                url = fragment;
            } else if (url.endsWith('/')) {
                url += fragment;
            } else {
                url += '/' + fragment;
            }
        }

        return url;
    }

    public resolveDirectory(...parts: string[]): string {
        const url = this.resolve(...parts);

        return url.endsWith('/') ? url : (url + '/');
    }

    public base(url: string): string {
        const protocolIndex = url.indexOf('://');
        const pathIndex = url.substr(protocolIndex + 3).indexOf('/');

        return pathIndex !== -1
            ? url.substring(0, protocolIndex + 3 + pathIndex)
            : url;
    }

    public filename(url: string): string {
        const pathIndex = url.lastIndexOf('/');

        return pathIndex !== -1 ? url.substr(pathIndex + 1) : '';
    }

    public parseRootDomain(url: string): string | null {
        const parts = this.parse(url);

        if (!parts || !parts.domain)
            return null;

        return parts.domain.split('.').slice(-2).join('.');
    }

    public parse(url: string): UrlParts | null {
        const match = url.trim().match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/);

        if (!match)
            return null;

        const host = match[4] || '';
        const [domain, port]: string[] = host.split(':');

        return {
            protocol: match[2] || undefined,
            domain: domain || undefined,
            port: port || undefined,
            path: match[5] || undefined,
            query: match[7] || undefined,
            fragment: match[9] || undefined,
        };
    }

}

export default new Url();
