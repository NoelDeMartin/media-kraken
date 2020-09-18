import Soukai, { IndexedDBEngine } from 'soukai';

import Storage from '@/utils/Storage';

import MediaContainer from '@/models/soukai/MediaContainer';
import User from '@/models/users/User';

export interface OfflineUserJSON {
    offline: true;
}

export default class OfflineUser extends User<OfflineUserJSON> {

    public static isLoggedIn(): boolean {
        return Storage.get('media-kraken-offline-user', false);
    }

    public static isOfflineUserJSON(json: any): json is OfflineUserJSON {
        return 'offline' in json && json.offline;
    }

    constructor() {
        super('Browser Storage', null);
    }

    public async login(): Promise<void> {
        Storage.set('media-kraken-offline-user', true);
    }

    public async logout(): Promise<void> {
        const engine = Soukai.engine as IndexedDBEngine;

        if (Soukai.engine)
            await engine.purgeDatabase();

        Storage.remove('media-kraken-offline-user');
    }

    public initSoukaiEngine(): void {
        Soukai.useEngine(new IndexedDBEngine('media-kraken'));
    }

    public toJSON(): OfflineUserJSON {
        return { offline: true };
    }

    protected async getCachedMoviesContainer(): Promise<MediaContainer | null> {
        // TODO implement to leverage caching speed improvements in offline mode.

        return null;
    }

    protected async initMoviesContainer(): Promise<MediaContainer> {
        const moviesContainer = await MediaContainer.find<MediaContainer>('browser-storage://movies/');

        return moviesContainer
            || MediaContainer.at('browser-storage://').create({ name: 'Movies' });
    }

}
