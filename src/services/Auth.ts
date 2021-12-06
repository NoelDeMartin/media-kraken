import { Dictionary } from 'vue-router/types/router';
import { NetworkRequestError, UnauthorizedError } from '@noeldemartin/solid-utils';

import Service from '@/services/Service';
import Services from '@/services';

import ModelsCache from '@/models/ModelsCache';
import OfflineUser from '@/models/users/OfflineUser';
import SolidUser from '@/models/users/SolidUser';
import User from '@/models/users/User';

import { AuthenticationMethod, AuthenticationStatus } from '@/authentication';
import SolidAuth from '@/authentication/SolidAuth';

import Errors from '@/utils/Errors';
import EventBus from '@/utils/EventBus';

import OfflineLogoutModal from '@/components/modals/OfflineLogoutModal.vue';

interface State {
    user: User | null;
    unauthorizedError: UnauthorizedError | null;
    refreshing: boolean;
}

interface HasUser {
    user: User;
}

export default class Auth extends Service<State> {

    protected readonly storeNamespace: string = 'auth';

    public get loggedIn(): boolean {
        return !!this.state.user;
    }

    public get user(): User | null {
        return this.state.user;
    }

    public get unauthorizedError(): UnauthorizedError | null {
        return this.state.unauthorizedError;
    }

    public get refreshing(): boolean {
        return !!this.state.refreshing;
    }

    public get isOffline(): boolean | null {
        return this.loggedIn ? this.user instanceof OfflineUser : null;
    }

    public isLoggedIn(): this is HasUser {
        return this.loggedIn;
    }

    public setRefreshing(refreshing: boolean): void {
        this.setState({ refreshing });
    }

    public async loginOffline(): Promise<void> {
        await this.updateUser(new OfflineUser());
    }

    public async loginWithSolid(loginUrl: string, authenticationMethod?: AuthenticationMethod): Promise<void> {
        const status = await Services.$ui.loading(
            () => SolidAuth.login(loginUrl, authenticationMethod),
            'Logging in...',
        );

        switch (status) {
            case AuthenticationStatus.LoggingIn:
                Services.$ui.alert(
                    'This is taking too long...',
                    'You should have been redirected to your identity provider by now, maybe something went wrong',
                );
                break;
            case AuthenticationStatus.Failed:
                Services.$ui.alert('Log in failed', "It wasn't possible to log in with this url");
                break;
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

    public handleUnauthorized(error: UnauthorizedError): void {
        if (Services.$route.name === 'unauthorized')
            return;

        const query: Dictionary<string> = {};

        if (error.forbidden)
            query.forbidden = 'true';

        this.setState({ unauthorizedError: error });
        Services.$router.push({ name: 'unauthorized', query });
    }

    protected async boot(): Promise<void> {
        await super.boot();
        await Services.$app.ready;
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
        return {
            user: null,
            unauthorizedError: null,
            refreshing: false,
        };
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
