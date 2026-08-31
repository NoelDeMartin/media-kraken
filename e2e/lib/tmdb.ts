import { fixture } from '@e2e/lib/fixtures';
import { stringToSlug } from '@noeldemartin/utils';
import type { Page } from '@playwright/test';

function handleRequest(url: URL) {
    if (url.pathname === '/3/search/multi' || url.pathname === '/3/search/movie') {
        return handleSearch(url.searchParams.get('query') ?? '');
    }

    const findMatch = url.pathname.match(/^\/3\/find\/([^/]+)$/);

    if (findMatch) {
        const fix = fixture(`/find/${findMatch[1]}.json`);

        if (fix) {
            return fix;
        }

        if (findMatch[1] === 'tt0245429') {
            return JSON.stringify({
                movie_results: [
                    {
                        id: 129,
                        title: 'Spirited Away',
                        overview: 'A young girl, Sen, enters a world ruled by gods, witches, and spirits.',
                        release_date: '2001-07-20',
                        poster_path: '/39wmItE313P3YUdR3R3C3m9SS23.jpg',
                    },
                ],
                tv_results: [],
                person_results: [],
            });
        }

        return null;
    }

    const showMatch = url.pathname.match(/^\/3\/tv\/(\d+)$/);

    if (showMatch) {
        return fixture(`/tv/${showMatch[1]}.json`);
    }

    const externalIdsMatch = url.pathname.match(/^\/3\/tv\/(\d+)\/external_ids$/);

    if (externalIdsMatch) {
        return fixture(`/tv/${externalIdsMatch[1]}/external_ids.json`);
    }

    const seasonMatch = url.pathname.match(/^\/3\/tv\/(\d+)\/season\/(\d+)$/);

    if (seasonMatch) {
        return fixture(`/tv/${seasonMatch[1]}/season/${seasonMatch[2]}.json`);
    }

    return null;
}

function handleSearch(query: string) {
    const slug = stringToSlug(query);

    return (
        fixture(`/search/${slug}.json`) ?? JSON.stringify({ results: [], page: 1, total_results: 0, total_pages: 1 })
    );
}

export async function interceptTMDBRequests(page: Page) {
    await page.route('https://api.themoviedb.org/**', (route) => {
        const url = new URL(route.request().url());
        const response = handleRequest(url);

        if (!response) {
            return route.fulfill({ status: 404 });
        }

        return route.fulfill({
            status: 200,
            body: response,
        });
    });
}
