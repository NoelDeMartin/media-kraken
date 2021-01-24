import { Storage } from '@noeldemartin/utils';

export default async function migrate(): Promise<void> {
    if (!Storage.has('solid-auth-client'))
        return;

    const { default: client } = await import(
        /* webpackChunkName: 'authentication-legacy' */
        '@/authentication/LegacyAuthenticator.chunk');
    const session = await client.currentSession() || null;

    if (!session?.idp)
        return;

    Storage.set('media-kraken-solid-auth', {
        loginUrl: session.idp,
        authenticationMethod: 'legacy',
    });
}
