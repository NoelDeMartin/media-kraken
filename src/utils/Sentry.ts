import { init, captureException } from '@sentry/browser';

import Arr from '@/utils/Arr';
import Storage from '@/utils/Storage';

class Sentry {

    private active: boolean = false;

    public init(): void {
        if (!process.env.VUE_APP_SENTRY_DSN || !this.isReportingEnabled())
            return;

        try {
            init({ dsn: process.env.VUE_APP_SENTRY_DSN });

            this.active = true;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed initializing error reporting.', error);
        }
    }

    public report(error: any): void {
        if (!this.active)
            return;

        try {
            captureException(error);
        } catch (reportingError) {
            // eslint-disable-next-line no-console
            console.error('Failed reporting an error.', error, reportingError);
        }
    }

    private isReportingEnabled(): boolean {
        if (Storage.get('media-kraken-error-reporting', false))
            return true;

        const url = new URL(location.href);

        return Arr.contains(url.searchParams.get('error_reporting'), ['1', 'true', 'on', 'yes']);
    }

}

export default new Sentry();
