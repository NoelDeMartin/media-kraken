import { comboboxSelect, createModel, dontSee, input, press, see } from '@aerogel/playwright';
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
    await press(page, 'Mark The Matrix as watched');
    await see(page, 'The Matrix (Watched)');
});

test('Marks movies as watched from details page', async ({ page }) => {
    await createModel(page, 'Movie', { title: 'The Matrix' });
    await press(page, 'The Matrix');
    await press(page, 'Open actions menu');
    await press(page, 'Mark as watched');
    await see(page, 'Watched');
});

test('Filters movies by title', async ({ page }) => {
    await createModel(page, 'Movie', { title: 'The Matrix' });
    await createModel(page, 'Movie', { title: 'Inception' });
    await see(page, 'Movies (2)');

    await press(page, 'Filter movies by title');
    await input(page, 'Movies filter').fill('matr');
    await see(page, 'Movies (1)');
    await see(page, 'The Matrix (Pending)');
    await dontSee(page, 'Inception');
});

test('Filters movies with advanced filters', async ({ page }) => {
    await createModel(page, 'Movie', { title: 'The Matrix' });
    await createModel(page, 'Movie', { title: 'Inception' });
    await press(page, 'Mark The Matrix as watched');
    await see(page, 'The Matrix (Watched)');
    await see(page, 'Movies (2)');

    await press(page, 'Advanced movie filters');
    await comboboxSelect(page, 'Watch status', 'Watched');
    await press(page, 'Apply');
    await see(page, 'Movies (1)');
    await see(page, 'The Matrix (Watched)');
    await dontSee(page, 'Inception');
});
