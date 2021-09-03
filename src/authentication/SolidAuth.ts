import { Fetch } from 'soukai-solid';
import { urlRoot, Storage, after } from '@noeldemartin/utils';
import { fetchLoginUserProfile, SolidUserProfile } from '@noeldemartin/solid-utils';

import SolidUser from '@/models/users/SolidUser';

import { defaultAuthenticationMethod, AuthenticationMethod, AuthenticationStatus } from '@/authentication';
import Authenticator, { AuthListener, AuthSession } from '@/authentication/Authenticator';
import authenticators from '@/authentication/authenticators';

export type SolidAuthPreviousLogin = {
    loginUrl: string;
    authenticationMethod: AuthenticationMethod;
}

export interface SolidAuthSessionListener {
    onUserUpdated(user: SolidUser | null): void;
    onError(error: Error): void;
}

const STORAGE_PREVIOUS_LOGIN_KEY = 'media-kraken-solid-auth';

class SolidAuth {

    private listener!: SolidAuthSessionListener;
    private authenticatorListener!: AuthListener;
    private authenticator?: Authenticator;
    private session?: AuthSession;
    private _previousLogin?: SolidAuthPreviousLogin;
    private _fetch?: Fetch;

    public get fetch(): Fetch {
        return this._fetch ?? this.session?.authenticator.fetch ?? window.fetch.bind(window);
    }

    public get previousLogin(): SolidAuthPreviousLogin | null {
        return this._previousLogin ?? null;
    }

    public setFetch(fetch: Fetch): void {
        this._fetch = fetch;
    }

    public async boot(listener: SolidAuthSessionListener): Promise<void> {
        this.listener = listener;
        this.authenticatorListener = {
            onSessionStarted: this.onSessionStarted.bind(this),
            onSessionEnded: this.onSessionEnded.bind(this),
        };

        if (!Storage.has(STORAGE_PREVIOUS_LOGIN_KEY))
            return;

        this._previousLogin = Storage.get(STORAGE_PREVIOUS_LOGIN_KEY) as SolidAuthPreviousLogin;

        try {
            await this.useAuthenticator(this._previousLogin.authenticationMethod);
        } catch (error) {
            listener.onError(error);
        }
    }

    public async login(loginUrl: string, authenticationMethod?: AuthenticationMethod): Promise<AuthenticationStatus> {
        if (this.session)
            return AuthenticationStatus.LoggedIn;

        authenticationMethod = authenticationMethod ?? defaultAuthenticationMethod;

        const profile = await fetchLoginUserProfile(loginUrl);
        const oidcIssuerUrl = profile?.oidcIssuerUrl ?? urlRoot(profile?.webId ?? loginUrl);
        const loginData: SolidAuthPreviousLogin = { loginUrl, authenticationMethod };

        Storage.set(STORAGE_PREVIOUS_LOGIN_KEY, loginData);

        try {
            const authenticator = await this.useAuthenticator(authenticationMethod);
            const status = await authenticator.login(oidcIssuerUrl);

            if (status === AuthenticationStatus.LoggingIn)
                await after({ seconds: 10 });

            return status;
        } catch (error) {
            Storage.remove(STORAGE_PREVIOUS_LOGIN_KEY);

            return AuthenticationStatus.Failed;
        }
    }

    public async logout(): Promise<void> {
        if (Storage.has(STORAGE_PREVIOUS_LOGIN_KEY))
            Storage.remove(STORAGE_PREVIOUS_LOGIN_KEY);

        if (this._previousLogin)
            delete this._previousLogin;

        await this.authenticator?.logout();
    }

    private async useAuthenticator(authenticationMethod: AuthenticationMethod): Promise<Authenticator> {
        if (this.authenticator) {
            this.authenticator.removeListener(this.authenticatorListener);

            delete this.authenticator;
        }

        this.authenticator = authenticators[authenticationMethod];

        this.authenticator.addListener(this.authenticatorListener);

        try {
            await this.authenticator.boot();
        } catch (error) {
            this.authenticator.removeListener(this.authenticatorListener);

            delete this.authenticator;
            throw error;
        }

        return this.authenticator;
    }

    private async onSessionStarted(session: AuthSession): Promise<void> {
        if (session.webId === this.session?.webId)
            return;

        const profile = await fetchLoginUserProfile(session.webId) as SolidUserProfile;
        const user = new SolidUser(
            profile.webId,
            profile.name ?? 'Unknown',
            profile.avatarUrl ?? null,
            profile.storageUrls,
            profile.privateTypeIndexUrl,
        );

        this.session = session;
        this.listener.onUserUpdated(user);
    }

    private onSessionEnded(): void {
        if (!this.session)
            return;

        delete this.session;
        this.listener.onUserUpdated(null);
    }

}

export default new SolidAuth();
