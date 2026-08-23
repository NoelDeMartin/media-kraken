import { test as baseTest, expect } from '@aerogel/playwright';

import { interceptTMDBRequests } from './tmdb';

export const test = baseTest.extend({
    page: async ({ page }, use) => {
        await interceptTMDBRequests(page);
        await use(page);
    },
});

export { expect };
