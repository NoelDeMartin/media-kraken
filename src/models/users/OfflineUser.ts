import { SolidDocument } from 'soukai-solid';
import Soukai, { IndexedDBEngine } from 'soukai';

import Storage from '@/utils/Storage';

import MediaContainer from '@/models/soukai/MediaContainer';
import User from '@/models/users/User';

export interface OfflineUserJSON {
    offline: true;
}

export default class OfflineUser extends User<OfflineUserJSON> {

    public static isLoggedIn(): boolean {
        return Storage.get('offline-user', false);
    }

    public static isOfflineUserJSON(json: any): json is OfflineUserJSON {
        return 'offline' in json && json.offline;
    }

    constructor() {
        super('Browser Storage', null);
    }

    public async login(): Promise<void> {
        Storage.set('offline-user', true);
    }

    public async logout(): Promise<void> {
        await (Soukai.engine as IndexedDBEngine).purgeDatabase();

        Storage.remove('offline-user');
    }

    public initSoukaiEngine(): void {
        Soukai.useEngine(new IndexedDBEngine('media-kraken'));
    }

    public toJSON(): OfflineUserJSON {
        return { offline: true };
    }

    protected async getMoviesContainerDocument(): Promise<SolidDocument | null> {
        // TODO implement this and add documents to container instance to
        // leverage caching speed improvements

        return null;
    }

    protected async initMoviesContainer(): Promise<MediaContainer> {
        const moviesContainer = await MediaContainer.find<MediaContainer>('browser-storage://movies/');

        return moviesContainer
            || MediaContainer.at('browser-storage://').create({ name: 'Movies' });
    }

}
