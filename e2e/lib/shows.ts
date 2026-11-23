import { comboboxSelect, input, press, see } from '@aerogel/playwright';
import type { Page } from '@playwright/test';

export async function seedShow(page: Page): Promise<void> {
    await press(page, 'Press "s" to start searching');
    await input(page, 'Search movies and shows').fill('breaking bad');
    await press(page, 'Breaking Bad');
    await comboboxSelect(page, 'Status', 'Watching');
    await press(page, 'Add to collection');
    await see(page, 'Breaking Bad has been added to your collection!');
}
