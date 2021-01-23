import { SolidAuthClient } from 'solid-auth-client';
import { Soukai } from 'soukai';

interface AppLibraries {
    'soukai': Soukai;
    'solid-auth-client': Promise<SolidAuthClient>;
}

declare global {

    interface TestingRuntime {
        start(): Promise<void>;
        login(): Promise<void>;
        service<K extends keyof Vue>(name: K): Vue[K];
        lib<K extends keyof AppLibraries>(name: K): AppLibraries[K];
        addMovie(jsonld: object): Promise<void>;
    }

    interface Window {
        Runtime?: TestingRuntime;
        impatientKrakenTimeout?: number;
    }

    interface Error {
        sentryId?: string;
    }

}
