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

    public parentDirectory(url: string): string {
        if (url.endsWith('/')) {
            url = url.substring(0, url.length - 1);
        }

        const pathIndex = url.lastIndexOf('/');

        return pathIndex !== -1 ? url.substr(0, pathIndex + 1) : url;
    }

    public filename(url: string): string {
        const pathIndex = url.lastIndexOf('/');

        return pathIndex !== -1 ? url.substr(pathIndex + 1) : '';
    }

}

export default new Url();
