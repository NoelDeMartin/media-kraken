import { Fetch } from 'soukai-solid';
import { Session, SolidAuthClient } from 'solid-auth-client';
import { PromisedValue, Storage } from '@noeldemartin/utils';

import { AuthenticationStatus } from '@/authentication';
import Authenticator from '@/authentication/Authenticator';

class LegacyAuthenticator extends Authenticator {

    private promisedClient?: PromisedValue<SolidAuthClient>;

    public get fetch(): Fetch {
        const client = this.promisedClient?.value;

        return client ? client.fetch.bind(client) : window.fetch;
    }

    public async startSession(): Promise<void> {
        if (this.promisedClient) {
            await this.promisedClient;

            return;
        }

        let activeSessionWebId: string | undefined;
        const onSessionUpdated = async (session: Session | null | void) => {
            session = session || null;

            if (session?.webId === activeSessionWebId)
                return;

            activeSessionWebId = session?.webId;

            if (activeSessionWebId)
                await this.onSessionStarted({ webId: activeSessionWebId });
            else
                await this.onSessionEnded();
        };

        this.promisedClient = new PromisedValue();

        // TODO this chunk is being built for the worker thread as well, even though it's never loaded
        const { default: client } = await import(
            /* webpackChunkName: 'authentication-legacy' */
            '@/authentication/LegacyAuthenticator.chunk');

        this.promisedClient.resolve(client);

        await client.currentSession().then(onSessionUpdated);

        client.trackSession(onSessionUpdated);
    }

    public async login(oidcIssuer: string): Promise<AuthenticationStatus> {
        await this.startSession();

        const session = await this.promisedClient!.value!.login(oidcIssuer);

        return session ? AuthenticationStatus.LoggedIn : AuthenticationStatus.LoggingIn;
    }

    public async logout(): Promise<void> {
        await this.startSession();
        await this.promisedClient!.value!.logout();

        // Clean up storage
        // See https://github.com/solid/solid-auth-client/issues/96
        Storage.remove('solid-auth-client');
    }

}

export default new LegacyAuthenticator();
