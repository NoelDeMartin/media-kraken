import SolidAuthClient, { Session } from 'solid-auth-client';

import Service from '@/services/Service';

import User from '@/models/users/User';
import OfflineUser from '@/models/users/OfflineUser';
import SolidUser from '@/models/users/SolidUser';

import EventBus from '@/utils/EventBus';
import RDFStore from '@/utils/RDFStore';
import Storage from '@/utils/Storage';

import OfflineLogoutModal from '@/components/modals/OfflineLogoutModal.vue';

interface State {
    user: User | null;
}

interface HasUser {
    user: User;
}

export default class Auth extends Service<State> {

    protected storeName: string = 'auth';

    private solidAuthListener?: (session?: Session) => Promise<void>;

    public get loggedIn(): boolean {
        return !!this.state.user;
    }

    public get user(): User | null {
        return this.state.user;
    }

    public get isOffline(): boolean | null {
        return this.loggedIn ? this.user instanceof OfflineUser : null;
    }

    public isLoggedIn(): this is HasUser {
        return this.loggedIn;
    }

    public async loginOffline(): Promise<void> {
        const user = new OfflineUser();

        await this.loginUser(user);

        Storage.set('user', user.toJSON());
    }

    public async loginWithSolid(idp: string): Promise<void> {
        const result = await SolidAuthClient.login(idp);

        if (result === null)
            throw new Error('Could not log in with Solid');
    }

    public async logout(force: boolean = false): Promise<void> {
        if (!this.loggedIn)
            return;

        if (this.isOffline && !this.app.$media.empty && !force) {
            this.app.$ui.openModal(OfflineLogoutModal);

            return;
        }

        if (this.user instanceof OfflineUser) {
            Storage.remove('user');
        } else if (this.user instanceof SolidUser) {
            await SolidAuthClient.logout();
        }

        this.logoutUser();

        if (this.app.$router.currentRoute.name !== 'login')
            this.app.$router.push({ name: 'login' });
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
            await this.loginUser(new OfflineUser());
        }
    }

    protected getInitialState(): State {
        return { user: null };
    }

    protected async loginUser(user: User): Promise<void> {
        if (this.loggedIn)
            return;

        await user.initSoukaiEngine();

        this.setState({ user });

        EventBus.emit('login', user);

        if (this.app.$router.currentRoute.name === 'login')
            this.app.$router.replace({ name: 'home' });
    }

    protected async logoutUser(): Promise<void> {
        if (!this.loggedIn)
            return;

        this.user!.clearClientData();

        this.setState({ user: null });

        EventBus.emit('logout');
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
