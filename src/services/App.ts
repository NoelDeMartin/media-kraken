import Errors from '@/utils/Errors';
import Service from '@/services/Service';
import Storage from '@/utils/Storage';

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

    public environment!: string;
    public sourceUrl!: string;
    public version!: string;

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

        this.environment = process.env.NODE_ENV!;
        this.sourceUrl = process.env.VUE_APP_SOURCE_URL!;
        this.version = process.env.VUE_APP_VERSION + (this.isDevelopment ? '-next' : '');

        Storage.set('media-kraken-version', this.version);

        Errors.registerListener({
            onReportingDisabled: () => this.setState({ isErrorReportingEnabled: false }),
            onReportingEnabled: () => this.setState({ isErrorReportingEnabled: true }),
        });
    }

    protected getInitialState(): State {
        return {
            crashReport: null,
            isErrorReportingAvailable: Errors.isReportingAvailable,
            isErrorReportingEnabled: Errors.isReportingEnabled,
        };
    }

}
