import { createModel, input, press, see } from '@aerogel/playwright';
import { test } from '@e2e/lib/setup';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
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
    await page.goto('/movies');
    await see(page, 'The Matrix (Watched)');
});

test('Marks movies as watched from collection', async ({ page }) => {
    await page.goto('/movies');
    await createModel(page, 'Movie', { title: 'The Matrix' });
    await press(page, 'Watch');
    await see(page, 'The Matrix (Watched)');
});

test('Marks movies as watched from details page', async ({ page }) => {
    await page.goto('/movies');
    await createModel(page, 'Movie', { title: 'The Matrix' });
    await press(page, 'The Matrix');
    await press(page, 'Open actions menu');
    await press(page, 'Watch');
    await see(page, 'Watched');
});

test('Imports movies from JSON-LD', async ({ page }) => {
    await press(page, "Yes, I have some content I'd like to import");
    await press(page, 'JSON-LD');
    await page.setInputFiles('input[type="file"]', 'e2e/fixtures/collection.json');

    await see(page, '1 watched movies have been added to your collection.');
    await see(page, '1 movies have been added to your collection to watch later.');

    await press(page, 'OK');
    await see(page, 'Symbol (Watched)');
    await see(page, 'Jaws (Pending)');
});

test('Imports movies from IMDb', async ({ page }) => {
    await page.goto('/movies');
    await press(page, 'Open actions menu');
    await press(page, 'Import movies');
    await press(page, 'IMDb');
    await page.locator('textarea').fill('https://www.imdb.com/title/tt0245429');
    await press(page, 'Import Movies');

    await see(page, '1 movies have been added to your collection to watch later.');
    await press(page, 'OK');
});
