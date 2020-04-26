import Soukai, { IndexedDBEngine } from 'soukai';

import MediaContainer from '@/models/soukai/MediaContainer';
import User from '@/models/users/User';

export interface OfflineUserJSON {
    name: string;
    avatar_url: string | null;
    storages: string[];
}

export default class OfflineUser extends User<OfflineUserJSON> {

    public static isOfflineUserJSON(json: object): json is OfflineUserJSON {
        return 'name' in json
            && 'avatar_url' in json
            && 'storages' in json;
    }

    public static fromJSON(json: OfflineUserJSON): OfflineUser {
        return new OfflineUser(json.name, json.avatar_url, json.storages);
    }

    constructor(
        name: string = 'Local (offline)',
        avatarUrl: string | null = null,
        storages: string[] = ['local/'],
    ) {
        super(name, avatarUrl, storages);
    }

    public initSoukaiEngine(): void {
        Soukai.useEngine(new IndexedDBEngine('media-kraken'));
    }

    public clearClientData(): void {
        (Soukai.engine as IndexedDBEngine).purgeDatabase();
    }

    public toJSON(): OfflineUserJSON {
        return {
            name: this.name,
            avatar_url: this.avatarUrl,
            storages: this.storages,
        };
    }

    protected async getMoviesContainer(storage: string): Promise<MediaContainer> {
        const moviesContainer = await MediaContainer.find<MediaContainer>(storage + 'movies/');

        return  moviesContainer
            || MediaContainer.at(storage).create({ name: 'Movies' });
    }

}
