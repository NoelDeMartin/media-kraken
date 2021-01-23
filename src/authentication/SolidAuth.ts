import { Fetch } from 'soukai-solid';
import { silenced, urlRoot, Storage } from '@noeldemartin/utils';

import SolidUser from '@/models/users/SolidUser';

import { defaultAuthenticationMethod, AuthenticationMethod } from '@/authentication/AuthenticationMethod';
import Authenticator, { AuthListener, AuthSession } from '@/authentication/Authenticator';
import authenticators from '@/authentication/authenticators';

import RDFStore from '@/utils/RDFStore';

type UserProfile = {
    webId: string;
    storageUrls: string[];
    privateTypeIndexUrl: string;
    name?: string;
    avatarUrl?: string;
    oidcIssuerUrl?: string;
}

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

    public async login(
        loginUrl: string,
        authenticationMethod: AuthenticationMethod = defaultAuthenticationMethod,
    ): Promise<boolean | void> {
        if (this.session)
            return;

        const profile = await this.readProfileFromLoginUrl(loginUrl);
        const oidcIssuerUrl = profile?.oidcIssuerUrl ?? urlRoot(profile?.webId ?? loginUrl);
        const loginData: SolidAuthPreviousLogin = { loginUrl, authenticationMethod };

        Storage.set(STORAGE_PREVIOUS_LOGIN_KEY, loginData);

        try {
            const authenticator = await this.useAuthenticator(authenticationMethod);

            await authenticator.login(oidcIssuerUrl);

            return true;
        } catch (error) {
            Storage.remove(STORAGE_PREVIOUS_LOGIN_KEY);

            return false;
        }
    }

    public async logout(): Promise<void> {
        await this.session?.authenticator?.logout();
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

    private async readProfileFromLoginUrl(loginUrl: string): Promise<UserProfile | null> {
        const readProfile = silenced(this.readProfile.bind(this));

        return await readProfile(loginUrl)
            ?? await readProfile(loginUrl.replace(/\/$/, '').concat('/profile/card#me'))
            ?? await readProfile(urlRoot(loginUrl).concat('/profile/card#me'));
    }

    private async readProfile(webId: string): Promise<UserProfile> {
        const store = await RDFStore.fromUrl(this.fetch, webId);
        const storages = store.statements(webId, 'pim:storage');
        const privateTypeIndex = store.statement(webId, 'solid:privateTypeIndex');

        if (storages.length === 0)
            throw new Error('Couldn\'t find a storage in profile');

        if (!privateTypeIndex)
            throw new Error('Couldn\'t find a private type index in the profile');

        return {
            webId,
            storageUrls: storages.map(storage => storage.object.value),
            privateTypeIndexUrl: privateTypeIndex.object.value,
            name: store.statement(webId, 'foaf:name')?.object.value,
            avatarUrl: store.statement(webId, 'foaf:img')?.object.value,
            oidcIssuerUrl: store.statement(webId, 'solid:oidcIssuer')?.object.value,
        };
    }

    private async onSessionStarted(session: AuthSession): Promise<void> {
        if (session.webId === this.session?.webId)
            return;

        const profile = await this.readProfile(session.webId);
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
