import Errors from '@/utils/Errors';
import Service from '@/services/Service';
import Storage from '@/utils/Storage';

interface CrashReport {
    error: Error;
    message: string;
}

interface State {
    crashReport: CrashReport | null;
    isErrorReportingAvailable: boolean;
    isErrorReportingEnabled: boolean;
}

export default class App extends Service<State> {

    public environment!: string;
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

    public setCrashReport(
        error: Error,
        message: string = 'An unexpected problem crashed the application',
    ): void {
        this.setState({ crashReport: { error, message } });
    }

    public clearCrashReport(): void {
        this.setState({ crashReport: null });
    }

    protected async init(): Promise<void> {
        await super.init();

        this.environment = process.env.NODE_ENV!;
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
