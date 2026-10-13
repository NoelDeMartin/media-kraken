import { createModel, press, see } from '@aerogel/playwright';
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

test('Shows watching stats', async ({ page }) => {
    const movie = await createModel(page, 'Movie', {
        title: 'The Matrix',
        releaseDate: new Date('1999-03-31'),
        genreUrls: ['https://www.themoviedb.org/genre/878'],
        countryUrls: ['http://www.wikidata.org/entity/Q30'],
        languages: ['en'],
        duration: 'PT2H16M',
    });

    await movie.watch();

    await page.goto('/stats');
    await see(page, "You're just Getting Started");
    await see(page, '2 hours');
    await see(page, 'Science Fiction');
    await see(page, 'United States');
    await see(page, '1990s');

    await press(page, 'Shows (0)', { role: 'radio' });
    await see(page, 'Nothing to show yet');
});
