import { AuthenticationStatus } from '@/authentication';
import { arr, FluentArray, PromisedValue } from '@noeldemartin/utils';
import { Fetch } from 'soukai-solid';

export interface AuthListener {
    onSessionStarted(session: AuthSession): Promise<void> | void;
    onSessionEnded(): Promise<void> | void;
}

export interface AuthSession {
    webId: string;
    authenticator: Authenticator;
}

export default abstract class Authenticator {

    public abstract fetch: Fetch;
    private listeners: FluentArray<AuthListener> = arr<AuthListener>([]);
    private booted?: PromisedValue<void>;

    public abstract login(oidcIssuer: string): Promise<AuthenticationStatus>;

    public abstract logout(): Promise<void>;

    public async boot(): Promise<void> {
        if (this.booted)
            return this.booted;

        this.booted = new PromisedValue;

        await this.startSession();

        this.booted.resolve();
    }

    public addListener(listener: AuthListener): () => void {
        if (!this.listeners.includes(listener))
            this.listeners.push(listener);

        return () => {
            this.removeListener(listener);
        };
    }

    public removeListener(listener: AuthListener): void {
        if (!this.listeners.includes(listener))
            return;

        this.listeners.remove(listener);
    }

    protected abstract startSession(): Promise<void>;

    protected async onSessionStarted(session: Omit<AuthSession, 'authenticator'>): Promise<void> {
        await Promise.all(
            this.listeners.toArray().map(
                async listener => {
                    await listener.onSessionStarted?.call(listener, {
                        authenticator: this,
                        ...session,
                    });
                },
            ),
        );
    }

    protected async onSessionEnded(): Promise<void> {
        await Promise.all(
            this.listeners.toArray().map(
                async listener => {
                    await listener.onSessionEnded?.call(listener);
                },
            ),
        );
    }

}
