import Service from '@/services/Service';
import Services from '@/services';

import Errors from '@/utils/Errors';
import Storage from '@/utils/Storage';

import migrations from '@/migrations';

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
    crashReport: CrashReport | null;
    isErrorReportingAvailable: boolean;
    isErrorReportingEnabled: boolean;
}

export default class App extends Service<State> {

    public static readonly VERSION_STORAGE_KEY = 'media-kraken-version';

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

    protected async boot(): Promise<void> {
        await super.boot();

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
            crashReport: null,
            isErrorReportingAvailable: Errors.isReportingAvailable,
            isErrorReportingEnabled: Errors.isReportingEnabled,
        };
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
