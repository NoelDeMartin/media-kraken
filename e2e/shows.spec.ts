import { comboboxSelect, createModel, dontSee, input, press, see } from '@aerogel/playwright';
import { test } from '@e2e/lib/setup';
import type { Page } from '@playwright/test';

async function seedShow(page: Page) {
    await press(page, 'Press "s" to start searching');
    await input(page, 'Search movies and shows').fill('breaking bad');
    await press(page, 'Breaking Bad');
    await comboboxSelect(page, 'Status', 'Watching');
    await press(page, 'Add to collection');
    await see(page, 'Breaking Bad has been added to your collection!');
}

test.beforeEach(async ({ page }) => {
    await page.goto('/shows');
});

test('Adds shows from search', async ({ page }) => {
    await press(page, 'Press "s" to start searching');
    await input(page, 'Search movies and shows').fill('breaking bad');
    await press(page, 'Breaking Bad');
    await comboboxSelect(page, 'Status', 'Watching');
    await press(page, 'Add to collection');
    await see(page, 'Breaking Bad has been added to your collection!');
    await press(page, 'Breaking Bad');
    await see(page, 'Watching (7 new episodes)');
});

test('Views show details', async ({ page }) => {
    await seedShow(page);

    await page.goto('/shows/breaking-bad-2008');
    await see(page, 'Seasons');
    await see(page, 'Season 1');
    await see(page, '0/7 episodes watched');
    await see(page, 'Pilot');
});

test('Changes watching status from details page', async ({ page }) => {
    await seedShow(page);

    await page.goto('/shows/breaking-bad-2008');
    await press(page, 'Open actions menu');
    await press(page, 'Mark as completed');
    await see(page, 'completed');
    await dontSee(page, 'Watching');
    await see(page, 'Completed');
});

test('Views show metadata', async ({ page }) => {
    await seedShow(page);

    await page.goto('/shows/breaking-bad-2008');
    await see(page, 'Created by');
    await see(page, 'Vince Gilligan');
    await see(page, 'Top Cast');
    await see(page, 'Bryan Cranston');
    await see(page, '1 season');
    await see(page, '7 episodes');
});

test('Filters shows by name', async ({ page }) => {
    await createModel(page, 'Show', { name: 'Breaking Bad' });
    await createModel(page, 'Show', { name: 'The Wire' });
    await see(page, 'Shows (2)');

    await press(page, 'Filter shows by name');
    await input(page, 'Shows filter').fill('break');
    await see(page, 'Shows (1)');
    await see(page, 'Breaking Bad (Pending)');
    await dontSee(page, 'The Wire');
});

test('Filters shows with advanced filters', async ({ page }) => {
    await seedShow(page);
    await createModel(page, 'Show', { name: 'The Wire' });
    await see(page, 'Shows (2)');

    await press(page, 'Advanced show filters');
    await comboboxSelect(page, 'Watching status', 'Watching');
    await press(page, 'Apply');
    await see(page, 'Shows (1)');
    await see(page, 'Breaking Bad');
    await dontSee(page, 'The Wire');
});

test('Identifies a show', async ({ page }) => {
    await createModel(page, 'Show', { name: 'Breaking Bad' });
    await press(page, 'Breaking Bad');
    await press(page, 'Open actions menu');
    await press(page, 'Identify');
    await press(page, 'Identify with Breaking Bad');
    await see(page, 'Breaking Bad (2008)');
    await see(page, 'Vince Gilligan');
});

test('Deletes shows', async ({ page }) => {
    await createModel(page, 'Show', { name: 'The Wire' });
    await press(page, 'The Wire');
    await press(page, 'Open actions menu');
    await press(page, 'Delete');
    await press(page, 'Delete', { role: 'button' });
    await see(page, 'The Wire has been deleted.');
    await see(page, 'Shows (0)');
});
