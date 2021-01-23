import { after } from '@noeldemartin/utils';

import Service from '@/services/Service';
import Services from '@/services';

import ModelsCache from '@/models/ModelsCache';
import OfflineUser from '@/models/users/OfflineUser';
import SolidUser from '@/models/users/SolidUser';
import User from '@/models/users/User';

import SolidAuth from '@/authentication/SolidAuth';
import { AuthenticationMethod } from '@/authentication/AuthenticationMethod';

import Errors from '@/utils/Errors';
import EventBus from '@/utils/EventBus';

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

    public async loginWithSolid(loginUrl: string): Promise<void> {
        const loggedIn = await Services.$ui.loading(() => SolidAuth.login(loginUrl, AuthenticationMethod.Legacy));

        if (loggedIn === false) {
            Services.$ui.alert('Log in failed', "It wasn't possible to log in with this url");

            return;
        }

        if (loggedIn === true) {
            await after({ seconds: 10 });

            Services.$ui.alert(
                'This is taking too long...',
                'You should have been redirected to your identity provider by now, maybe something went wrong',
            );
        }
    }

    public async logout(force: boolean = false): Promise<void> {
        if (!this.loggedIn)
            return;

        if (this.isOffline && !Services.$media.empty && !force) {
            Services.$ui.openModal(OfflineLogoutModal);

            return;
        }

        this.updateUser(null);
    }

    public handleUnauthorized(): void {
        if (Services.$route.name === 'unauthorized')
            return;

        Services.$router.push({ name: 'unauthorized' });
    }

    protected async boot(): Promise<void> {
        await super.boot();
        await SolidAuth.boot({
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

            if (Services.$router.currentRoute.name !== 'login')
                Services.$router.push({ name: 'login' });

            return;
        }

        await newUser.login();

        if (Services.$router.currentRoute.name === 'login')
            Services.$router.replace({ name: 'home' });

        EventBus.emit('login', newUser);
    }

    private handleSolidSessionError(error: Error, title?: string, subtitle?: string): void {
        const handleLogout = async () => {
            await ModelsCache.clear();
            await SolidAuth.logout();
            EventBus.emit('logout');
            Services.$app.clearCrashReport();
        };

        Errors.report(error);

        Services.$app.setCrashReport(
            error,
            {
                title: title || 'There was an error trying to log in',
                subtitle,
                actions: this.loggedIn
                    ? []
                    : [{
                        label: 'Logout',
                        priority: 0,
                        handle: handleLogout,
                    }],
            },
        );
    }

}
