import { RawLocation } from 'vue-router';

function redirectTo(publicPath: string, baseUrl: string) {
    if (location.href === baseUrl)
        return;

    const url = new URL(location.href);
    const searchParams: any = {};

    url.searchParams.forEach((value, key) => searchParams[key] = value);

    localStorage.setItem('github-pages-redirect', JSON.stringify({
        path: url.pathname.substr(publicPath.length),
        hash: url.hash,
        query: searchParams,
    } as RawLocation));

    location.href = baseUrl;
}

const publicPath = document.body.dataset.publicPath!;
const anchor = document.createElement('a') as HTMLAnchorElement;

anchor.href = publicPath;

redirectTo(publicPath, anchor.href);
