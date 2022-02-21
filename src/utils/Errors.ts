import { DocumentFormat, MalformedDocumentError } from 'soukai-solid';
import { init, captureException } from '@sentry/browser';
import { UnauthorizedError } from '@noeldemartin/solid-utils';

import Storage from '@/utils/Storage';

const STORAGE_ENABLED_KEY = 'media-kraken-error-reporting';

export interface ErrorsListener {
    onReportingEnabled?(): void;
    onReportingDisabled?(): void;
}

interface SerializedError extends Error {
    errorClass?: 'unauthorized' | 'malformed-document';
    errorData?: any;
}

interface MalformedDocumentErrorData {
    documentUrl: string;
    documentFormat: DocumentFormat;
    malformationDetails: string;
}

interface UnauthorizedErrorData {
    url: string;
    responseStatus?: number;
}

class Errors {

    private sentryInitialized: boolean = false;
    private reportingEnabled: boolean = false;
    private listeners: ErrorsListener[] = [];

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

        this.listeners.forEach(listener => {
            if (listener.onReportingEnabled && enabled)
                listener.onReportingEnabled();

            if (listener.onReportingDisabled && !enabled)
                listener.onReportingDisabled();
        });
    }

    public handle(error: any): void {
        if (!this.reportingEnabled || !this.sentryInitialized) {
            // eslint-disable-next-line no-console
            console.error(error);

            return;
        }

        this.report(error);
    }

    public report(error: any): void {
        try {
            error.sentryId = captureException(error);

            // eslint-disable-next-line no-console
            console.error('Error reported to Sentry', error);
        } catch (reportingError) {
            // eslint-disable-next-line no-console
            console.error('Failed reporting an error to Sentry', error, reportingError);
        }
    }

    public registerListener(listener: ErrorsListener): void {
        this.listeners.push(listener);
    }

    public serialize(error: Error): SerializedError {
        const serializedError: SerializedError = {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };

        if (error instanceof UnauthorizedError) {
            const data: UnauthorizedErrorData = {
                url: error.url,
                responseStatus: error.responseStatus,
            };

            serializedError.errorClass = 'unauthorized';
            serializedError.errorData = data;
        } else if (error instanceof MalformedDocumentError) {
            const data: MalformedDocumentErrorData = {
                documentUrl: error.documentUrl,
                documentFormat: error.documentFormat,
                malformationDetails: error.malformationDetails,
            };

            serializedError.errorClass = 'malformed-document';
            serializedError.errorData = data;
        }

        return serializedError;
    }

    public parse(serializedError: SerializedError): Error {
        const resolveError = () => {
            switch (serializedError.errorClass) {
                case 'unauthorized': {
                    const data = serializedError.errorData as UnauthorizedErrorData;

                    return new UnauthorizedError(data.url, data.responseStatus);
                }
                case 'malformed-document': {
                    const data = serializedError.errorData as MalformedDocumentErrorData;

                    return new MalformedDocumentError(
                        data.documentUrl,
                        data.documentFormat,
                        data.malformationDetails,
                    );
                }
                default:
                    return new Error(serializedError.message);
            }
        };
        const error = resolveError();

        error.name = serializedError.name;
        error.stack = serializedError.stack;

        return error;
    }

    private userWantsReportingEnabled(): boolean {
        if (Storage.get(STORAGE_ENABLED_KEY, false))
            return true;

        const url = new URL(location.href);

        return ['1', 'true', 'on', 'yes'].includes(url.searchParams.get('error_reporting')!!);
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
