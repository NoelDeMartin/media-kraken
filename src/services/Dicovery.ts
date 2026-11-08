import { Service } from '@aerogel/core';
import { facade } from '@noeldemartin/utils';

export class DicoveryService extends Service {
    protected async boot(): Promise<void> {
        // Events.on('auth:login', )
    }
}

export default facade(DicoveryService);
