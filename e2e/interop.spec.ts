import {
    interceptRequests,
    localFirstLogin,
    podUrl,
    press,
    see,
    solidCreateDocument,
    solidReset,
    solidUpdateDocument,
    waitSync,
} from '@aerogel/playwright';
import { requiredFixture } from '@e2e/lib/fixtures';
import { expect, test } from '@e2e/lib/setup';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
    await solidReset();
    await page.goto('/');
});

test('Update movies with legacy data', async ({ page }) => {
    // Populate POD & Log in
    await solidUpdateDocument('/profile/card', requiredFixture('/sparql/declare-preferences-file.sparql'));
    await solidCreateDocument('/settings/preferences', requiredFixture('/turtle/preferences.ttl'));
    await solidCreateDocument('/settings/privateTypeIndex', requiredFixture('/turtle/type-index.ttl'));
    await solidCreateDocument('/movies/the-matrix-1999.ttl', requiredFixture('/turtle/the-matrix-1999-legacy.ttl'));
    await localFirstLogin(page);

    // Synchronize metadata
    const updateDocument = interceptRequests(page, 'PATCH', podUrl('/movies/the-matrix-1999.ttl'));

    await press(page, 'My Movies');
    await press(page, 'The Matrix');
    await press(page, 'Open actions menu');
    await press(page, 'Synchronize metadata');
    await waitSync(page);

    expect(updateDocument.all).toHaveLength(1);
    expect(updateDocument.nth(1)?.body).toEqualSparql(requiredFixture('/sparql/sync-legacy-movie.sparql'));

    // Watch movie
    await press(page, 'Open actions menu');
    await press(page, 'Mark as watched');
    await waitSync(page);

    expect(updateDocument.all).toHaveLength(2);
    expect(updateDocument.nth(2)?.body).toEqualSparql(
        requiredFixture('/sparql/watch-movie.sparql', {
            actionHash: '[[watch-action][%uuid%]]',
            endTime: '[[.*]]',
            createdAt: '[[createdAt][.*]]',
        }),
    );

    await see(page, 'Watched');
});
