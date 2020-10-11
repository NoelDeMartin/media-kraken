import Service from '@/services/Service';

import ModelsCache from '@/models/ModelsCache';

import Storage from '@/utils/Storage';

interface BrowserCapabilities {
    supportsIndexedDB: boolean;
}

export default class Browser extends Service {

    private capabilities!: BrowserCapabilities;

    public get supported(): boolean {
        return this.capabilities.supportsIndexedDB;
    }

    protected async boot(): Promise<void> {
        await super.boot();

        if (!Storage.has('media-kraken-browser-capabilities'))
            Storage.set('media-kraken-browser-capabilities', {
                supportsIndexedDB: await this.isIndexedDBSupported(),
            });

        this.capabilities = Storage.get('media-kraken-browser-capabilities');
    }

    private async isIndexedDBSupported(): Promise<boolean> {
        try {
            const stubUrl = 'browser-storage://capabilities-check';

            await ModelsCache.rememberDocument(stubUrl, new Date());
            await ModelsCache.forgetDocument(stubUrl);

            return true;
        } catch (e) {
            return false;
        }
    }

}
