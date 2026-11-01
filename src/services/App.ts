import Service from '@/services/Service';
import Services from '@/services';

import Errors from '@/utils/Errors';
import Storage from '@/utils/Storage';

import migrations from '@/migrations';
import HalloweenRecommendationsModal from '@/components/modals/HalloweenRecommendationsModal.vue';

export interface CrashReport {
    error: Error;
    title: string;
    subtitle?: string;
    actions: CrashReportAction[];
}

export interface CrashReportAction {
    label: string;
    priority?: number;
    handle: Function;
}

interface State {
    visits: number;
    costumeImageUrl: string | null;
    hasSeenHalloweenRecommendations: boolean;
    crashReport: CrashReport | null;
    isErrorReportingAvailable: boolean;
    isErrorReportingEnabled: boolean;
}

export default class App extends Service<State> {

    public static readonly VISITS_STORAGE_KEY = 'media-kraken-visits';
    public static readonly HALLOWEEN_RECOMMENDATIONS_STORAGE_KEY = 'media-kraken-halloween-recommendations';
    public static readonly VERSION_STORAGE_KEY = 'media-kraken-version';

    public isHalloween = false;
    public environment!: string;
    public sourceUrl!: string;
    public releaseNotesUrl!: string;
    public version!: string;
    public versionName!: string;

    protected readonly storeNamespace: string = 'app';

    private runMigrations: boolean;

    constructor(runMigrations: boolean = true) {
        super();

        this.runMigrations = runMigrations;
    }

    public get isDevelopment(): boolean {
        return this.environment === 'development';
    }

    public get crashReport(): CrashReport | null {
        return this.state.crashReport;
    }

    public get isCrashed(): boolean {
        return this.crashReport !== null;
    }

    public get costumeImageUrl(): string | null {
        return this.state.costumeImageUrl;
    }

    public get isErrorReportingAvailable(): boolean {
        return this.state.isErrorReportingAvailable;
    }

    public get isErrorReportingEnabled(): boolean {
        return this.state.isErrorReportingEnabled;
    }

    public setCrashReport(error: Error, options: Partial<Omit<CrashReport,'error'>> = {}): void {
        const crashReport: CrashReport = {
            error,
            title: 'An unexpected problem crashed the application',
            actions: [],
            ...options,
        };

        this.setState({ crashReport });
    }

    public clearCrashReport(): void {
        this.setState({ crashReport: null });
    }

    public showHalloweenRecommendations(force: boolean = false): void {
        if ((Services.$media.movies.length === 0 || this.state.hasSeenHalloweenRecommendations) && !force) {
            return;
        }

        Storage.set(App.HALLOWEEN_RECOMMENDATIONS_STORAGE_KEY, true);
        this.setState({ hasSeenHalloweenRecommendations: true });
        Services.$ui.openModal(HalloweenRecommendationsModal);
    }

    protected async boot(): Promise<void> {
        await super.boot();
        await this.increaseVisits();

        if (this.isHalloween) {
            await this.prepareHalloweenCostume();
        }

        Errors.registerListener({
            onReportingDisabled: () => this.setState({ isErrorReportingEnabled: false }),
            onReportingEnabled: () => this.setState({ isErrorReportingEnabled: true }),
        });

        this.environment = process.env.NODE_ENV as string;
        this.sourceUrl = process.env.VUE_APP_SOURCE_URL as string;
        this.releaseNotesUrl = process.env.VUE_APP_RELEASE_NOTES_URL as string;
        this.version = process.env.VUE_APP_VERSION as string;
        this.versionName = process.env.VUE_APP_VERSION_NAME as string;

        if (this.runMigrations)
            await this.upgradeStorage();
    }

    protected getInitialState(): State {
        return {
            visits: Storage.get(App.VISITS_STORAGE_KEY, 0),
            hasSeenHalloweenRecommendations: Storage.get(App.HALLOWEEN_RECOMMENDATIONS_STORAGE_KEY, false),
            costumeImageUrl: null,
            crashReport: null,
            isErrorReportingAvailable: Errors.isReportingAvailable,
            isErrorReportingEnabled: Errors.isReportingEnabled,
        };
    }

    private async increaseVisits() {
        this.setState({ visits: this.state.visits + 1 });

        Storage.set(App.VISITS_STORAGE_KEY, this.state.visits);
    }

    private async prepareHalloweenCostume() {
        const costume = this.state.visits < 5 || Math.random() < 0.33
            ? 'halloween'
            : `halloween-${Math.round(Math.random() * 4) + 1}`;
        const img = document.createElement('img');
        const image = await import(`@/assets/img/costumes/${costume}.png`);

        img.src = image.default;
        img.alt = '';
        img.classList.add('logo');

        document.querySelector('svg.logo')?.replaceWith(img);

        this.setState({ costumeImageUrl: image.default });
    }

    private async upgradeStorage() {
        const previousVersion = Storage.get(App.VERSION_STORAGE_KEY);

        if (previousVersion === this.version)
            return;

        if (previousVersion !== null)
            await this.runStorageMigrations(previousVersion);

        Storage.set(App.VERSION_STORAGE_KEY, this.version);
    }

    private async runStorageMigrations(storageVersion: string): Promise<void> {
        Services.$ui.updateBootupProgressMessage('Running storage migrations...');

        for (const migration of migrations) {
            if (!migration.isNecessary(storageVersion))
                continue;

            storageVersion = await migration.apply();
        }
    }

}
