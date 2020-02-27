import { Store } from 'vuex';

import { SolidEngine } from 'soukai-solid';
import SolidAuthClient, { Session } from 'solid-auth-client';
import Soukai, { LocalStorageEngine } from 'soukai';

import Service from '@/services/Service';

import User from '@/models/users/User';
import OfflineUser from '@/models/users/OfflineUser';
import SolidUser from '@/models/users/SolidUser';

import EventBus from '@/utils/EventBus';
import RDFStore from '@/utils/RDFStore';
import Storage from '@/utils/Storage';

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
        if (!this.loggedIn)
            return;

        if (this.user instanceof OfflineUser) {
            if (!confirm('Logging out from offline mode will delete all your data, are you sure you want to proceed?'))
                return;

            Storage.remove('user');
        } else if (this.user instanceof SolidUser) {
            await SolidAuthClient.logout();
        }

        this.logoutUser();

        if (this.app.$router.currentRoute.name !== 'login')
            this.app.$router.push('/login');
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
        if (this.loggedIn)
            return;

        this.app.$store.commit('setUser', user);

        if (user instanceof OfflineUser) {
            Soukai.useEngine(new LocalStorageEngine('media-kraken'));
        } else if (user instanceof SolidUser) {
            Soukai.useEngine(new SolidEngine(SolidAuthClient.fetch.bind(SolidAuthClient)));
        }

        EventBus.emit('login', user);

        if (this.app.$router.currentRoute.name === 'login')
            this.app.$router.replace({ name: 'home' });
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

    private async loginFromSession({ webId }: Session): Promise<void> {
        const store = await RDFStore.fromUrl(webId);

        const name = store.statement(webId, 'foaf:name');
        const avatarUrl = store.statement(webId, 'foaf:img');
        const storages = store.statements(webId, 'pim:storage');

        // TODO load extended profile to find additional storages

        if (storages.length === 0)
            throw new Error("Couldn't find pim:storage in profile");

        await this.loginUser(
            new SolidUser(
                webId,
                name ? name.object.value : 'Unknown',
                avatarUrl ? avatarUrl.object.value : null,
                storages.map(storage => storage.object.value),
                store,
            ),
        );
    }

}
