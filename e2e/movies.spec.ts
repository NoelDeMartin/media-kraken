import { createModel, input, press, see } from '@aerogel/playwright';
import { test } from '@e2e/lib/setup';

test.beforeEach(async ({ page }) => {
    await page.goto('/movies');
});

test('Adds movies from search', async ({ page }) => {
    await press(page, 'Press "s" to start searching');
    await input(page, 'Search movies and shows').fill('matrix');
    await press(page, 'The Matrix');
    await press(page, 'Watch later');
    await see(page, 'The Matrix has been added to your collection!');
});

test('Adds watched movies from search', async ({ page }) => {
    await press(page, 'Press "s" to start searching');
    await input(page, 'Search movies and shows').fill('matrix');
    await press(page, 'The Matrix');
    await press(page, 'Watched');
    await see(page, 'The Matrix has been added to your collection!');
    await see(page, 'The Matrix (Watched)');
});

test('Marks movies as watched from collection', async ({ page }) => {
    await createModel(page, 'Movie', { title: 'The Matrix' });
    await press(page, 'Watch');
    await see(page, 'The Matrix (Watched)');
});

test('Marks movies as watched from details page', async ({ page }) => {
    await createModel(page, 'Movie', { title: 'The Matrix' });
    await press(page, 'The Matrix');
    await press(page, 'Open actions menu');
    await press(page, 'Watch');
    await see(page, 'Watched');
});
