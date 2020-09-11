import Service from '@/services/Service';

import Errors from '@/utils/Errors';
import Storage from '@/utils/Storage';

export default class Config extends Service {

    public environment!: string;

    public version!: string;

    public get isDevelopment(): boolean {
        return this.environment === 'development';
    }

    public get isReportingAvailable(): boolean {
        return Errors.isReportingAvailable;
    }

    public get isReportingEnabled(): boolean {
        return Errors.isReportingEnabled;
    }

    protected async init(): Promise<void> {
        await super.init();

        this.environment = process.env.NODE_ENV!;
        this.version = process.env.VUE_APP_VERSION + (this.isDevelopment ? '-next' : '');

        Storage.set('media-kraken-version', this.version);
    }

}
