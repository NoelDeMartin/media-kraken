import { fixture } from '@e2e/lib/fixtures';
import { stringToSlug } from '@noeldemartin/utils';
import type { Page } from '@playwright/test';

function handleRequest(url: URL) {
    if (url.pathname === '/3/search/multi') {
        return handleSearch(url.searchParams.get('query') ?? '');
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
