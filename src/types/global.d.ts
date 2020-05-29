import { SolidAuthClient } from 'solid-auth-client';
import { Soukai } from 'soukai';

import User from '@/models/users/User';

interface AppLibraries {
    'soukai': Soukai;
    'solid-auth-client': SolidAuthClient;
}

declare global {

    interface TestingRuntime {
        lib<K extends keyof AppLibraries>(name: K): AppLibraries[K];
        service<K extends keyof Vue>(name: K): Vue[K];
        start(): Promise<void>;
        login(): User;
    }

    interface Window {
        Runtime?: TestingRuntime;
        impatientKrakenTimeout?: number;
    }

}
