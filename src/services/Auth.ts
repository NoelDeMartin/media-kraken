import Service from '@/services/Service';

import ModelsCache from '@/models/ModelsCache';
import OfflineUser from '@/models/users/OfflineUser';
import SolidUser from '@/models/users/SolidUser';
import User from '@/models/users/User';

import Errors from '@/utils/Errors';
import EventBus from '@/utils/EventBus';
import Time from '@/utils/Time';

import NetworkRequestError from '@/errors/NetworkRequestError';

import OfflineLogoutModal from '@/components/modals/OfflineLogoutModal.vue';

interface State {
    user: User | null;
}

interface HasUser {
    user: User;
}

export default class Auth extends Service<State> {

    protected storeName: string = 'auth';

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
        await this.updateUser(new OfflineUser());
    }

    public async loginWithSolid(idp: string): Promise<void> {
        this.app.$ui.loading(async () => {
            const loggedIn = await SolidUser.login(idp);

            if (!loggedIn) {
                // For some reason, valid urls return !loggedIn before redirecting so there is no
                // way to distinguish between an actual error or everything working as expected.
                // We'll just wait a couple of seconds before showing an error.
                await Time.wait(2000);

                this.app.$ui.alert(
                    'Log in failed',
                    "It wasn't possible to log in with this url",
                );
            }
        });
    }

    public async logout(force: boolean = false): Promise<void> {
        if (!this.loggedIn)
            return;

        if (this.isOffline && !this.app.$media.empty && !force) {
            this.app.$ui.openModal(OfflineLogoutModal);

            return;
        }

        this.updateUser(null);
    }

    public handleUnauthorized(): void {
        if (this.app.$route.name === 'unauthorized')
            return;

        this.app.$router.push({ name: 'unauthorized' });
    }

    protected async init(): Promise<void> {
        await super.init();

        await SolidUser.trackSession({
            onUserUpdated: (solidUser: SolidUser | null) => {
                if (!!this.user && !(this.user instanceof SolidUser)) {
                    return;
                }

                this.updateUser(solidUser);
            },
            onError: (error: Error) => {
                if (error instanceof NetworkRequestError) {
                    this.handleSolidSessionError(error, 'A network request failed trying to log in', error.url);

                    return;
                }

                this.handleSolidSessionError(error);
            },
        });

        if (OfflineUser.isLoggedIn())
            await this.updateUser(new OfflineUser());
    }

    protected getInitialState(): State {
        return { user: null };
    }

    private async updateUser(newUser: User | null = null): Promise<void> {
        const previousUser = this.user;

        if (!newUser)
            ModelsCache.clear();

        if (newUser === previousUser)
            return;

        this.setState({ user: newUser });

        if (!newUser) {
            previousUser!.logout();

            EventBus.emit('logout');

            if (this.app.$router.currentRoute.name !== 'login')
                this.app.$router.push({ name: 'login' });

            return;
        }

        await newUser.login();

        if (this.app.$router.currentRoute.name === 'login')
            this.app.$router.replace({ name: 'home' });

        EventBus.emit('login', newUser);
    }

    private handleSolidSessionError(error: Error, title?: string, subtitle?: string): void {
        const clearSessionData = async () => {
            ModelsCache.clear();
            SolidUser.logout();
            this.app.$app.clearCrashReport();
        };

        Errors.report(error);

        this.app.$app.setCrashReport(
            error,
            {
                title: title || 'There was an error trying to log in',
                subtitle,
                actions: this.loggedIn
                    ? []
                    : [{
                        label: 'Logout',
                        priority: 0,
                        handle: clearSessionData,
                    }],
            },
        );
    }

}
