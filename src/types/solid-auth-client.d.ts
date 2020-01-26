declare module 'solid-auth-client' {

    import { EventEmitter } from 'events';

    type AsyncStorage = any;

    type loginOptions = {
        callbackUri?: string,
        popupUri?: string,
        storage?: AsyncStorage,
    };

    export type Session = {
        idp: string,
        webId: string,
        accessToken: string,
        idToken: string,
        clientId: string,
        sessionKey: string,
    };

    export class SolidAuthClient extends EventEmitter {
        public fetch(input: RequestInfo, options?: Object): Promise<Response>;

        public login(idp: string, options?: loginOptions): Promise<Session | void>;

        public popupLogin(options: loginOptions): Promise<Session | void>;

        public currentSession(storage?: AsyncStorage): Promise<Session | void>;

        public trackSession(callback: (session?: Session) => void): Promise<void>;

        public stopTrackSession(callback: (session?: Session) => void): Promise<void>;

        public logout(storage?: AsyncStorage): Promise<void>;
    }

    const auth: SolidAuthClient;

    export default auth;
}
