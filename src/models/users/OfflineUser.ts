import Soukai, { IndexedDBEngine } from 'soukai';

import MediaContainer from '@/models/soukai/MediaContainer';
import User from '@/models/users/User';

export interface OfflineUserJSON {
    offline: true;
}

export default class OfflineUser extends User<OfflineUserJSON> {

    public static isOfflineUserJSON(json: any): json is OfflineUserJSON {
        return 'offline' in json && json.offline;
    }

    constructor() {
        super('Browser Storage', null, ['browser-storage://']);
    }

    public initSoukaiEngine(): void {
        Soukai.useEngine(new IndexedDBEngine('media-kraken'));
    }

    public clearClientData(): void {
        (Soukai.engine as IndexedDBEngine).purgeDatabase();
    }

    public toJSON(): OfflineUserJSON {
        return { offline: true };
    }

    protected async getMoviesContainer(storage: string): Promise<MediaContainer> {
        const moviesContainer = await MediaContainer.find<MediaContainer>(storage + 'movies/');

        return moviesContainer
            || MediaContainer.at(storage).create({ name: 'Movies' });
    }

}
