import {
    podUrl,
    press,
    localFirstLogin,
    solidReset,
    solidCreateDocument,
    see,
    solidUpdateDocument,
    webId,
} from '@aerogel/playwright';
import { requiredFixture } from '@e2e/lib/fixtures';
import { test, expect } from '@e2e/lib/setup';
import { asBob, solidMakePublic } from '@e2e/lib/solid';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
    await solidReset();
    await page.goto('/');
});

test('Discover friend lists', async ({ page }) => {
    // Populate PODs & Log in
    await asBob(async () => {
        await solidReset();
        await solidUpdateDocument(
            '/profile/card',
            requiredFixture('/sparql/declare-public-type-index.sparql', {
                webId: webId(),
                publicTypeIndex: podUrl('/settings/publicTypeIndex'),
            }),
        );
        await solidCreateDocument(
            '/settings/publicTypeIndex',
            requiredFixture('/turtle/discovery-public-type-index.ttl'),
        );
        await solidCreateDocument('/lists/favorites', requiredFixture('/turtle/favorites-list.ttl'));
        await solidCreateDocument('/lists/groceries', requiredFixture('/turtle/empty-list.ttl', { name: 'Groceries' }));
        await solidMakePublic('/settings/publicTypeIndex');
        await solidMakePublic('/lists/favorites');
        await solidMakePublic('/lists/groceries');
    });
    await solidUpdateDocument('/profile/card', requiredFixture('/sparql/add-friend.sparql'));
    await solidUpdateDocument(
        '/profile/card',
        requiredFixture('/sparql/declare-preferences-file.sparql', {
            preferencesFile: podUrl('/settings/preferences'),
        }),
    );
    await solidCreateDocument('/settings/preferences', requiredFixture('/turtle/preferences.ttl'));
    await solidCreateDocument('/settings/privateTypeIndex', requiredFixture('/turtle/type-index.ttl'));
    await solidCreateDocument('/lists/favorites', requiredFixture('/turtle/empty-list.ttl', { name: 'My favorites' }));
    await localFirstLogin(page);
    await press(page, 'My Lists');
    await see(page, 'My favorites');

    // Discover
    await press(page, 'Discover');
    await see(page, 'Lists by friends');
    await see(page, 'Favorites');
    await expect(page.getByText('1 item')).toBeVisible();
    await expect(page.getByText('Groceries')).toHaveCount(0);

    // Foreign view
    const bobListUrl = 'http://localhost:3000/bob/lists/favorites#it';

    await press(page, 'Favorites');
    await see(page, 'Favorites');
    await see(page, 'The Substance');
    await see(page, 'This list was created by someone else');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add items' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Open actions for/ })).toHaveCount(0);

    const foreignUrl = new URL(page.url());

    expect(foreignUrl.pathname).toEqual('/lists/favorites');
    expect(foreignUrl.searchParams.get('url')).toEqual(bobListUrl);
    expect(foreignUrl.searchParams.has('sharing')).toBe(false);

    // Own list with the same slug
    await page.goto('/lists/favorites');
    await see(page, 'My favorites (0)');
    await expect(page.getByRole('button', { name: 'Add items' })).toBeVisible();
    await expect(page.getByText('This list was created by someone else')).toHaveCount(0);

    // Guest view
    const guestPage = await page.context().browser()!.newPage();

    await guestPage.goto(
        new URL(`/lists/favorites?url=${encodeURIComponent(bobListUrl)}&sharing=true`, page.url()).href,
    );
    await see(guestPage, 'The Substance');
    await see(guestPage, 'This list was created by someone else');
    await expect(guestPage.getByRole('heading', { name: 'Favorites', exact: true })).toBeVisible();
    await expect(guestPage.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(0);
    await guestPage.close();
});

test('Share lists', async ({ page }) => {
    const listUrl = podUrl('/lists/favorites');
    const visibility = (name: string) => page.getByRole('radio', { name: new RegExp(`^${name}`) });
    const publicTypeIndex = async () => {
        const response = await fetch(podUrl('/settings/publicTypeIndex'), {
            headers: { Accept: 'application/n-triples' },
        });

        return response.ok ? await response.text() : '';
    };
    const publicList = async () => {
        const response = await fetch(listUrl, { headers: { Accept: 'application/n-triples' } });

        return response.ok ? await response.text() : '';
    };

    // Populate POD & Log in
    await solidUpdateDocument(
        '/profile/card',
        requiredFixture('/sparql/declare-preferences-file.sparql', {
            preferencesFile: podUrl('/settings/preferences'),
        }),
    );
    await solidCreateDocument('/settings/preferences', requiredFixture('/turtle/preferences.ttl'));
    await solidCreateDocument('/settings/privateTypeIndex', requiredFixture('/turtle/type-index.ttl'));
    await solidCreateDocument('/movies/the-substance-2024', requiredFixture('/turtle/the-substance-2024.ttl'));
    await solidCreateDocument('/lists/favorites', requiredFixture('/turtle/favorites-list.ttl'));
    await localFirstLogin(page);
    await press(page, 'My Lists');
    await press(page, 'Favorites');
    await see(page, 'The Substance');

    expect((await fetch(listUrl)).status).toEqual(401);

    // Unlisted
    await press(page, 'Open actions menu');
    await press(page, 'Share');
    await expect(visibility('Private')).toBeChecked();
    await visibility('Unlisted').click();
    await expect(visibility('Unlisted')).toBeChecked();

    expect((await fetch(listUrl)).status).toEqual(200);
    expect(await publicTypeIndex()).not.toContain(listUrl);
    expect(await publicList()).toEqualTurtle(requiredFixture('/turtle/public-favorites-list.ttl'));

    // Public
    await visibility('Public').click();
    await expect(visibility('Public')).toBeChecked();

    expect((await fetch(listUrl)).status).toEqual(200);
    expect(await publicTypeIndex()).toEqualTurtle(
        requiredFixture('/turtle/public-type-index.ttl', { listSlug: 'favorites' }),
    );

    await page.keyboard.press('Escape');
    await press(page, 'Open actions menu');
    await press(page, 'Share');
    await expect(visibility('Public')).toBeChecked();

    // Private
    await visibility('Private').click();
    await expect(visibility('Private')).toBeChecked();

    expect((await fetch(listUrl)).status).toEqual(401);
    expect(await publicTypeIndex()).not.toContain(listUrl);

    // Delete
    await visibility('Public').click();
    await expect(visibility('Public')).toBeChecked();
    await page.keyboard.press('Escape');
    await press(page, 'Open actions menu');
    await press(page, 'Delete');
    await press(page, 'Delete', { role: 'button' });
    await see(page, 'Favorites has been deleted.');

    expect(await publicTypeIndex()).not.toContain(listUrl);
});
