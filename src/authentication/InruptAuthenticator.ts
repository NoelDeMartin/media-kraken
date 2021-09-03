import { Fetch } from 'soukai-solid';
import { login, logout } from '@inrupt/solid-client-authn-browser';

import { AuthenticationStatus } from '@/authentication';
import Authenticator from '@/authentication/Authenticator';
import EventBus from '@/utils/EventBus';

class InruptAuthenticator extends Authenticator {

    public fetch!: Fetch;
    private _login!: typeof login;
    private _logout!: typeof logout;

    public async startSession(): Promise<void> {
        const { default: { fetch, handleIncomingRedirect, login, logout } } = await import(
            /* webpackChunkName: 'authentication-inrupt' */
            '@/authentication/InruptAuthenticator.chunk');

        this.fetch = fetch;
        this._login = login;
        this._logout = logout;

        const session = await handleIncomingRedirect(window.location.href);

        if (session?.isLoggedIn) {
            await EventBus.emit('authenticated-fetch-ready', fetch);
            await this.onSessionStarted({ webId: session.webId as string });
        }
    }

    public async login(oidcIssuer: string): Promise<AuthenticationStatus> {
        await this._login({
            oidcIssuer,
            clientName: 'Media Kraken',
            redirectUrl: window.location.href,
        });

        return AuthenticationStatus.LoggingIn;
    }

    public async logout(): Promise<void> {
        await this._logout();
        await this.onSessionEnded();
    }

}

export default new InruptAuthenticator();
