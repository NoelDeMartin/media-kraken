import { comboboxSelect, input, press, see } from '@aerogel/playwright';
import { test } from '@e2e/lib/setup';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('Adds shows from search', async ({ page }) => {
    await press(page, 'Press "s" to start searching');
    await input(page, 'Search movies and shows').fill('breaking bad');
    await press(page, 'Breaking Bad');
    await comboboxSelect(page, 'Status', 'Watching');
    await press(page, 'Add to collection');
    await see(page, 'Breaking Bad has been added to your collection!');
    await press(page, 'Breaking Bad');
    await see(page, 'Watching (7 new episodes)');
});

test('Views shows page', async ({ page }) => {
    await press(page, 'Press "s" to start searching');
    await input(page, 'Search movies and shows').fill('breaking bad');
    await press(page, 'Breaking Bad');
    await comboboxSelect(page, 'Status', 'Watching');
    await press(page, 'Add to collection');
    await see(page, 'Breaking Bad has been added to your collection!');

    await page.goto('/shows/breaking-bad-2008');
    await see(page, 'Seasons');
    await see(page, 'Season 1');
    await see(page, '0/7 episodes watched');
    await see(page, 'Pilot');
});
