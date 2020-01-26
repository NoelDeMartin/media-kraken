import { Store } from 'vuex';

import { SolidEngine } from 'soukai-solid';
import $rdf from 'rdflib';
import SolidAuthClient, { Session } from 'solid-auth-client';
import Soukai, { LocalStorageEngine } from 'soukai';

import Service from '@/services/Service';

import User from '@/models/users/User';
import OfflineUser from '@/models/users/OfflineUser';
import SolidUser from '@/models/users/SolidUser';

import Storage from '@/utils/Storage';
import EventBus from '@/utils/EventBus';

interface State {
    user: User | null;
}

interface HasUser {
    user: User;
}

export default class Auth extends Service {

    private solidAuthListener?: (session?: Session) => Promise<void>;

    public get loggedIn(): boolean {
        return !!this.storage.user;
    }

    public get user(): User | null {
        return this.storage.user;
    }

    public isLoggedIn(): this is HasUser {
        return this.loggedIn;
    }

    public async loginOffline(): Promise<void> {
        const user = new OfflineUser();

        await this.loginUser(user);

        Storage.set('user', user.toJson());
    }

    public async loginWithSolid(idp: string): Promise<void> {
        const result = await SolidAuthClient.login(idp);

        if (result === null)
            throw new Error('Could not log in with Solid');
    }

    public async logout(): Promise<void> {
        if (this.loggedIn) {
            if (this.user instanceof OfflineUser) {
                if (!confirm('Logging out from offline mode will delete all your data, are you sure you want to proceed?')) {
                    return;
                }

                Storage.remove('user');
            } else if (this.user instanceof SolidUser) {
                await SolidAuthClient.logout();
            }

            this.logoutUser();
        }
    }

    protected get storage(): State {
        return this.app.$store.state.auth
            ? this.app.$store.state.auth
            : {};
    }

    protected async init(): Promise<void> {
        await super.init();

        const user = Storage.get('user');
        this.solidAuthListener = this.onSolidSessionUpdated.bind(this);

        try {
            await SolidAuthClient.currentSession().then(session => this.onSolidSessionUpdated(session));

            SolidAuthClient.trackSession(this.solidAuthListener);
        } catch (error) {
            // TODO handle session expiration properly instead of communicating
            // this like an error
            alert("We couldn't validate your credentials, please login again");

            await SolidAuthClient.logout();
            this.logoutUser();
        }

        if (user !== null) {
            await this.loginUser(OfflineUser.fromJson(user));
        }
    }

    protected async registerStoreModule(store: Store<State>): Promise<void> {
        store.registerModule('auth', {
            state: {
                user: null,
            },
            mutations: {
                setUser(state: State, user: User | null) {
                    state.user = user;
                },
            },
        });
    }

    protected unregisterStoreModule(store: Store<State>): void {
        store.unregisterModule('auth');
    }

    protected async loginUser(user: User): Promise<void> {
        if (!this.loggedIn) {
            this.app.$store.commit('setUser', user);

            if (user instanceof OfflineUser) {
                Soukai.useEngine(new LocalStorageEngine('media-tracker'));
            } else if (user instanceof SolidUser) {
                Soukai.useEngine(new SolidEngine(SolidAuthClient.fetch.bind(SolidAuthClient)));
            }

            EventBus.emit('login', user);
        }
    }

    protected async logoutUser(): Promise<void> {
        if (this.loggedIn) {
            if (this.user instanceof OfflineUser) {
                (Soukai.engine as LocalStorageEngine).clear();
            }

            this.app.$store.commit('setUser', null);

            EventBus.emit('logout');
        }
    }

    private async onSolidSessionUpdated(session: Session | void): Promise<void> {
        if (session && !this.user) {
            await this.loginFromSession(session);
        } else if (!session && this.user instanceof SolidUser) {
            this.logoutUser();
        }
    }

    private async loginFromSession(session: Session): Promise<void> {
        const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
        const PIM = $rdf.Namespace('http://www.w3.org/ns/pim/space#');

        const store = $rdf.graph();
        const data = await SolidAuthClient.fetch(session.webId).then(res => res.text());

        $rdf.parse(data, store, session.webId, null as any, null as any);

        const webId = store.sym(session.webId);

        const name = store.any(webId, FOAF('name'), null as any, null as any);
        const avatarUrl = store.any(webId, FOAF('img'), null as any, null as any);
        const storages = store.each(webId, PIM('storage'), null as any, null as any);

        // TODO load extended profile to find additional storages

        await this.loginUser(
            new SolidUser(
                webId.value,
                name ? name.value : 'Unknown',
                avatarUrl ? avatarUrl.value : null,
                (storages || []).map($storage => $storage.value),
            ),
        );
    }

}
