import { init, captureException } from '@sentry/browser';

import Arr from '@/utils/Arr';
import Storage from '@/utils/Storage';

const STORAGE_ENABLED_KEY = 'media-kraken-error-reporting';

class Errors {

    private sentryInitialized: boolean = false;
    private reportingEnabled: boolean = false;

    public get isReportingEnabled(): boolean {
        return this.reportingEnabled;
    }

    public get isReportingAvailable(): boolean {
        return !!process.env.VUE_APP_SENTRY_DSN;
    }

    public init(): void {
        if (!this.userWantsReportingEnabled())
            return;

        this.initializeSentry();
        this.reportingEnabled = true;
    }

    public setReportingEnabled(enabled: boolean): void {
        if (this.reportingEnabled === enabled)
            return;

        this.reportingEnabled = enabled;
        Storage.set(STORAGE_ENABLED_KEY, enabled);

        if (enabled && !this.sentryInitialized)
            this.initializeSentry();
    }

    public handle(error: any): void {
        if (!this.reportingEnabled || !this.sentryInitialized) {
            // eslint-disable-next-line no-console
            console.error(error);

            return;
        }

        try {
            captureException(error);

            // eslint-disable-next-line no-console
            console.error('Error reported to Sentry', error);
        } catch (reportingError) {
            // eslint-disable-next-line no-console
            console.error('Failed reporting an error to Sentry', error, reportingError);
        }
    }

    private userWantsReportingEnabled(): boolean {
        if (Storage.get(STORAGE_ENABLED_KEY, false))
            return true;

        const url = new URL(location.href);

        return Arr.contains(url.searchParams.get('error_reporting'), ['1', 'true', 'on', 'yes']);
    }

    private initializeSentry(): void {
        if (this.sentryInitialized || !this.isReportingAvailable)
            return;

        try {
            init({ dsn: process.env.VUE_APP_SENTRY_DSN });

            this.sentryInitialized = true;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed initializing Sentry', error);
        }
    }

}

export default new Errors();
