import { fetch, handleIncomingRedirect, login, logout } from '@inrupt/solid-client-authn-browser';
import { SolidAuthClient } from 'solid-auth-client';
import { Soukai } from 'soukai';

interface AppLibraries {
    'soukai': Soukai;
    'solid-auth-client': SolidAuthClient;
    '@inrupt/solid-client-authn-browser': {
        fetch: typeof fetch;
        handleIncomingRedirect: typeof handleIncomingRedirect;
        login: typeof login;
        logout: typeof logout;
    };
}

declare global {

    interface TestingRuntime {
        start(): Promise<void>;
        login(): Promise<void>;
        service<K extends keyof Vue>(name: K): Vue[K];
        lib<K extends keyof AppLibraries>(name: K): AppLibraries[K];
        addMovie(jsonld: object): Promise<void>;
        queueAuthenticatedRequest(url: string, options: RequestInit): void;
    }

    interface Window {
        testing?: TestingRuntime;
        impatientKrakenTimeout?: number;
    }

    interface Error {
        sentryId?: string;
    }

}
