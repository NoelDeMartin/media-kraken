import { comboboxSelect, createModel, dontSee, input, press, see } from '@aerogel/playwright';
import { expect, test } from '@e2e/lib/setup';

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

test('Rates movies', async ({ page }) => {
    await createModel(page, 'Movie', { title: 'The Matrix' });
    await press(page, 'The Matrix');
    await dontSee(page, 'Rate 3.5 out of 5');

    await press(page, 'Open actions menu');
    await press(page, 'Mark as watched');
    await press(page, 'Rate 3.5 out of 5');
    await expect(page.getByRole('radio', { name: 'Rate 3.5 out of 5' })).toBeChecked();

    await page.goto('/movies?view=table');
    await see(page, 'Rated 3.5 out of 5', { srOnly: true });

    await page.goto('/movies?view=table&rating=8-10');
    await see(page, 'Movies (0)');

    await page.goto('/movies?view=table&rating=6-8');
    await see(page, 'Movies (1)');
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
    await expect(page).toHaveURL(/\/movies\?q=matr$/);

    await page.reload();
    await see(page, 'Movies (1)');
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
    await expect(page).toHaveURL(/\/movies\?watched=true$/);

    await page.goto('/movies?watched=false');
    await see(page, 'Movies (1)');
    await see(page, 'Inception');
    await dontSee(page, 'The Matrix');
});

test('Paginates movies table', async ({ page }) => {
    for (let index = 1; index <= 11; index++) {
        await createModel(page, 'Movie', { title: `Movie ${index}` });
    }

    await see(page, 'Movies (11)');
    await press(page, 'View as list');
    await see(page, 'Showing 1 to 10 of 11 movies');
    await expect(page).toHaveURL(/\/movies\?view=table$/);

    await press(page, '2', { role: 'button' });
    await see(page, 'Showing 11 to 11 of 11 movies');
    await expect(page).toHaveURL(/\/movies\?view=table&page=2$/);

    await page.reload();
    await see(page, 'Showing 11 to 11 of 11 movies');

    await press(page, 'Filter movies by title');
    await input(page, 'Movies filter').fill('movie 1');
    await see(page, 'Movies (3)');
    await see(page, 'Movie 10');
    await expect(page).toHaveURL(/\/movies\?view=table&q=movie(\+|%20)1$/);
});

test('Identifies a movie', async ({ page }) => {
    await createModel(page, 'Movie', { title: 'The Matrix' });
    await press(page, 'The Matrix');
    await press(page, 'Open actions menu');
    await press(page, 'Identify');
    await press(page, 'Identify with The Matrix');
    await see(page, 'The Matrix (1999)');
});

test('Deletes movies', async ({ page }) => {
    await createModel(page, 'Movie', { title: 'Inception' });
    await press(page, 'Inception');
    await press(page, 'Open actions menu');
    await press(page, 'Delete');
    await press(page, 'Delete', { role: 'button' });
    await see(page, 'Inception has been deleted.');
    await see(page, 'Movies (0)');
});
