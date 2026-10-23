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

test.describe.configure({ mode: 'serial' });

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

test('Creates lists', async ({ page }) => {
    const listRequests = interceptRequests(page, 'PATCH', podUrl('/lists/*'));
    const registerContainer = interceptRequests(page, 'PATCH', podUrl('/settings/privateTypeIndex'));

    // Import movie
    await localFirstLogin(page);
    await press(page, 'Press "s" to start searching');
    await input(page, 'Search movies and shows').fill('matrix');
    await press(page, 'The Matrix');
    await press(page, 'Watched');
    await waitSync(page);

    // Create list
    await press(page, 'My Lists');
    await press(page, 'New list');
    await input(page, 'Name').fill('Favorites');
    await press(page, 'Create', { role: 'button' });
    await waitSync(page);

    expect(registerContainer.all).toHaveLength(2);
    expect(registerContainer.nth(2)?.body).toContain('<https://schema.org/ItemList>');
    expect(registerContainer.nth(2)?.body).toContain(podUrl('/lists/'));
    expect(listRequests.all).toHaveLength(1);
    expect(listRequests.nth(1)?.url).toEqual(podUrl('/lists/favorites'));
    expect(listRequests.nth(1)?.body).toEqualSparql(
        requiredFixture('/sparql/create-list.sparql', { name: 'Favorites' }),
    );

    // Add items
    await press(page, 'Add items');
    await press(page, 'Add The Matrix');
    await page.keyboard.press('Escape');
    await waitSync(page);

    expect(listRequests.all).toHaveLength(2);
    expect(listRequests.nth(2)?.url).toEqual(podUrl('/lists/favorites'));
    expect(listRequests.nth(2)?.body).toEqualSparql(
        requiredFixture('/sparql/add-list-item.sparql', {
            name: 'Favorites',
            mediaUrl: podUrl('/movies/the-matrix-1999#it'),
        }),
    );
});

test('Uploads lists created before logging in', async ({ page }) => {
    const createList = interceptRequests(page, 'PUT', podUrl('/lists/*'));
    const patchList = interceptRequests(page, 'PATCH', podUrl('/lists/*'));

    // Create list offline
    await press(page, 'Press "s" to start searching');
    await input(page, 'Search movies and shows').fill('matrix');
    await press(page, 'The Matrix');
    await press(page, 'Watched');
    await press(page, 'My Lists');
    await press(page, 'New list');
    await input(page, 'Name').fill('Favorites');
    await press(page, 'Create', { role: 'button' });
    await press(page, 'Add items');
    await press(page, 'Add The Matrix');
    await page.keyboard.press('Escape');

    // Log in
    await localFirstLogin(page);

    const requests = [...createList.all, ...patchList.all];

    expect(requests.map((request) => request?.url)).toContain(podUrl('/lists/favorites'));
    expect(requests.map((request) => request?.body).join('\n')).toContain(podUrl('/movies/the-matrix-1999#it'));

    await press(page, 'My Lists');
    await see(page, 'Favorites');
    await see(page, '1 item');
    await press(page, 'Favorites');
    await see(page, 'The Matrix');
});

test('Pulls in existing lists & updates', async ({ page }) => {
    // Populate POD & Log in
    await solidUpdateDocument('/profile/card', requiredFixture('/sparql/declare-type-index.sparql'));
    await solidCreateDocument('/settings/privateTypeIndex', requiredFixture('/turtle/type-index.ttl'));
    await solidCreateDocument('/movies/the-substance-2024', requiredFixture('/turtle/the-substance-2024.ttl'));
    await solidCreateDocument('/lists/favorites', requiredFixture('/turtle/favorites-list.ttl'));
    await localFirstLogin(page);

    // See lists
    await press(page, 'My Lists');
    await see(page, 'Favorites');
    await see(page, '1 item');
    await press(page, 'Favorites');
    await see(page, 'The Substance');

    // Prepare updates
    await solidUpdateDocument('/lists/favorites', requiredFixture('/sparql/rename-list.sparql'));

    // Pull updates
    await press(page, 'Open account');
    await press(page, 'Synchronize', { role: 'button' });
    await waitSync(page);
    await page.keyboard.press('Escape');

    await see(page, 'All-time favorites (1)');
    await press(page, 'My Lists');
    await see(page, 'All-time favorites');
});
