import {
    podUrl,
    press,
    localFirstLogin,
    solidReset,
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

test('Shares lists', async ({ page }) => {
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
    await solidUpdateDocument('/profile/card', requiredFixture('/sparql/declare-preferences-file.sparql'));
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

    // Public
    await visibility('Public').click();
    await expect(visibility('Public')).toBeChecked();

    expect((await fetch(listUrl)).status).toEqual(200);
    expect(await publicTypeIndex()).toContain(`${listUrl}#it`);

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
