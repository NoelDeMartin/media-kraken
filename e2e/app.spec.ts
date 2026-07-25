import { see, test } from '@aerogel/playwright';

test('Welcome', async ({ page }) => {
    await page.goto('/');
    await see(page, 'Welcome to your new app');
});
