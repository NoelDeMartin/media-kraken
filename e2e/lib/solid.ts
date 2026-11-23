import { authenticate, config, podUrl, resetAuthentication, updateConfig, webId } from '@aerogel/playwright';
import { expect } from '@playwright/test';

import { requiredFixture } from './fixtures';

export async function asAccount(
    accountConfig: Parameters<typeof updateConfig>[0],
    operation: () => Promise<void>,
): Promise<void> {
    const previousConfig = { ...config() };

    updateConfig(accountConfig);
    resetAuthentication();

    try {
        await operation();
    } finally {
        updateConfig(previousConfig);
        resetAuthentication();
    }
}

export async function asBob(operation: () => Promise<void>): Promise<void> {
    await asAccount({ account: 'bob', name: 'Bob Marley', email: 'bob@example.com' }, operation);
}

export async function solidMakePublic(path: string): Promise<void> {
    const fetch = await authenticate();
    const response = await fetch(`${podUrl(path)}.acl`, {
        method: 'PUT',
        headers: { 'Content-Type': 'text/turtle' },
        body: requiredFixture('/turtle/public-acl.ttl', { webId: webId(), documentUrl: podUrl(path) }),
    });

    expect(response.ok).toBe(true);
}
