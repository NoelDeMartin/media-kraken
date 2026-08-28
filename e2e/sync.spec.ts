import {
    input,
    interceptRequests,
    podUrl,
    press,
    localFirstLogin,
    solidReset,
    waitSync,
    solidCreateDocument,
    see,
    solidUpdateDocument,
} from '@aerogel/playwright';
import { requiredFixture } from '@e2e/lib/fixtures';
import { test, expect } from '@e2e/lib/setup';

test.beforeEach(async ({ page }) => {
    await solidReset();
    await page.goto('/');
});

test('Imports a movie from tmdb', async ({ page }) => {
    const createDocument = interceptRequests(page, 'PATCH', podUrl('/movies/*'));
    const registerContainer = interceptRequests(page, 'PATCH', podUrl('/settings/privateTypeIndex'));

    await localFirstLogin(page);
    await press(page, 'Press "s" to start searching');
    await input(page, 'Search movies and shows').fill('matrix');
    await press(page, 'The Matrix');
    await press(page, 'Watched');
    await waitSync(page);

    expect(registerContainer.all).toHaveLength(1);
    expect(registerContainer.nth(1)?.body).toContain(podUrl('/movies/'));
    expect(createDocument.all).toHaveLength(1);
    expect(createDocument.nth(1)?.url).toEqual(podUrl('/movies/the-matrix-1999'));
    expect(createDocument.nth(1)?.body).toEqualSparql(
        requiredFixture('/sparql/create-watched-movie.sparql', {
            name: 'The Matrix',
        }),
    );
});

test('Pulls in existing movies & updates', async ({ page }) => {
    // Populate POD & Log in
    await solidUpdateDocument('/profile/card', requiredFixture('/sparql/declare-type-index.sparql'));
    await solidCreateDocument('/settings/privateTypeIndex', requiredFixture('/turtle/type-index.ttl'));
    await solidCreateDocument('/movies/the-substance-2024', requiredFixture('/turtle/the-substance-2024.ttl'));
    await localFirstLogin(page);

    // See movies
    await press(page, 'My Movies');
    await see(page, 'The Substance');

    // Prepare updates
    await solidUpdateDocument('/movies/the-substance-2024', requiredFixture('/sparql/watch-movie.sparql'));

    // Pull updates
    await press(page, 'Open account');
    await press(page, 'Synchronize', { role: 'button' });
    await waitSync(page);

    await see(page, 'The Substance (Watched)');
});
