import Service from '@/services/Service';

import ModelsCache from '@/models/ModelsCache';
import Movie from '@/models/soukai/Movie';

import Storage from '@/utils/Storage';

interface BrowserCapabilities {
    supportsIndexedDB: boolean;
}

export default class Config extends Service {

    private capabilities!: BrowserCapabilities;

    public get supported(): boolean {
        return this.capabilities.supportsIndexedDB;
    }

    protected async init(): Promise<void> {
        await super.init();

        if (!Storage.has('media-kraken-browser-capabilities'))
            Storage.set('media-kraken-browser-capabilities', {
                supportsIndexedDB: await this.isIndexedDBSupported(),
            });

        this.capabilities = Storage.get('media-kraken-browser-capabilities');
    }

    private async isIndexedDBSupported(): Promise<boolean> {
        try {
            const movieStub = new Movie({ url: 'browser-storage://capabilities-check' });

            await ModelsCache.remember(movieStub);
            await ModelsCache.forget(movieStub.url);

            return true;
        } catch (e) {
            return false;
        }
    }

}
