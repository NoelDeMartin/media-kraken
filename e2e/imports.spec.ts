import { input, press, see } from '@aerogel/playwright';
import { test } from '@e2e/lib/setup';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('Imports movies from IMDb', async ({ page }) => {
    await press(page, "Yes, I have some content I'd like to import");
    await press(page, 'IMDb');
    await input(page, 'Urls').fill('https://www.imdb.com/title/tt0073195/');
    await press(page, 'Import');
    await see(page, '1 movie has been added to watch later.');

    await page.goto('/movies');
    await see(page, 'Jaws (Pending)');
});

test('Imports movies from Netflix', async ({ page }) => {
    await press(page, "Yes, I have some content I'd like to import");
    await press(page, 'Netflix');
    await page.setInputFiles('input[type="file"]', 'e2e/fixtures/imports/netflix.csv');
    await see(page, '1 watched movie has been added.');
    await see(page, '17 were ignored.');
    await see(page, '8 failed on import.');

    await page.goto('/movies');
    await see(page, 'Jaws (Watched)');
});

test('Imports movies from CSV', async ({ page }) => {
    await press(page, "Yes, I have some content I'd like to import");
    await press(page, 'Others');
    await page.setInputFiles('input[type="file"]', 'e2e/fixtures/imports/custom.csv');
    await see(page, '1 movie has been added to watch later.');

    await page.goto('/movies');
    await see(page, 'Jaws (Pending)');
});
