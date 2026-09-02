import { press, see } from '@aerogel/playwright';
import { test } from '@e2e/lib/setup';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('Seeds sample media', async ({ page }) => {
    await press(page, 'No, just give me something to watch');
    await press(page, 'Add the top 100 rated movies from IMDb to my collection');
    await see(page, 'Prepare the popcorn');
    await see(page, 'The Shawshank Redemption (Pending)');
});
